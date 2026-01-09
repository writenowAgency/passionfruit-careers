import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { PassionfruitLogo } from '@/components/common/PassionfruitLogo';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { AuthStackParamList } from '@/navigation/types';
import { useAppDispatch } from '@/store/hooks';
import { setRole } from '@/store/slices/authSlice';

const roleOptions = [
  { label: 'I am a job seeker', value: 'jobSeeker' },
  { label: 'I am an employer', value: 'employer' },
] as const;

type RoleOption = (typeof roleOptions)[number]['value'];

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [role, setRoleState] = React.useState<RoleOption>('jobSeeker');
  const dispatch = useAppDispatch();

  const continueToRegister = () => {
    dispatch(setRole(role));
    navigation.navigate('Register', { role });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 24 }}>
      <View style={{ alignItems: 'center' }}>
        <PassionfruitLogo size={96} />
        <Text variant="headlineMedium" style={{ marginTop: 16 }}>
          Welcome to Passionfruit Careers
        </Text>
        <Text style={{ textAlign: 'center', marginTop: 8 }}>
          Intelligent job matching with AI auto-apply superpowers.
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {roleOptions.map((option) => (
          <Button
            key={option.value}
            mode={role === option.value ? 'contained' : 'outlined'}
            onPress={() => setRoleState(option.value)}
            accessibilityRole="radio"
          >
            {option.label}
          </Button>
        ))}
      </View>

      <PrimaryButton onPress={continueToRegister}>Continue</PrimaryButton>
      <SecondaryButton onPress={() => navigation.navigate('Login')}>
        I already have an account
      </SecondaryButton>
    </View>
  );
};

export default WelcomeScreen;
