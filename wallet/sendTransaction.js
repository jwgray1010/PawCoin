import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';
import firestore from '@react-native-firebase/firestore';

/**
 * Sends a transaction (add or spend) for a user's PawCoin wallet.
 * @param {string} userId - The user's unique ID.
 * @param {'add'|'spend'} type - The transaction type.
 * @param {number} amount - The amount to add or spend.
 * @param {Object} [meta] - Optional metadata for the transaction.
 * @returns {Promise<void>}
 */
export default async function sendTransaction(userId, type, amount, meta = {}) {
  if (!userId) {
    AccessibilityInfo.announceForAccessibility('User ID is required for transaction.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    throw new Error('User ID is required');
  }
  if (!['add', 'spend'].includes(type)) {
    AccessibilityInfo.announceForAccessibility('Invalid transaction type.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    throw new Error('Invalid transaction type');
  }
  if (typeof amount !== 'number' || amount <= 0) {
    AccessibilityInfo.announceForAccessibility('Amount must be a positive number.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    throw new Error('Amount must be a positive number');
  }

  const walletRef = firestore().collection('wallets').doc(userId);

  await firestore().runTransaction(async transaction => {
    const doc = await transaction.get(walletRef);
    const prev = doc.exists ? doc.data() : { balance: 0, transactions: [] };
    let newBalance = prev.balance || 0;

    if (type === 'add') {
      newBalance += amount;
    } else if (type === 'spend') {
      newBalance = Math.max(0, newBalance - amount);
    }

    const newTx = {
      type,
      amount,
      date: Date.now(),
      ...meta,
    };

    transaction.set(walletRef, {
      balance: newBalance,
      transactions: [newTx, ...(prev.transactions || [])],
    }, { merge: true });
  });

  if (type === 'add') {
    AccessibilityInfo.announceForAccessibility(`${amount} PawCoin added to wallet.`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else {
    AccessibilityInfo.announceForAccessibility(`${amount} PawCoin spent from wallet.`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
}