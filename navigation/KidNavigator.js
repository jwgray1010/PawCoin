import React, { useState, useRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Button, AccessibilityInfo } from 'react-native';
import KidHomeScreen from '../screens/Kid/KidHomeScreen';
import KidChoresScreen from '../screens/Kid/KidChoresScreen';
import KidWalletScreen from '../screens/Kid/KidWalletScreen';
import QRscanner from '../components/QRscanner';
import RewardModal from '../components/RewardModal';
import FetchGameScreen from '../screens/Kid/FetchGameScreen';
import BarkleyARScreen from '../screens/Kid/BarkleyARScreen';

const Stack = createStackNavigator();

/**
 * KidNavigator - Handles kid's navigation stack.
 * Announces screen changes for accessibility.
 */
export default function KidNavigator() {
  // Announce screen changes for accessibility
  const handleStateChange = (state) => {
    const route = state?.routes?.[state.index];
    if (route && route.name) {
      AccessibilityInfo.announceForAccessibility(`${route.name} screen`);
    }
  };

  return (
    <Stack.Navigator
      initialRouteName="KidHome"
      screenOptions={{
        headerShown: false,
      }}
      onStateChange={handleStateChange}
    >
      <Stack.Screen name="KidHome" component={KidHomeScreen} />
      <Stack.Screen name="KidChores" component={KidChoresScreen} />
      <Stack.Screen name="KidWallet" component={KidWalletScreen} />
      <Stack.Screen name="QRscanner" component={QRscanner} />
      <Stack.Screen name="RewardModal" component={RewardModal} />
      <Stack.Screen name="FetchGameScreen" component={FetchGameScreen} />
      <Stack.Screen name="BarkleyARScreen" component={BarkleyARScreen} />
    </Stack.Navigator>
  );
}

// Inside your FetchGameScreen's render, when the game is active:
{gameActive && (
  <Button title="End Game" onPress={() => {
    setGameActive(false);
    clearInterval(timerRef.current);
    setHighScore(h => Math.max(h, score));
  }} />
)}