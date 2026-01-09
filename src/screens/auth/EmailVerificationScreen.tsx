import React from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { Text } from 'react-native-paper';

const EmailVerificationScreen: React.FC = () => {
  const [otp, setOtp] = React.useState('');

  return (
    <View style={{ flex: 1, padding: 24, gap: 16 }}>
      <Text variant="headlineMedium">Verify email</Text>
      <Text>Enter the 6-digit code sent to your email.</Text>
      <TextInput
        mode="outlined"
        keyboardType="number-pad"
        value={otp}
        onChangeText={(value) => setOtp(value.slice(0, 6))}
        maxLength={6}
      />
      <PrimaryButton onPress={() => {}}>Verify</PrimaryButton>
    </View>
  );
};

export default EmailVerificationScreen;
