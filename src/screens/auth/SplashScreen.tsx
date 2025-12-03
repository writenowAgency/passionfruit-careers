import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from 'react-native-paper';
import { PassionfruitLogo } from '@/components/common/PassionfruitLogo';
import { colors } from '@/theme/colors';
import { AuthStackParamList } from '@/navigation/types';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  React.useEffect(() => {
    const timeout = setTimeout(() => navigation.replace('Welcome'), 1500);
    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <PassionfruitLogo size={120} />
      <Text variant="headlineMedium" style={{ color: colors.seeds, marginTop: 24 }}>
        Passionfruit Careers
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});

export default SplashScreen;
