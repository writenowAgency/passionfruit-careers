import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputField } from '@/components/common/InputField';
import { PrimaryButton } from '@/components/common/PrimaryButton';

const schema = yup.object({ email: yup.string().email().required() });

type FormValues = yup.InferType<typeof schema>;

const ForgotPasswordScreen: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const onSubmit = handleSubmit(() => new Promise((resolve) => setTimeout(resolve, 1000)));

  return (
    <View style={{ flex: 1, padding: 24, gap: 16 }}>
      <Text variant="headlineMedium">Reset password</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <InputField label="Email" value={value} onChangeText={onChange} errorMessage={errors.email?.message} />
        )}
      />
      <PrimaryButton onPress={onSubmit} loading={isSubmitting}>
        Send verification code
      </PrimaryButton>
      {isSubmitSuccessful ? <Text>Check your inbox for the OTP.</Text> : null}
    </View>
  );
};

export default ForgotPasswordScreen;
