import React from 'react';
import AppLoading from 'expo-app-loading';
import { useFonts, Baloo2_600SemiBold, Baloo2_400Regular } from '@expo-google-fonts/baloo-2';
import { StyleSheet, View, TouchableOpacity, Text, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

import MainNavigator from '../navigation/MainNavigator'; // Use your main navigator
import { AuthProvider } from '../contexts/AuthContext';
import { UserTypeProvider } from '../contexts/UserTypeContext';
import { WalletProvider } from '../contexts/WalletContext';

const barkleyAnimations = [
  'rest',
  'idle1',
  'idle2',
  'jump',
  'walk',
  'run',
  'run2',
  'falls1',
  'fall2',
  'falls3',
  'wakesup1',
  'wakesup2',
  'wakesup3',
  'no',
  'yes',
  'waving',
  'happy'
];

export default function App() {
  let [fontsLoaded] = useFonts({
    Baloo2_600SemiBold,
    Baloo2_400Regular,
  });

  const [animation, setAnimation] = React.useState('rest');

  const handleAnimationChange = (anim) => {
    setAnimation(anim);
    AccessibilityInfo.announceForAccessibility(`${anim} animation selected.`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <AuthProvider>
      <UserTypeProvider>
        <WalletProvider>
          <MainNavigator animation={animation} />
          <View style={styles.buttonRow}>
            {barkleyAnimations.map(anim => (
              <TouchableOpacity
                key={anim}
                style={[
                  styles.button,
                  animation === anim && styles.buttonActive
                ]}
                onPress={() => handleAnimationChange(anim)}
                accessibilityRole="button"
                accessibilityLabel={`${anim} animation`}
              >
                <Text style={styles.buttonText}>{anim}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </WalletProvider>
      </UserTypeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontFamily: 'Baloo2_600SemiBold',
    fontSize: 24,
    color: '#0288d1', // Use PawCoin blue
  },
  subtitle: {
    fontFamily: 'Baloo2_400Regular',
    fontSize: 16,
    color: '#795548', // Use PawCoin brown
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#0288d1',
    borderRadius: 5,
    padding: 10,
    margin: 5,
  },
  buttonActive: {
    backgroundColor: '#0277bd',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Baloo2_400Regular',
  },
});


