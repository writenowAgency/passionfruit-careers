import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreditsScreen from '@/screens/employer/credits/CreditsScreen';
import PurchaseCredits from '@/screens/employer/credits/PurchaseCredits';
import UsageHistory from '@/screens/employer/credits/UsageHistory';

const Stack = createNativeStackNavigator();

export const EmployerCreditsNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Credits" component={CreditsScreen} options={{ title: 'Credits' }} />
    <Stack.Screen name="PurchaseCredits" component={PurchaseCredits} options={{ title: 'Purchase' }} />
    <Stack.Screen name="UsageHistory" component={UsageHistory} options={{ title: 'History' }} />
  </Stack.Navigator>
);
