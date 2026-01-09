import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { passionfruitTheme, navigationTheme } from '@/theme';
import { store } from '@/store';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { linking } from '@/navigation/linking';

interface Props {
  children: React.ReactNode;
}

export const AppProviders: React.FC<Props> = ({ children }) => (
  <ReduxProvider store={store}>
    <PaperProvider theme={passionfruitTheme}>
      <NavigationContainer theme={navigationTheme} linking={linking}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </NavigationContainer>
    </PaperProvider>
  </ReduxProvider>
);
