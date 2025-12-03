import React from 'react';
import { View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Text } from 'react-native-paper';
import { InputField } from '@/components/common/InputField';
import { PrimaryButton } from '@/components/common/PrimaryButton';

const PaymentScreen: React.FC = () => {
  const {
    control,
    handleSubmit,
  } = useForm({ defaultValues: { name: '', number: '', cvc: '' } });

  const onSubmit = handleSubmit(() => {});

  return (
    <View style={{ flex: 1, padding: 24, gap: 12 }}>
      <Text variant="headlineMedium">PayFast checkout</Text>
      <Controller control={control} name="name" render={({ field }) => <InputField label="Name on card" {...field} />} />
      <Controller control={control} name="number" render={({ field }) => <InputField label="Card number" keyboardType="number-pad" {...field} />} />
      <Controller control={control} name="cvc" render={({ field }) => <InputField label="CVC" keyboardType="number-pad" {...field} />} />
      <PrimaryButton onPress={onSubmit}>Pay now</PrimaryButton>
    </View>
  );
};

export default PaymentScreen;
