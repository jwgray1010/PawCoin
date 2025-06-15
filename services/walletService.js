// Wallet service logic for managing PawCoin balances and transactions

import firestore from '@react-native-firebase/firestore';
import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

// Get wallet data for a user
export async function getWallet(userId) {
  const doc = await firestore().collection('wallets').doc(userId).get();
  if (doc.exists) {
    AccessibilityInfo.announceForAccessibility('Wallet loaded.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  return doc.exists ? doc.data() : { balance: 0, transactions: [] };
}

// Add coins to a user's wallet
export async function addCoins(userId, amount, meta = {}) {
  const walletRef = firestore().collection('wallets').doc(userId);
  await firestore().runTransaction(async transaction => {
    const doc = await transaction.get(walletRef);
    const prev = doc.exists ? doc.data() : { balance: 0, transactions: [] };
    const newBalance = (prev.balance || 0) + amount;
    const newTx = { type: 'add', amount, date: Date.now(), ...meta };
    transaction.set(walletRef, {
      balance: newBalance,
      transactions: [newTx, ...(prev.transactions || [])],
    }, { merge: true });
  });
  AccessibilityInfo.announceForAccessibility(`${amount} PawCoin added to wallet.`);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

// Spend coins from a user's wallet
export async function spendCoins(userId, amount, meta = {}) {
  const walletRef = firestore().collection('wallets').doc(userId);
  await firestore().runTransaction(async transaction => {
    const doc = await transaction.get(walletRef);
    const prev = doc.exists ? doc.data() : { balance: 0, transactions: [] };
    const newBalance = Math.max(0, (prev.balance || 0) - amount);
    const newTx = { type: 'spend', amount, date: Date.now(), ...meta };
    transaction.set(walletRef, {
      balance: newBalance,
      transactions: [newTx, ...(prev.transactions || [])],
    }, { merge: true });
  });
  AccessibilityInfo.announceForAccessibility(`${amount} PawCoin spent from wallet.`);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

// Reset a user's wallet (for testing/admin)
export async function resetWallet(userId) {
  await firestore().collection('wallets').doc(userId).set({
    balance: 0,
    transactions: [],
  });
  AccessibilityInfo.announceForAccessibility('Wallet reset.');
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}