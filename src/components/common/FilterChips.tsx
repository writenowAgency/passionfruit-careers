import React from 'react';
import { Chip } from 'react-native-paper';

interface Props {
  filters: string[];
  active: string[];
  onToggle: (value: string) => void;
}

export const FilterChips: React.FC<Props> = ({ filters, active, onToggle }) => (
  <>
    {filters.map((filter) => (
      <Chip
        key={filter}
        selected={active.includes(filter)}
        onPress={() => onToggle(filter)}
        style={{ marginRight: 8, marginBottom: 8 }}
      >
        {filter}
      </Chip>
    ))}
  </>
);
