import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Linking, Modal, TouchableOpacity } from 'react-native';
import { Card, Text, Button as PaperButton, ActivityIndicator, Chip, Divider, IconButton, Portal, Dialog, Button, Paragraph, Snackbar } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { profileApi, DocumentUpload } from '../../../services/profileApi';
import { fetchProfile } from '../../../store/slices/profileSlice';
import { PrimaryButton } from '@/components/common/PrimaryButton';

type DocumentType = 'cv' | 'cover_letter' | 'id_document' | 'certificate' | 'reference' | 'portfolio';

interface Document {
  id: number;
  documentType: DocumentType;
  documentName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  uploadedAt: string;
  updatedAt: string;
  description: string | null;
  isPrimary: boolean;
}

const DOCUMENT_TYPES: { type: DocumentType; label: string; icon: string; description: string }[] = [
  {
    type: 'cv',
    label: 'CV / Resume',
    icon: 'file-document',
    description: 'Upload your curriculum vitae or resume'
  },
  {
    type: 'cover_letter',
    label: 'Cover Letter',
    icon: 'file-edit',
    description: 'Upload your cover letter template'
  },
  {
    type: 'id_document',
    label: 'ID Document',
    icon: 'card-account-details',
    description: 'Upload identification document (optional)'
  },
  {
    type: 'certificate',
    label: 'Certificates',
    icon: 'certificate',
    description: 'Upload professional certificates'
  },
  {
    type: 'reference',
    label: 'References',
    icon: 'account-check',
    description: 'Upload reference letters'
  },
  {
    type: 'portfolio',
    label: 'Portfolio Items',
    icon: 'briefcase',
    description: 'Upload portfolio work samples'
  },
];

export function DocumentsManagerScreen() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  // Dialog & Feedback state
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{id: number, name: string} | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await profileApi.getDocuments(token);
      setDocuments(response.documents);
    } catch (error) {
      console.error('Load documents error:', error);
      setSnackbarMessage('Failed to load documents');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePickDocument = async (type: DocumentType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      if (!token) {
        setSnackbarMessage('Not authenticated');
        setSnackbarVisible(true);
        return;
      }

      const asset = result.assets[0];

      // Check file size (50MB max)
      const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
      if (asset.size && asset.size > MAX_FILE_SIZE) {
        setSnackbarMessage(`File too large. Please select a file smaller than 50MB.`);
        setSnackbarVisible(true);
        return;
      }

      setUploadingType(type);

      // For web, fetch the file as a blob and create a proper File object
      let fileToUpload: any;

      if (asset.uri.startsWith('blob:') || asset.uri.startsWith('http')) {
        // Web platform
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        fileToUpload = new File([blob], asset.name, { type: asset.mimeType || 'application/pdf' });
      } else {
        // Native platform
        fileToUpload = {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/pdf',
        };
      }

      // Create upload payload
      const upload: DocumentUpload = {
        documentType: type,
        file: fileToUpload,
        isPrimary: documents.filter(d => d.documentType === type).length === 0, // First document of type is primary
      };

      await profileApi.uploadDocument(token, upload);

      setSnackbarMessage('Document uploaded successfully');
      setSnackbarVisible(true);
      await loadDocuments();
      await dispatch(fetchProfile()).unwrap();
    } catch (error: any) {
      console.error('Upload document error:', error);
      setSnackbarMessage(error.message || 'Failed to upload document');
      setSnackbarVisible(true);
    } finally {
      setUploadingType(null);
    }
  };

  const handleDeleteDocument = (documentId: number, documentName: string) => {
    if (!token) return;
    setSelectedDocument({ id: documentId, name: documentName });
    setDeleteDialogVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !selectedDocument) return;

    setDeleteDialogVisible(false);
    try {
      await profileApi.deleteDocument(token, selectedDocument.id);
      setSnackbarMessage('Document deleted successfully');
      setSnackbarVisible(true);
      await loadDocuments();
      await dispatch(fetchProfile()).unwrap();
    } catch (error) {
      console.error('Delete document error:', error);
      setSnackbarMessage('Failed to delete document');
      setSnackbarVisible(true);
    } finally {
      setSelectedDocument(null);
    }
  };

  const handleOpenDocument = (fileUrl: string) => {
    console.log('Opening document:', fileUrl);

    if (!fileUrl) {
      setSnackbarMessage('Document URL not available');
      setSnackbarVisible(true);
      return;
    }

    // Open in modal with iframe
    setPdfUrl(fileUrl);
    setPdfModalVisible(true);
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDocumentsByType = (type: DocumentType): Document[] => {
    return documents.filter(d => d.documentType === type);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading documents...</Text>
      </View>
    );
  }

  return (
    <>
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Document Management</Text>
        <Text variant="bodyMedium" style={{ color: 'gray', marginTop: 8 }}>
          Upload and manage your professional documents
        </Text>
      </View>

      {DOCUMENT_TYPES.map((docType) => {
        const typeDocuments = getDocumentsByType(docType.type);

        return (
          <Card key={docType.type} style={styles.card}>
            <Card.Title
              title={docType.label}
              subtitle={docType.description}
              left={(props) => <IconButton {...props} icon={docType.icon} />}
            />
            <Card.Content>
              {typeDocuments.length > 0 ? (
                <View>
                  {typeDocuments.map((doc) => (
                    <View key={doc.id} style={styles.documentItem}>
                      <View style={styles.documentInfo}>
                        <View style={{ flex: 1 }}>
                          <Text variant="titleSmall">{doc.documentName}</Text>
                          <Text variant="bodySmall" style={{ color: 'gray' }}>
                            {formatFileSize(doc.fileSize)} • {formatDate(doc.uploadedAt)}
                          </Text>
                          {doc.description && (
                            <Text variant="bodySmall" style={{ color: 'gray', marginTop: 4 }}>
                              {doc.description}
                            </Text>
                          )}
                          {doc.isPrimary && (
                            <Chip mode="flat" compact style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                              Primary
                            </Chip>
                          )}
                        </View>
                        <View style={styles.documentActions}>
                          <IconButton
                            icon="eye"
                            size={20}
                            onPress={() => handleOpenDocument(doc.fileUrl)}
                          />
                          <IconButton
                            icon="delete"
                            size={20}
                            iconColor="red"
                            onPress={() => handleDeleteDocument(doc.id, doc.documentName)}
                          />
                        </View>
                      </View>
                      <Divider style={{ marginTop: 8 }} />
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ color: 'gray', marginBottom: 12 }}>
                  No {docType.label.toLowerCase()} uploaded yet
                </Text>
              )}

              <PrimaryButton
                onPress={() => handlePickDocument(docType.type)}
                disabled={uploadingType !== null}
                mode="outlined"
                style={{ marginTop: 8 }}
              >
                {uploadingType === docType.type ? 'Uploading...' : `Upload ${docType.label}`}
              </PrimaryButton>
            </Card.Content>
          </Card>
        );
      })}

      <View style={{ marginBottom: 32 }} />
    </ScrollView>

    <Modal
      visible={pdfModalVisible}
      onRequestClose={() => setPdfModalVisible(false)}
      animationType="slide"
      transparent={false}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text variant="titleLarge">Document Viewer</Text>
          <TouchableOpacity
            onPress={() => setPdfModalVisible(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="PDF Viewer"
          />
        )}
      </View>
    </Modal>

    <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Close',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Document</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to delete "{selectedDocument?.name}"?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteConfirm} textColor="#d32f2f">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  documentItem: {
    marginBottom: 8,
  },
  documentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  documentActions: {
    flexDirection: 'row',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
  },
  closeButton: {
    padding: 8,
  },
});
