import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { colors } from '@/theme';
import { InputField } from '@/components/common/InputField';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { ProgressBar } from '@/components/common/ProgressBar';

const schema = yup.object({
  title: yup.string().required(),
  location: yup.string().required(),
  description: yup.string().min(20).required(),
  requirements: yup.string().required(),
});

const steps = ['Basics', 'Description', 'Requirements', 'Settings'];

type FormValues = yup.InferType<typeof schema>;

const PostJobWizard: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { title: '', location: '', description: '', requirements: '' },
  });

  const goNext = handleSubmit(() => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  });

  const goBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 16, backgroundColor: colors.background }}>
      <Text variant="headlineMedium">Post a job</Text>
      <ProgressBar progress={(activeStep + 1) / steps.length} label={steps[activeStep]} />

      {activeStep === 0 && (
        <>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <InputField label="Job title" {...field} errorMessage={errors.title?.message} />
            )}
          />
          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <InputField label="Location" {...field} errorMessage={errors.location?.message} />
            )}
          />
        </>
      )}

      {activeStep === 1 && (
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <RichTextEditor label="Description" value={field.value} onChangeText={field.onChange} />
          )}
        />
      )}

      {activeStep === 2 && (
        <Controller
          control={control}
          name="requirements"
          render={({ field }) => (
            <RichTextEditor label="Requirements" value={field.value} onChangeText={field.onChange} />
          )}
        />
      )}

      {activeStep === 3 && (
        <Text>Configure screening questions and expiry (coming soon).</Text>
      )}

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <SecondaryButton onPress={goBack} disabled={activeStep === 0}>
          Back
        </SecondaryButton>
        <PrimaryButton onPress={goNext}>
          {activeStep === steps.length - 1 ? 'Publish' : 'Next'}
        </PrimaryButton>
      </View>
    </View>
  );
};

export default PostJobWizard;
