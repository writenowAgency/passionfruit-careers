import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { FileUploader } from '@/components/common/FileUploader';
import { useAppDispatch } from '@/store/hooks';
// import { addDocument } from '@/store/slices/profileSlice';
import { ScreenContainer } from '@/components/common/ScreenContainer';

/**
 * Example screen showing how to use Cloudflare R2 storage
 * for CV/document uploads
 */
const CVUploadExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; url: string; key: string }>
  >([]);

  const handleUploadComplete = (fileUrl: string, key: string) => {
    const fileName = key.split('/').pop() || 'document.pdf';

    // Add to local state
    setUploadedFiles((prev) => [
      ...prev,
      { name: fileName, url: fileUrl, key },
    ]);

    // Add to Redux store
    // dispatch(
    //   addDocument({
    //     id: key,
    //     name: fileName,
    //   })
    // );

    Alert.alert('Success', 'File uploaded successfully!');
  };

  const handleError = (error: string) => {
    Alert.alert('Upload Failed', error);
  };

  return (
    <ScreenContainer title="Upload CV">
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              Upload Your CV
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Upload your CV or resume. Supported formats: PDF, DOC, DOCX (max 10MB)
            </Text>

            <FileUploader
              category="cvs"
              label="Choose your CV/Resume"
              onUploadComplete={handleUploadComplete}
              onError={handleError}
              maxSizeMB={10}
              allowedTypes={['pdf', 'doc', 'docx']}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              Upload Profile Image
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Upload your profile picture. Supported formats: JPG, PNG, WEBP (max 5MB)
            </Text>

            <FileUploader
              category="images"
              label="Choose profile picture"
              onUploadComplete={handleUploadComplete}
              onError={handleError}
              maxSizeMB={5}
              allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              Upload Certificates
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Upload certificates, diplomas, or qualifications
            </Text>

            <FileUploader
              category="certificates"
              label="Choose certificate"
              onUploadComplete={handleUploadComplete}
              onError={handleError}
            />
          </Card.Content>
        </Card>

        {uploadedFiles.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.title}>
                Uploaded Files ({uploadedFiles.length})
              </Text>
              {uploadedFiles.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  <Chip icon="file-document" style={styles.chip}>
                    {file.name}
                  </Chip>
                  <Button
                    mode="text"
                    onPress={() => {
                      // Open file URL in browser
                      window.open(file.url, '_blank');
                    }}
                  >
                    View
                  </Button>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.infoTitle}>
              ℹ️ Storage Information
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • Files are stored securely in Cloudflare R2
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • All uploads are encrypted
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • Files are organized by category and user
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • You can delete files anytime from your profile
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
  },
  title: {
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    marginBottom: 16,
    color: '#666',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingVertical: 4,
  },
  chip: {
    flex: 1,
    marginRight: 8,
  },
  infoCard: {
    backgroundColor: '#FFF9E6',
    borderColor: '#F4E04D',
    borderWidth: 1,
  },
  infoTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  infoText: {
    marginTop: 4,
    color: '#666',
  },
});

export default CVUploadExample;
