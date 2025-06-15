import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

const SignInScreen = ({ navigation }) => {
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const sound = useRef();

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility('Sign in screen. Choose a sign in method or continue as Parent or Kid.');
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      playBarkleySound();
    });
  }, []);

  const playBarkleySound = async () => {
    try {
      const { sound: soundObject } = await Audio.Sound.createAsync(
        require('../../assets/sounds/bark.mp3')
      );
      sound.current = soundObject;
      await sound.current.playAsync();
    } catch (error) {
      console.log('Error loading sound:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  const handleContinue = (role) => {
    AccessibilityInfo.announceForAccessibility(`Continuing as ${role}.`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate(role === 'Parent' ? 'ParentHome' : 'KidHome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.barkleyContainer}>
        <Animated.View
          style={[
            styles.fallbackBarkley,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          {/* You can put a logo, emoji, or just keep the colored circle */}
          <Text style={{ fontSize: 60, textAlign: 'center' }}>🐾</Text>
        </Animated.View>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            Whew! That was close...{'\n'}Barkley says: Let's get you signed in!
          </Text>
        </View>
      </View>

      <Text style={styles.title}>Welcome to PawCoin!</Text>

      <TouchableOpacity
        style={styles.authButton}
        onPress={() => {
          AccessibilityInfo.announceForAccessibility('Sign in with Google selected.');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // TODO: Add Google sign-in logic
        }}
        accessibilityRole="button"
        accessibilityLabel="Sign in with Google"
      >
        <AntDesign name="google" size={24} color="#fff" />
        <Text style={styles.authText}>Sign in with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.authButton}
        onPress={() => {
          AccessibilityInfo.announceForAccessibility('Sign in with Apple selected.');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // TODO: Add Apple sign-in logic
        }}
        accessibilityRole="button"
        accessibilityLabel="Sign in with Apple"
      >
        <FontAwesome name="apple" size={24} color="#fff" />
        <Text style={styles.authText}>Sign in with Apple</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          AccessibilityInfo.announceForAccessibility('Use other email selected.');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // TODO: Add email sign-in logic
        }}
        accessibilityRole="button"
        accessibilityLabel="Use other email"
      >
        <Text style={styles.otherLogin}>Use other email</Text>
      </TouchableOpacity>

      {/* Navigation options for Parent and Kid */}
      <View style={{ marginTop: 40, width: '100%' }}>
        <TouchableOpacity
          style={[styles.authButton, { backgroundColor: '#43a047' }]}
          onPress={() => handleContinue('Parent')}
          accessibilityRole="button"
          accessibilityLabel="Continue as Parent"
        >
          <Text style={styles.authText}>Continue as Parent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.authButton, { backgroundColor: '#fbc02d' }]}
          onPress={() => handleContinue('Kid')}
          accessibilityRole="button"
          accessibilityLabel="Continue as Kid"
        >
          <Text style={[styles.authText, { color: '#333' }]}>Continue as Kid</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b3e5fc',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  barkleyContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    width: 200,
    height: 200,
  },
  fallbackBarkley: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0288d1',
  },
  speechBubble: {
    position: 'absolute',
    left: 130,
    top: 20,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 10,
    maxWidth: 160,
    borderWidth: 1,
    borderColor: '#888',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  speechText: {
    fontSize: 12,
    color: '#333',
  },
  title: {
    fontSize: 24,
    marginVertical: 30,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 250,
  },
  authButton: {
    flexDirection: 'row',
    backgroundColor: '#0288d1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  authText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
  otherLogin: {
    marginTop: 20,
    textDecorationLine: 'underline',
    color: '#01579b',
  },
});
