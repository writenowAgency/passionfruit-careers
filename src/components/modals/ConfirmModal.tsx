import React from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

export const ConfirmModal: React.FC<Props> = ({ visible, title, message, onConfirm, onDismiss }) => (
  <Portal>
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Content>
        <Text>{message}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Cancel</Button>
        <Button onPress={onConfirm}>Confirm</Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
);
