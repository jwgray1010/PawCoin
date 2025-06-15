import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import KidNavigator from './KidNavigator';
import ParentNavigator from './ParentNavigator';
import { useAuth } from '../contexts/AuthContext';
import { useUserType } from '../contexts/UserTypeContext';
import { AccessibilityInfo, View, ActivityIndicator, Text } from 'react-native';

const Stack = createStackNavigator();

export default function MainNavigator() {
  const { user, initializing } = useAuth();
  const { userType } = useUserType();

  // Accessibility: Announce navigation changes
  useEffect(() => {
    if (initializing) return;
    if (!user) {
      AccessibilityInfo.announceForAccessibility('Authentication required');
    } else if (userType === 'parent') {
      AccessibilityInfo.announceForAccessibility('Parent dashboard');
    } else if (userType === 'kid') {
      AccessibilityInfo.announceForAccessibility('Kid dashboard');
    } else {
      AccessibilityInfo.announceForAccessibility('Unknown user type');
    }
  }, [user, userType, initializing]);

  if (initializing) {
    // Optionally show a splash/loading screen here
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0288d1" />
        <Text style={{ marginTop: 16, color: '#0288d1', fontWeight: 'bold' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : userType === 'parent' ? (
          <Stack.Screen name="Parent" component={ParentNavigator} />
        ) : userType === 'kid' ? (
          <Stack.Screen name="Kid" component={KidNavigator} />
        ) : (
          <Stack.Screen
            name="Unknown"
            component={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 18 }}>
                  Unknown user type. Please contact support.
                </Text>
              </View>
            )}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}