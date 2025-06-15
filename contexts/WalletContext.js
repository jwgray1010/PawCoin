import React, { createContext, useContext, useState, useCallback } from 'react';
import { AccessibilityInfo, Alert } from 'react-native';

// Example wallet: { balance, transactions, addCoins, spendCoins }
const WalletContext = createContext();

/**
 * useWallet - React hook for wallet state and actions.
 */
export function useWallet() {
  return useContext(WalletContext);
}

/**
 * WalletProvider - Provides wallet state and actions to children.
 */
export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  // Announce balance changes for accessibility
  const announceBalance = useCallback((newBalance) => {
    AccessibilityInfo.announceForAccessibility(`Wallet balance: ${newBalance} coins`);
  }, []);

  // Add coins to wallet
  const addCoins = useCallback((amount, meta = {}) => {
    if (typeof amount !== 'number' || amount <= 0) {
      Alert.alert('Invalid amount', 'Amount must be a positive number.');
      return;
    }
    setBalance(prev => {
      const newBalance = prev + amount;
      announceBalance(newBalance);
      return newBalance;
    });
    setTransactions(prev => [
      { type: 'add', amount, date: Date.now(), ...meta },
      ...prev,
    ]);
  }, [announceBalance]);

  // Spend coins from wallet
  const spendCoins = useCallback((amount, meta = {}) => {
    if (typeof amount !== 'number' || amount <= 0) {
      Alert.alert('Invalid amount', 'Amount must be a positive number.');
      return;
    }
    setBalance(prev => {
      const newBalance = Math.max(0, prev - amount);
      announceBalance(newBalance);
      return newBalance;
    });
    setTransactions(prev => [
      { type: 'spend', amount, date: Date.now(), ...meta },
      ...prev,
    ]);
  }, [announceBalance]);

  // Reset wallet to zero
  const resetWallet = useCallback(() => {
    setBalance(0);
    setTransactions([]);
    announceBalance(0);
  }, [announceBalance]);

  // Optional: Filter transactions by type
  const getTransactionsByType = useCallback((type) => {
    return transactions.filter(tx => tx.type === type);
  }, [transactions]);

  const value = {
    balance,
    transactions,
    addCoins,
    spendCoins,
    resetWallet,
    getTransactionsByType,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}