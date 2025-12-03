import React from 'react';
import { ScrollView } from 'react-native';
import { Card, Text, Switch, Chip } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateSettings } from '@/store/slices/aiSlice';
import { colors } from '@/theme/colors';
import { PrimaryButton } from '@/components/common/PrimaryButton';

const AIAutoApplyScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.ai.settings);
  const summary = useAppSelector((state) => state.ai.dailySummary);

  const setSetting = (patch: Partial<typeof settings>) => dispatch(updateSettings(patch));

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Card style={{ borderRadius: 24 }}>
        <Card.Content>
          <Text variant="titleLarge">AI Auto-Apply</Text>
          <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
            Let our AI submit high-match roles while you focus on interviews.
          </Text>
          <Switch
            value={settings.enabled}
            onValueChange={(value) => setSetting({ enabled: value })}
            color={colors.primary}
          />
          {settings.enabled ? (
            <>
              <Text style={{ marginTop: 16 }}>Applications per day: {settings.dailyLimit}</Text>
              <Slider
                minimumValue={1}
                maximumValue={3}
                step={1}
                value={settings.dailyLimit}
                onValueChange={(value) => setSetting({ dailyLimit: Math.round(value) })}
                minimumTrackTintColor={colors.primary}
              />
              <Text>Minimum match score: {settings.minimumMatch}%</Text>
              <Slider
                minimumValue={60}
                maximumValue={95}
                step={5}
                value={settings.minimumMatch}
                onValueChange={(value) => setSetting({ minimumMatch: Math.round(value) })}
                minimumTrackTintColor={colors.accent}
              />
            </>
          ) : null}
        </Card.Content>
      </Card>

      <Card>
        <Card.Title title="Excluded companies" subtitle="AI will skip these brands" />
        <Card.Content>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {settings.excludedCompanies.length ? (
              settings.excludedCompanies.map((company) => (
                <Chip key={company} style={{ marginRight: 8 }}>
                  {company}
                </Chip>
              ))
            ) : (
              <Text variant="bodyMedium">None configured yet.</Text>
            )}
          </ScrollView>
          <PrimaryButton style={{ marginTop: 12 }} onPress={() => setSetting({ excludedCompanies: ['MyCorp'] })}>
            Add company
          </PrimaryButton>
        </Card.Content>
      </Card>

      <Card>
        <Card.Title title="Today" subtitle="Auto submissions" />
        <Card.Content>
          {summary.length ? (
            summary.map((item) => (
              <Text key={item.jobId} style={{ marginBottom: 8 }}>
                {item.title} - {item.status}
              </Text>
            ))
          ) : (
            <Text>No auto applications yet today.</Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default AIAutoApplyScreen;
