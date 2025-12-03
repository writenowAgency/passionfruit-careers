import React from 'react';
import { Portal, Dialog, Button, Switch, Text } from 'react-native-paper';

interface Props {
  visible: boolean;
  filters: Record<string, boolean>;
  onToggle: (key: string) => void;
  onDismiss: () => void;
}

export const FilterModal: React.FC<Props> = ({ visible, filters, onToggle, onDismiss }) => (
  <Portal>
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>Filters</Dialog.Title>
      <Dialog.Content>
        {Object.entries(filters).map(([key, value]) => (
          <React.Fragment key={key}>
            <Text>{key}</Text>
            <Switch value={value} onValueChange={() => onToggle(key)} />
          </React.Fragment>
        ))}
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Done</Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
);
