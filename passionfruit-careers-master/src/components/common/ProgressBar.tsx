import React from 'react';
import { ProgressBar as PaperProgressBar, Text } from 'react-native-paper';

interface Props {
  progress: number;
  label?: string;
}

export const ProgressBar: React.FC<Props> = ({ progress, label }) => (
  <>
    {label ? <Text variant="bodySmall">{label}</Text> : null}
    <PaperProgressBar progress={progress} style={{ marginVertical: 8, borderRadius: 12 }} />
  </>
);
