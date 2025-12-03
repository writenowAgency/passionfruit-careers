import React from 'react';
import { Portal, Dialog, Button, Text } from 'react-native-paper';

interface Props {
  visible: boolean;
  planName: string;
  amount: string;
  onPay: () => void;
  onDismiss: () => void;
}

export const PaymentModal: React.FC<Props> = ({ visible, planName, amount, onPay, onDismiss }) => (
  <Portal>
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>PayFast Checkout</Dialog.Title>
      <Dialog.Content>
        <Text>Plan: {planName}</Text>
        <Text>Total: {amount}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Cancel</Button>
        <Button onPress={onPay}>Pay now</Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
);
