import firestore from '@react-native-firebase/firestore';
import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Gets the current balance for a user's PawCoin wallet.
 * @param {string} userId - The user's unique ID.
 * @returns {Promise<number>} The wallet balance (defaults to 0 if not found).
 */
export default async function getBalance(userId) {
  if (!userId) {
    AccessibilityInfo.announceForAccessibility('User ID is required to get balance.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    throw new Error('User ID is required to get balance.');
  }

  const walletRef = firestore().collection('wallets').doc(userId);
  const doc = await walletRef.get();

  if (doc.exists) {
    const data = doc.data();
    AccessibilityInfo.announceForAccessibility(`Wallet balance is ${data.balance || 0} PawCoin.`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return data.balance || 0;
  } else {
    AccessibilityInfo.announceForAccessibility('Wallet not found. Balance is 0.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    return 0;
  }
}