import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, AccessibilityInfo, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';

export default function KidWalletScreen() {
  // Example data
  const [pawBalance] = useState(42);
  const [walletAddress] = useState('0x1234...abcd');
  const [modalVisible, setModalVisible] = useState(false);
  const [transactions] = useState([
    { id: '1', type: 'received', amount: 10, date: '2025-06-01' },
    { id: '2', type: 'sent', amount: 5, date: '2025-06-02' },
    { id: '3', type: 'received', amount: 7, date: '2025-06-03' },
  ]);

  // Accessibility: Announce balance on mount
  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`You have ${pawBalance} Pawcoin.`);
  }, [pawBalance]);

  // Accessibility: Announce modal open/close
  const handleShowQR = () => {
    setModalVisible(true);
    AccessibilityInfo.announceForAccessibility('Showing your wallet QR code.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  const handleCloseQR = () => {
    setModalVisible(false);
    AccessibilityInfo.announceForAccessibility('Closed wallet QR code.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Light);
  };

  // Accessibility: Announce transaction details on tap
  const handleTxPress = (tx) => {
    AccessibilityInfo.announceForAccessibility(
      `${tx.type === 'received' ? 'Received' : 'Sent'} ${tx.amount} Pawcoin on ${tx.date}`
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      tx.type === 'received' ? 'Received Pawcoin' : 'Sent Pawcoin',
      `${tx.type === 'received' ? 'Received' : 'Sent'} ${tx.amount} PAW on ${tx.date}`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My PawCoin Wallet</Text>
      <View style={styles.balanceBox}>
        <FontAwesome name="paw" size={32} color="#43a047" />
        <Text style={styles.balance}>{pawBalance} PAW</Text>
      </View>
      <TouchableOpacity
        style={styles.qrBtn}
        onPress={handleShowQR}
        accessibilityRole="button"
        accessibilityLabel="Show my wallet QR code"
      >
        <FontAwesome name="qrcode" size={22} color="#0288d1" />
        <Text style={styles.qrBtnText}>Show My QR</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.txList}>
        {transactions.map(tx => (
          <TouchableOpacity
            key={tx.id}
            style={styles.txItem}
            onPress={() => handleTxPress(tx)}
            accessibilityRole="button"
            accessibilityLabel={
              `${tx.type === 'received' ? 'Received' : 'Sent'} ${tx.amount} Pawcoin on ${tx.date}`
            }
          >
            <FontAwesome
              name={tx.type === 'received' ? 'arrow-down' : 'arrow-up'}
              size={18}
              color={tx.type === 'received' ? '#43a047' : '#d32f2f'}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.txText}>
              {tx.type === 'received' ? 'Received' : 'Sent'} {tx.amount} PAW
            </Text>
            <Text style={styles.txDate}>{tx.date}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseQR}
        accessible
        accessibilityViewIsModal
        accessibilityLabel="Wallet QR code modal"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>My Wallet QR</Text>
            <QRCode value={walletAddress} size={180} />
            <Text style={styles.walletAddr}>{walletAddress}</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleCloseQR}
              accessibilityRole="button"
              accessibilityLabel="Close QR code"
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbe9', padding: 24 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0288d1',
    textAlign: 'center',
    marginBottom: 18,
    fontFamily: 'Baloo2_700Bold',
  },
  balanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1f5fe',
    borderRadius: 16,
    padding: 18,
    alignSelf: 'center',
    marginBottom: 18,
  },
  balance: {
    fontSize: 32,
    color: '#43a047',
    fontWeight: 'bold',
    marginLeft: 14,
    fontFamily: 'Baloo2_700Bold',
  },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0288d1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginBottom: 20,
  },
  qrBtnText: {
    color: '#0288d1',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#0288d1',
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    fontFamily: 'Baloo2_700Bold',
  },
  txList: {
    backgroundColor: '#e1f5fe',
    borderRadius: 12,
    padding: 10,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  txText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  txDate: {
    fontSize: 13,
    color: '#0288d1',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 300,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0288d1',
    marginBottom: 16,
  },
  walletAddr: {
    marginTop: 16,
    color: '#0288d1',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'Baloo2_700Bold',
  },
  closeBtn: {
    marginTop: 18,
    backgroundColor: '#0288d1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});