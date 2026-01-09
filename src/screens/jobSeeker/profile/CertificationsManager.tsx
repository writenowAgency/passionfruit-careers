import React, { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Card, Text, TextInput, IconButton } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProfile } from '@/store/slices/profileSlice';
import { profileApi } from '@/services/profileApi';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';

const CertificationsManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: profile } = useAppSelector((state) => state.profile);
  const auth = useAppSelector((state) => state.auth);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [certificationName, setCertificationName] = useState('');
  const [issuingOrganization, setIssuingOrganization] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setCertificationName('');
    setIssuingOrganization('');
    setIssueDate('');
    setExpiryDate('');
    setCredentialId('');
    setCredentialUrl('');
    setDescription('');
  };

  const handleAdd = async () => {
    if (!certificationName.trim() || !issuingOrganization.trim() || !issueDate.trim()) {
      Alert.alert('Error', 'Please fill in certification name, issuing organization, and issue date');
      return;
    }

    setLoading(true);
    try {
      await profileApi.addCertification(auth.token!, {
        certificationName: certificationName.trim(),
        issuingOrganization: issuingOrganization.trim(),
        issueDate,
        expiryDate: expiryDate || undefined,
        credentialId: credentialId.trim() || undefined,
        credentialUrl: credentialUrl.trim() || undefined,
        description: description.trim() || undefined,
      });

      Alert.alert('Success', 'Certification added successfully');
      resetForm();
      setShowForm(false);
      dispatch(fetchProfile());
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add certification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (certificationId: number) => {
    Alert.alert(
      'Delete Certification',
      'Are you sure you want to delete this certification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await profileApi.removeCertification(auth.token!, certificationId);
              Alert.alert('Success', 'Certification deleted');
              dispatch(fetchProfile());
            } catch (error) {
              Alert.alert('Error', 'Failed to delete certification');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Card>
        <Card.Content>
          <Text variant="headlineSmall" style={{ marginBottom: 16 }}>Certifications</Text>
          <Text variant="bodyMedium" style={{ marginBottom: 16, color: 'gray' }}>Add your professional certifications</Text>
          {!showForm && <PrimaryButton onPress={() => setShowForm(true)}>Add Certification</PrimaryButton>}
        </Card.Content>
      </Card>

      {showForm && (
        <Card>
          <Card.Content style={{ gap: 12 }}>
            <Text variant="titleMedium">New Certification</Text>
            <TextInput label="Certification Name *" value={certificationName} onChangeText={setCertificationName} mode="outlined" placeholder="e.g., AWS Solutions Architect" />
            <TextInput label="Issuing Organization *" value={issuingOrganization} onChangeText={setIssuingOrganization} mode="outlined" placeholder="e.g., Amazon Web Services" />
            <TextInput label="Issue Date * (YYYY-MM-DD)" value={issueDate} onChangeText={setIssueDate} mode="outlined" placeholder="2022-06-15" />
            <TextInput label="Expiry Date (YYYY-MM-DD)" value={expiryDate} onChangeText={setExpiryDate} mode="outlined" placeholder="2025-06-15" />
            <TextInput label="Credential ID" value={credentialId} onChangeText={setCredentialId} mode="outlined" placeholder="e.g., AWS-123456" />
            <TextInput label="Credential URL" value={credentialUrl} onChangeText={setCredentialUrl} mode="outlined" placeholder="https://..." />
            <TextInput label="Description" value={description} onChangeText={setDescription} mode="outlined" multiline numberOfLines={3} placeholder="Describe the certification..." />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <View style={{ flex: 1 }}><PrimaryButton onPress={handleAdd} loading={loading}>Add Certification</PrimaryButton></View>
              <View style={{ flex: 1 }}><SecondaryButton onPress={() => { setShowForm(false); resetForm(); }} disabled={loading}>Cancel</SecondaryButton></View>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>Your Certifications ({profile?.certifications?.length || 0})</Text>
          {profile?.certifications && profile.certifications.length > 0 ? (
            profile.certifications.map((cert) => (
              <Card key={cert.id} style={{ marginBottom: 12 }}>
                <Card.Content>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium">{cert.certificationName}</Text>
                      <Text variant="bodyMedium">{cert.issuingOrganization}</Text>
                      <Text variant="bodySmall" style={{ color: 'gray', marginTop: 4 }}>
                        Issued: {new Date(cert.issueDate).toLocaleDateString()}
                        {cert.expiryDate && ` • Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                      </Text>
                      {cert.credentialId && <Text variant="bodySmall" style={{ color: 'gray' }}>ID: {cert.credentialId}</Text>}
                      {cert.description && <Text variant="bodySmall" style={{ marginTop: 8 }}>{cert.description}</Text>}
                    </View>
                    <IconButton icon="delete" size={20} onPress={() => handleDelete(cert.id)} />
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={{ color: 'gray' }}>No certifications added yet</Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default CertificationsManager;
