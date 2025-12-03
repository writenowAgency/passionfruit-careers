import React from 'react';
import { Button, ButtonProps } from 'react-native-paper';

export const PrimaryButton: React.FC<ButtonProps> = ({ children, ...rest }) => (
  <Button mode="contained" contentStyle={{ paddingVertical: 6 }} style={{ borderRadius: 12 }} {...rest}>
    {children}
  </Button>
);
