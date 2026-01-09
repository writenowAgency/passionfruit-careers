import React from 'react';
import { TextInput, HelperText, TextInputProps } from 'react-native-paper';

interface Props extends TextInputProps {
  errorMessage?: string;
}

export const InputField: React.FC<Props> = ({ errorMessage, ...rest }) => (
  <>
    <TextInput mode="outlined" {...rest} />
    {errorMessage ? (
      <HelperText type="error" visible>
        {errorMessage}
      </HelperText>
    ) : null}
  </>
);
