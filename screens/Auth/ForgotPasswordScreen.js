import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, AccessibilityInfo } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
// import { useAuth } from '../../contexts/AuthContext'; // Uncomment if using AuthContext

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // const { resetPassword } = useAuth(); // Uncomment if using AuthContext

  const handleReset = async () => {
    if (!email || !email.includes('@')) {
      AccessibilityInfo.announceForAccessibility('Please enter a valid email address.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      // TODO: Connect to your password reset API or Firebase here
      // await resetPassword(email); // Uncomment if using AuthContext
      setSubmitted(true);
      AccessibilityInfo.announceForAccessibility(`If an account exists for ${email}, a reset link has been sent!`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      AccessibilityInfo.announceForAccessibility(`Failed to send reset link: ${e.message}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Reset Failed', e.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <FontAwesome name="paw" size={48} color="#0288d1" style={{ marginBottom: 16 }} />
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you a link to reset your password.
        </Text>
        {!submitted ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#bdbdbd"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              accessible
              accessibilityLabel="Email address"
              returnKeyType="done"
              onSubmitEditing={handleReset}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleReset}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Send Reset Link"
            >
              <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text
            style={styles.success}
            accessible
            accessibilityLiveRegion="polite"
          >
            If an account exists for {email}, a reset link has been sent!
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbe9', justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#0288d1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0288d1',
    marginBottom: 8,
    fontFamily: 'Baloo2_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#0288d1',
    fontSize: 15,
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 18,
    backgroundColor: '#f5f5f5',
    color: '#333',
  },
  button: {
    backgroundColor: '#0288d1',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  success: {
    color: '#43a047',
    fontSize: 16,
    marginTop: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});