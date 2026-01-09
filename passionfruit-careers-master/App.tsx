import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { Inter_400Regular } from '@expo-google-fonts/inter';
import RootNavigator from '@/navigation/RootNavigator';
import { AppProviders } from '@/providers/AppProviders';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { useAppDispatch } from '@/store/hooks';
import { bootstrapAuth } from '@/store/slices/authSlice';
import { scheduleDailySummaryNotification } from '@/services/notifications';
import { AnalyticsService } from '@/services/analytics';

const AppContent = () => {
  const offline = useOfflineStatus();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(bootstrapAuth());
    void AnalyticsService.init();
    void scheduleDailySummaryNotification();
  }, [dispatch]);

  return (
    <>
      <OfflineBanner visible={offline} />
      <RootNavigator />
      <StatusBar style="dark" />
    </>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    'Inter-Regular': Inter_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <GestureHandlerRootView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </GestureHandlerRootView>
  );
}
