import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, AccessibilityInfo } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function ParentSignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Accessibility: Announce screen and errors
  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility('Parent Sign Up screen');
  }, []);
  React.useEffect(() => {
    if (error) {
      AccessibilityInfo.announceForAccessibility(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [error]);
  React.useEffect(() => {
    if (success) {
      AccessibilityInfo.announceForAccessibility(`Account created for ${name}. Please check your email to verify your account.`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [success]);

  const validateEmail = (email) =>
    !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignUp = async () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    // TODO: Connect to your sign-up API or Firebase here
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Optionally, navigate to another screen here
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <FontAwesome name="paw" size={44} color="#0288d1" style={{ marginBottom: 12 }} />
        <Text style={styles.title}>Parent Sign Up</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? (
          <Text style={styles.success}>
            🎉 Account created for {name}! Please check your email to verify your account.
          </Text>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
              accessibilityLabel="Full Name"
            />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
              accessibilityLabel="Email address"
            />
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                returnKeyType="done"
                accessibilityLabel="Password"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                accessibilityRole="button"
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="#0288d1"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSignUp}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Sign Up"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </>
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
    marginBottom: 18,
    fontFamily: 'Baloo2_700Bold',
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
  },
  eyeBtn: {
    padding: 8,
    marginLeft: -40,
    zIndex: 1,
  },
  button: {
    backgroundColor: '#0288d1',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  success: {
    color: '#43a047',
    fontSize: 16,
    marginTop: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});