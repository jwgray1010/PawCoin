import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AccessibilityInfo } from 'react-native';
import SignInScreen from '../screens/Onboarding/SignInScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import ParentSignUp from '../screens/Onboarding/ParentSignUp';
import KidSignUp from '../screens/Onboarding/KidSignUp';
import RoleSelectScreen from '../screens/Onboarding/RoleSelectScreen';

const Stack = createStackNavigator();

/**
 * AuthNavigator - Handles authentication and onboarding navigation.
 * Announces screen changes for accessibility.
 */
export default function AuthNavigator() {
  // Announce screen changes for accessibility
  const handleStateChange = (state) => {
    const route = state?.routes?.[state.index];
    if (route && route.name) {
      AccessibilityInfo.announceForAccessibility(`${route.name} screen`);
    }
  };

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
      onStateChange={handleStateChange}
    >
      <Stack.Screen name="Login" component={SignInScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="ParentSignUp" component={ParentSignUp} />
      <Stack.Screen name="KidSignUp" component={KidSignUp} />
    </Stack.Navigator>
  );
}