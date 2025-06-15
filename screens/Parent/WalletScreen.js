import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, TextInput, Image, AccessibilityInfo } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';

// Placeholder logo import
// import LOGO from '../../assets/logo.png';

export default function WalletScreen({ navigation }) {
  const [pawBalance] = useState(0);
  const [network] = useState('');
  const [loading] = useState(false);

  // Placeholder for transaction history
  const [transactions] = useState([
    // { hash: '0x123...', amount: 10, type: 'sent', date: '2024-06-01' },
  ]);

  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  // Placeholder address for UI
  const walletAddress = '0xYourWalletAddress';

  const shortAddress = (addr) =>
    addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : 'Not connected';

  const handleSend = async () => {
    if (!recipient || !amount || isNaN(Number(amount))) {
      AccessibilityInfo.announceForAccessibility('Invalid input. Please enter a valid address and amount.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid input', 'Please enter a valid address and amount.');
      return;
    }
    if (Number(amount) > pawBalance) {
      AccessibilityInfo.announceForAccessibility('Insufficient balance.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Insufficient balance', 'You do not have enough Pawcoin.');
      return;
    }
    try {
      setSending(true);
      // Placeholder for send logic
      AccessibilityInfo.announceForAccessibility(`Sent ${amount} Pawcoin.`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', `Sent ${amount} Pawcoin!`);
      setSendModalVisible(false);
      setRecipient('');
      setAmount('');
    } catch (err) {
      AccessibilityInfo.announceForAccessibility('Send failed.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Send Failed', err.message || 'Could not send Pawcoin');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.logoBtn}
        onPress={() => navigation.navigate('Dashboard')}
        accessibilityRole="button"
        accessibilityLabel="Go to Home"
      >
        {/* <Image source={LOGO} style={styles.logo} resizeMode="contain" /> */}
      </TouchableOpacity>
      <Text style={styles.title}>My Wallet</Text>
      <View style={styles.infoBox}>
        <MaterialIcons name="account-balance-wallet" size={32} color="#0288d1" />
        <Text style={styles.label}>
          Wallet: <Text style={styles.value}>{shortAddress(walletAddress)}</Text>
        </Text>
        <Text style={styles.label}>
          Network: <Text style={styles.value}>{network || '—'}</Text>
        </Text>
        <Text style={styles.label}>
          Pawcoin Balance: <Text style={styles.value}>{pawBalance}</Text>
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          Clipboard.setStringAsync(walletAddress);
          Alert.alert('Copied!', 'Wallet address copied to clipboard.');
        }}
      >
        <FontAwesome name="copy" size={20} color="#0288d1" />
        <Text style={[styles.buttonText, { color: '#0288d1' }]}>Copy Address</Text>
      </TouchableOpacity>

      <View style={{ marginVertical: 16 }}>
        <QRCode value={walletAddress} size={120} />
        <Text style={{ color: '#0288d1', marginTop: 8, fontSize: 12 }}>Scan to receive Pawcoin</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => setSendModalVisible(true)}>
        <FontAwesome name="send" size={20} color="#fff" />
        <Text style={styles.buttonText}>Send Pawcoin</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {transactions.length === 0 ? (
        <Text style={styles.emptyText}>No transactions yet.</Text>
      ) : (
        transactions.map((tx, idx) => (
          <View key={tx.hash || idx} style={styles.txRow}>
            <FontAwesome
              name={tx.type === 'sent' ? 'arrow-up' : 'arrow-down'}
              size={18}
              color={tx.type === 'sent' ? '#d32f2f' : '#388e3c'}
            />
            <Text style={styles.txText}>
              {tx.type === 'sent' ? '-' : '+'}{tx.amount} Pawcoin
            </Text>
            <Text style={styles.txHash}>{shortAddress(tx.hash)}</Text>
            <Text style={styles.txDate}>{tx.date}</Text>
          </View>
        ))
      )}
      {loading && <Text style={styles.loading}>Loading...</Text>}
      {/* Placeholder for refresh */}
      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <FontAwesome name="refresh" size={20} color="#fff" />
        <Text style={styles.buttonText}>Refresh Balance</Text>
      </TouchableOpacity>

      <Modal
        visible={sendModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSendModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Pawcoin</Text>
            <TextInput
              style={styles.input}
              placeholder="Recipient address"
              value={recipient}
              onChangeText={setRecipient}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.button, { flex: 1, marginRight: 5 }]}
                onPress={handleSend}
                disabled={sending}
              >
                <FontAwesome name="paper-plane" size={18} color="#fff" />
                <Text style={styles.buttonText}>{sending ? 'Sending...' : 'Send'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { flex: 1, backgroundColor: '#ccc', marginLeft: 5 }]}
                onPress={() => setSendModalVisible(false)}
                disabled={sending}
              >
                <Text style={[styles.buttonText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#b3e5fc',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  logoBtn: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 6,
  },
  logo: {
    width: 36,
    height: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0288d1',
    marginBottom: 24,
    alignSelf: 'center',
  },
  infoBox: {
    backgroundColor: '#E6F7FF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  value: {
    fontWeight: 'bold',
    color: '#0288d1',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#0288d1',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0288d1',
    marginTop: 30,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  emptyText: {
    color: '#888',
    fontSize: 15,
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  txText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
    marginRight: 10,
    fontWeight: 'bold',
  },
  txHash: {
    fontSize: 12,
    color: '#888',
    flex: 1,
  },
  txDate: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  loading: {
    marginTop: 20,
    color: '#0288d1',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0288d1',
    marginBottom: 16,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#b3e5fc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: '#f7fbff',
  },
});