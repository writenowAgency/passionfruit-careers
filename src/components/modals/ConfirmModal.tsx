import React from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onDismiss: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal: React.FC<Props> = ({
  visible,
  title,
  message,
  onConfirm,
  onDismiss,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onDismiss}
  >
    <Pressable style={styles.overlay} onPress={onDismiss}>
      <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#dc2626" />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.message}>{message}</Text>
        </View>

        <View style={styles.actions}>
          <Button
            onPress={onDismiss}
            mode="outlined"
            textColor="#666"
            style={styles.cancelButton}
          >
            {cancelText}
          </Button>
          <Button
            onPress={onConfirm}
            mode="contained"
            buttonColor="#dc2626"
            style={styles.confirmButton}
          >
            {confirmText}
          </Button>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  content: {
    marginBottom: 24,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6b7280',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#d1d5db',
  },
  confirmButton: {
    flex: 1,
  },
});
