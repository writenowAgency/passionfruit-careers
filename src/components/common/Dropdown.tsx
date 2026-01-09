import React from 'react';
import { Menu, Button } from 'react-native-paper';

interface Props {
  label: string;
  options: string[];
  selected?: string;
  onSelect: (value: string) => void;
}

export const Dropdown: React.FC<Props> = ({ label, options, selected, onSelect }) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={<Button onPress={() => setVisible(true)}>{selected || label}</Button>}
    >
      {options.map((option) => (
        <Menu.Item
          key={option}
          onPress={() => {
            onSelect(option);
            setVisible(false);
          }}
          title={option}
        />
      ))}
    </Menu>
  );
};
