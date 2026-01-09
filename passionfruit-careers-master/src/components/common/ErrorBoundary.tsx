import React from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('App crashed', error);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
          <Text variant="titleLarge">Something went wrong</Text>
          <Text variant="bodyMedium" style={{ marginVertical: 12 }}>
            We have logged the error and our engineers are on it.
          </Text>
          <Button mode="contained" onPress={this.handleReset}>
            Try again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}
