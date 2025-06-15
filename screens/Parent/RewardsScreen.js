import React, { useState, useEffect } from 'react';
import { useWalletConnect } from '@walletconnect/react-native-dapp';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { db } from '../../lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { ethers } from 'ethers';
import * as Haptics from 'expo-haptics';

// Your Pawcoin contract details
const PAWCOIN_CONTRACT_ADDRESS = '0xYourPawcoinContractAddress';
const PAWCOIN_ABI = [ /* ...ERC20 ABI... */ ];

export default function RewardsScreen({ navigation }) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [rewardName, setRewardName] = useState('');
  const [rewardCost, setRewardCost] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const connector = useWalletConnect();
  const [pawBalance, setPawBalance] = useState(0);

  // Fetch rewards in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'rewards'), (snapshot) => {
      setRewards(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
      setLoading(false);
    });
    return unsub;
  }, []);

  // Connect wallet and fetch balance
  useEffect(() => {
    async function fetchBalance() {
      if (!connector.connected) return;
      try {
        const provider = new ethers.providers.Web3Provider(connector);
        const contract = new ethers.Contract(PAWCOIN_CONTRACT_ADDRESS, PAWCOIN_ABI, provider);
        const balance = await contract.balanceOf(connector.accounts[0]);
        setPawBalance(Number(ethers.utils.formatUnits(balance, 18)));
      } catch (err) {
        Alert.alert('Wallet Error', err.message || 'Could not fetch Pawcoin balance');
      }
    }
    fetchBalance();
  }, [connector.connected]);

  // Accessibility and haptics for reward actions
  const handleRedeem = async (reward) => {
    if (!connector.connected) {
      AccessibilityInfo.announceForAccessibility('Wallet not connected.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Wallet not connected', 'Please connect your wallet first.');
      return;
    }
    if (pawBalance < reward.cost) {
      AccessibilityInfo.announceForAccessibility('Not enough Pawcoin to redeem this reward.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Not enough Pawcoin', 'You do not have enough Pawcoin to redeem this reward.');
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(connector);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(PAWCOIN_CONTRACT_ADDRESS, PAWCOIN_ABI, signer);
      // Replace '0xRecipientAddress' with your app's wallet or burn address
      const tx = await contract.transfer('0xRecipientAddress', ethers.utils.parseUnits(reward.cost.toString(), 18));
      await tx.wait();
      setPawBalance((prev) => prev - reward.cost);
      AccessibilityInfo.announceForAccessibility(`You redeemed ${reward.name} for ${reward.cost} Pawcoin.`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Redeemed!', `You redeemed: ${reward.name} for ${reward.cost} Pawcoin!`);
    } catch (err) {
      AccessibilityInfo.announceForAccessibility('Transaction failed.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Transaction Failed', err.message || 'Could not send Pawcoin');
    }
  };

  const openAddModal = () => {
    setEditingReward(null);
    setRewardName('');
    setRewardCost('');
    setModalVisible(true);
    AccessibilityInfo.announceForAccessibility('Add reward modal opened.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openEditModal = (reward) => {
    setEditingReward(reward);
    setRewardName(reward.name);
    setRewardCost(String(reward.cost));
    setModalVisible(true);
    AccessibilityInfo.announceForAccessibility(`Edit reward modal for ${reward.name} opened.`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    if (!rewardName.trim() || !rewardCost.trim() || isNaN(Number(rewardCost))) {
      AccessibilityInfo.announceForAccessibility('Invalid input. Please enter a valid name and cost.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid input', 'Please enter a valid name and cost.');
      return;
    }
    if (editingReward) {
      // Update reward
      await updateDoc(doc(db, 'rewards', editingReward.id), {
        name: rewardName,
        cost: Number(rewardCost),
      });
      AccessibilityInfo.announceForAccessibility('Reward updated.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Add reward
      await addDoc(collection(db, 'rewards'), {
        name: rewardName,
        cost: Number(rewardCost),
      });
      AccessibilityInfo.announceForAccessibility('Reward added.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setModalVisible(false);
  };

  const handleDelete = (reward) => {
    Alert.alert(
      'Delete Reward',
      `Are you sure you want to delete "${reward.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDoc(doc(db, 'rewards', reward.id));
            AccessibilityInfo.announceForAccessibility('Reward deleted.');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  // Connect wallet button
  const connectWallet = () => {
    if (!connector.connected) {
      AccessibilityInfo.announceForAccessibility('Connecting wallet.');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      connector.connect();
    } else {
      AccessibilityInfo.announceForAccessibility('Wallet already connected.');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.logoBtn}
        onPress={() => navigation.navigate('Dashboard')}
        accessibilityRole="button"
        accessibilityLabel="Go to Home"
      >
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </TouchableOpacity>
      <Text style={styles.title}>Rewards Store</Text>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 18, color: '#0288d1', fontWeight: 'bold' }}>
          Pawcoin Balance: {pawBalance}
        </Text>
        <Text style={{ fontSize: 12, color: '#555' }}>
          Wallet: {walletAddress ? walletAddress.slice(0, 8) + '...' : 'Not connected'}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0288d1" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={rewards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onLongPress={() => handleDelete(item)}
              onPress={() => openEditModal(item)}
              activeOpacity={0.7}
            >
              <View style={styles.rewardItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rewardName}>{item.name}</Text>
                  <View style={styles.coinRow}>
                    <FontAwesome name="star" size={18} color="#FFD600" />
                    <Text style={styles.coinText}>{item.cost} coins</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.redeemButton}
                  onPress={() => handleRedeem(item)}
                >
                  <Text style={styles.redeemText}>Redeem</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <FontAwesome name="plus" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Reward</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton} onPress={connectWallet}>
        <FontAwesome name="link" size={20} color="#fff" />
        <Text style={styles.addButtonText}>
          {connector.connected ? 'Wallet Connected' : 'Connect Wallet'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingReward ? 'Edit Reward' : 'Add Reward'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Reward name"
              value={rewardName}
              onChangeText={setRewardName}
            />
            <TextInput
              style={styles.input}
              placeholder="Cost (coins)"
              value={rewardCost}
              onChangeText={setRewardCost}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#0288d1' }]}
                onPress={handleSave}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#333' }]}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b3e5fc',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0288d1',
    marginBottom: 20,
    alignSelf: 'center',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinText: {
    marginLeft: 6,
    color: '#0288d1',
    fontWeight: 'bold',
    fontSize: 14,
  },
  redeemButton: {
    backgroundColor: '#0288d1',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  redeemText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#0288d1',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});