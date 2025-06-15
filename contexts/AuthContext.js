import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import auth from '@react-native-firebase/auth';
import { AccessibilityInfo, Alert } from 'react-native';

const AuthContext = createContext();

/**
 * useAuth - React hook for authentication state and actions.
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * AuthProvider - Provides authentication state and actions to children.
 */
export const AuthProvider = ({ children, onAuthStateChanged }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(u => {
      setUser(u);
      setInitializing(false);
      AccessibilityInfo.announceForAccessibility(
        u ? `Signed in as ${u.email || 'user'}` : 'Signed out'
      );
      if (onAuthStateChanged) onAuthStateChanged(u);
    });
    return unsubscribe;
  }, [onAuthStateChanged]);

  // Sign in with email and password
  const signIn = useCallback(async (email, password) => {
    setError(null);
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e) {
      setError(e.message);
      AccessibilityInfo.announceForAccessibility(`Sign in failed: ${e.message}`);
      Alert.alert('Sign In Error', e.message);
      throw e;
    }
  }, []);

  // Register new user
  const register = useCallback(async (email, password) => {
    setError(null);
    try {
      await auth().createUserWithEmailAndPassword(email, password);
    } catch (e) {
      setError(e.message);
      AccessibilityInfo.announceForAccessibility(`Registration failed: ${e.message}`);
      Alert.alert('Registration Error', e.message);
      throw e;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setError(null);
    try {
      await auth().signOut();
    } catch (e) {
      setError(e.message);
      AccessibilityInfo.announceForAccessibility(`Sign out failed: ${e.message}`);
      Alert.alert('Sign Out Error', e.message);
      throw e;
    }
  }, []);

  // Password reset
  const resetPassword = useCallback(async (email) => {
    setError(null);
    try {
      await auth().sendPasswordResetEmail(email);
      AccessibilityInfo.announceForAccessibility('Password reset email sent');
      Alert.alert('Password Reset', 'Check your email for reset instructions.');
    } catch (e) {
      setError(e.message);
      AccessibilityInfo.announceForAccessibility(`Password reset failed: ${e.message}`);
      Alert.alert('Password Reset Error', e.message);
      throw e;
    }
  }, []);

  // Refresh user profile
  const refreshUser = useCallback(async () => {
    if (auth().currentUser) {
      await auth().currentUser.reload();
      setUser(auth().currentUser);
    }
  }, []);

  const value = {
    user,
    initializing,
    error,
    signIn,
    signOut,
    register,
    resetPassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};