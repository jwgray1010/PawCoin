import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AccessibilityInfo } from 'react-native';
import ParentHomeScreen from '../screens/Parent/ParentHomeScreen';
import WalletScreen from '../screens/Parent/WalletScreen';
import ParentChoresScreen from '../screens/Parent/ParentChoresScreen';
import ParentARSetupScreen from '../screens/Parent/ParentARSetupScreen';
import QRscanner from '../components/QRscanner';
import RewardModal from '../components/RewardModal';

const Stack = createStackNavigator();

/**
 * ParentNavigator - Handles parent's navigation stack.
 * Announces screen changes for accessibility.
 */
export default function ParentNavigator() {
  // Announce screen changes for accessibility
  const handleStateChange = (state) => {
    const route = state?.routes?.[state.index];
    if (route && route.name) {
      AccessibilityInfo.announceForAccessibility(`${route.name} screen`);
    }
  };

  return (
    <Stack.Navigator
      initialRouteName="ParentHome"
      screenOptions={{
        headerShown: false,
      }}
      onStateChange={handleStateChange}
    >
      <Stack.Screen name="ParentHome" component={ParentHomeScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="ParentChores" component={ParentChoresScreen} />
      {/* <Stack.Screen name="ParentWallet" component={ParentWalletScreen} /> */}
      <Stack.Screen name="ParentARSetup" component={ParentARSetupScreen} />
      <Stack.Screen name="QRscanner" component={QRscanner} />
      <Stack.Screen name="RewardModal" component={RewardModal} />
    </Stack.Navigator>
  );
}