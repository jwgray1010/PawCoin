/**
 * Example utility to connect to a user's PawCoin wallet.
 * This could be expanded to support different wallet providers or authentication methods.
 * For now, it simply checks if a wallet exists for the user and creates one if not.
 */

import firestore from '@react-native-firebase/firestore';
import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Connects to the user's wallet, creating it if it doesn't exist.
 * @param {string} userId - The user's unique ID.
 * @returns {Promise<{balance: number, transactions: Array}>}
 */
export async function connectWallet(userId) {
  if (!userId) {
    AccessibilityInfo.announceForAccessibility('User ID is required to connect wallet.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    throw new Error('User ID is required to connect wallet.');
  }

  const walletRef = firestore().collection('wallets').doc(userId);
  const doc = await walletRef.get();

  if (doc.exists) {
    AccessibilityInfo.announceForAccessibility('Wallet connected.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return doc.data();
  } else {
    // Create a new wallet for the user
    const newWallet = { balance: 0, transactions: [] };
    await walletRef.set(newWallet);
    AccessibilityInfo.announceForAccessibility('New wallet created and connected.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return newWallet;
  }
}