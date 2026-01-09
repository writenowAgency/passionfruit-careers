import React from 'react';
import { ActivityIndicator } from 'react-native-paper';
import { colors } from '../../theme/colors';

interface Props {
  size?: 'small' | 'large';
}

export const LoadingSpinner: React.FC<Props> = ({ size = 'large' }) => (
  <ActivityIndicator animating color={colors.primary} size={size} />
);
