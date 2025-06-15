import { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { AccessibilityInfo, Alert } from 'react-native';

// Usage: const { balance, transactions, loading, error, addCoins, spendCoins, refresh } = useWallet(userId);
export default function useWallet(userId) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wallet data from Firestore
  const fetchWallet = async () => {
    setLoading(true);
    try {
      const walletDoc = await firestore().collection('wallets').doc(userId).get();
      if (walletDoc.exists) {
        const data = walletDoc.data();
        setBalance(data.balance || 0);
        setTransactions(data.transactions || []);
      } else {
        setBalance(0);
        setTransactions([]);
      }
      setError(null);
      AccessibilityInfo.announceForAccessibility(`Wallet loaded. Balance: ${balance} coins`);
    } catch (e) {
      setError(e);
      AccessibilityInfo.announceForAccessibility(`Failed to load wallet: ${e.message}`);
      Alert.alert('Wallet Error', e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) {
      setBalance(0);
      setTransactions([]);
      setLoading(false);
      return;
    }
    fetchWallet();
    // Real-time updates
    const unsubscribe = firestore()
      .collection('wallets')
      .doc(userId)
      .onSnapshot(
        doc => {
          if (doc.exists) {
            const data = doc.data();
            setBalance(data.balance || 0);
            setTransactions(data.transactions || []);
            AccessibilityInfo.announceForAccessibility(`Wallet updated. Balance: ${data.balance || 0} coins`);
          } else {
            setBalance(0);
            setTransactions([]);
            AccessibilityInfo.announceForAccessibility('Wallet reset to zero.');
          }
          setLoading(false);
        },
        err => {
          setError(err);
          AccessibilityInfo.announceForAccessibility(`Wallet update error: ${err.message}`);
        }
      );
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Add coins to wallet
  const addCoins = async (amount, meta = {}) => {
    if (!userId || typeof amount !== 'number' || amount <= 0) {
      setError(new Error('Invalid addCoins parameters'));
      AccessibilityInfo.announceForAccessibility('Failed to add coins: Invalid parameters');
      Alert.alert('Add Coins Error', 'Invalid amount or user.');
      return;
    }
    try {
      await firestore().collection('wallets').doc(userId).set(
        {
          balance: balance + amount,
          transactions: [
            { type: 'add', amount, date: Date.now(), ...meta },
            ...transactions,
          ],
        },
        { merge: true }
      );
      AccessibilityInfo.announceForAccessibility(`Added ${amount} coins. New balance: ${balance + amount}`);
    } catch (e) {
      setError(e);
      AccessibilityInfo.announceForAccessibility(`Failed to add coins: ${e.message}`);
      Alert.alert('Add Coins Error', e.message);
    }
  };

  // Spend coins from wallet
  const spendCoins = async (amount, meta = {}) => {
    if (!userId || typeof amount !== 'number' || amount <= 0) {
      setError(new Error('Invalid spendCoins parameters'));
      AccessibilityInfo.announceForAccessibility('Failed to spend coins: Invalid parameters');
      Alert.alert('Spend Coins Error', 'Invalid amount or user.');
      return;
    }
    const newBalance = Math.max(0, balance - amount);
    try {
      await firestore().collection('wallets').doc(userId).set(
        {
          balance: newBalance,
          transactions: [
            { type: 'spend', amount, date: Date.now(), ...meta },
            ...transactions,
          ],
        },
        { merge: true }
      );
      AccessibilityInfo.announceForAccessibility(`Spent ${amount} coins. New balance: ${newBalance}`);
    } catch (e) {
      setError(e);
      AccessibilityInfo.announceForAccessibility(`Failed to spend coins: ${e.message}`);
      Alert.alert('Spend Coins Error', e.message);
    }
  };

  // Manual refresh
  const refresh = fetchWallet;

  // Optional: Filter transactions by type
  const getTransactionsByType = (type) => transactions.filter(tx => tx.type === type);

  return {
    balance,
    transactions,
    loading,
    error,
    addCoins,
    spendCoins,
    refresh,
    getTransactionsByType,
  };
}