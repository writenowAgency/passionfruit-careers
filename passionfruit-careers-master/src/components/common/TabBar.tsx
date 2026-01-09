import React from 'react';
import { View } from 'react-native';
import { Chip } from 'react-native-paper';

interface Props {
  tabs: string[];
  active: string;
  onChange: (value: string) => void;
}

export const TabBar: React.FC<Props> = ({ tabs, active, onChange }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
    {tabs.map((tab) => (
      <Chip key={tab} selected={tab === active} onPress={() => onChange(tab)}>
        {tab}
      </Chip>
    ))}
  </View>
);
