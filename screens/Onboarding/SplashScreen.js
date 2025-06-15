// screens/Onboarding/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image, AccessibilityInfo, Platform } from 'react-native';

const LOGO = require('../../assets/logo.png');

const SplashScreen = ({ navigation }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const announceWelcome = async () => {
      await AccessibilityInfo.announceForAccessibility('Welcome to PawCoin!');
    };
    announceWelcome();

    // Pulsate animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(() => {
      AccessibilityInfo.announceForAccessibility('Loading complete. Moving to sign in.');
      navigation?.replace('SignIn');
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleValue }],
          },
          styles.glow,
        ]}
      >
        <Image source={LOGO} style={{ width: 160, height: 160 }} resizeMode="contain" />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1565c0', // Professional blue
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    ...Platform.select({
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 30,
      },
      android: {
        elevation: 30,
      },
    }),
  },
});
