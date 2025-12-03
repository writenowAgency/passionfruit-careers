import React from 'react';
import { Portal, Dialog, Button, Text } from 'react-native-paper';
import { PassionfruitLogo } from '../common/PassionfruitLogo';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
}

export const SuccessModal: React.FC<Props> = ({ visible, title, message, onDismiss }) => (
  <Portal>
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Content style={{ alignItems: 'center' }}>
        <PassionfruitLogo size={64} />
        <Text variant="titleLarge" style={{ marginTop: 16 }}>
          {title}
        </Text>
        <Text style={{ marginTop: 8, textAlign: 'center' }}>{message}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Awesome!</Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
);
