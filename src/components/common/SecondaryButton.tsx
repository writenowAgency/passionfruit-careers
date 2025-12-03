import React from 'react';
import { Button, ButtonProps } from 'react-native-paper';

export const SecondaryButton: React.FC<ButtonProps> = ({ children, ...rest }) => (
  <Button
    mode="outlined"
    textColor="#2E2E2E"
    style={{ borderRadius: 12, borderColor: '#E0E0E0' }}
    {...rest}
  >
    {children}
  </Button>
);
