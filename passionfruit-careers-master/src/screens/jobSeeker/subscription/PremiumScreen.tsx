import React from 'react';
import { ScrollView } from 'react-native';
import { Card, Text, List } from 'react-native-paper';
import { PaymentModal } from '@/components/modals/PaymentModal';
import { PrimaryButton } from '@/components/common/PrimaryButton';

const perks = ['AI auto-apply (3 jobs/day)', 'Priority match recalculations', 'Unlimited cover letters'];

const PremiumScreen: React.FC = () => {
  const [visible, setVisible] = React.useState(false);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Card>
        <Card.Content>
          <Text variant="headlineMedium">Passionfruit Premium</Text>
          <Text variant="bodyMedium" style={{ marginVertical: 12 }}>
            Unlock automation and insights that employers love.
          </Text>
          {perks.map((perk) => (
            <List.Item key={perk} title={perk} left={(props) => <List.Icon {...props} icon="check" />} />
          ))}
          <PrimaryButton onPress={() => setVisible(true)} style={{ marginTop: 12 }}>
            Upgrade for R199 / mo
          </PrimaryButton>
        </Card.Content>
      </Card>
      <PaymentModal
        visible={visible}
        planName="Premium"
        amount="R199"
        onPay={() => setVisible(false)}
        onDismiss={() => setVisible(false)}
      />
    </ScrollView>
  );
};

export default PremiumScreen;
