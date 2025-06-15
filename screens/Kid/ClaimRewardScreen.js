import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, AccessibilityInfo } from 'react-native';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, query, where, orderBy } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Replace with actual kid ID from auth or navigation params
const kidId = 'demoKidId';

export default function ClaimRewardScreen() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [claims, setClaims] = useState([]);

  // Fetch kid's coin balance
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'users', kidId), (docSnap) => {
      if (docSnap.exists()) {
        setCoins(docSnap.data().coins || 0);
        AccessibilityInfo.announceForAccessibility(`Your balance is ${docSnap.data().coins || 0} coins`);
      }
    });
    return unsub;
  }, []);

  // Fetch rewards
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'rewards'), (snapshot) => {
      setRewards(
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
      setLoading(false);
    });
    return unsub;
  }, []);

  // Fetch claim history for this kid
  useEffect(() => {
    const q = query(
      collection(db, 'claims'),
      where('kidId', '==', kidId),
      orderBy('claimedAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setClaims(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const handleClaim = async (reward) => {
    if (coins < reward.cost) {
      AccessibilityInfo.announceForAccessibility('Not enough coins to claim this reward.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Not enough coins', 'You do not have enough coins to claim this reward.');
      return;
    }
    setClaiming(true);
    try {
      // Log the claim in a separate collection with status "pending"
      await addDoc(collection(db, 'claims'), {
        kidId,
        rewardId: reward.id,
        rewardName: reward.name,
        cost: reward.cost,
        status: 'pending', // Parent must approve
        claimedAt: new Date(),
      });

      AccessibilityInfo.announceForAccessibility(`Claim submitted for ${reward.name}. Waiting for parent approval.`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Claim Submitted!', 'Waiting for parent approval.');
    } catch (err) {
      AccessibilityInfo.announceForAccessibility('Could not claim reward.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', err.message || 'Could not claim reward.');
    }
    setClaiming(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Claim a Reward</Text>
      <View style={styles.balanceBox}>
        <FontAwesome name="star" size={20} color="#FFD600" />
        <Text style={styles.balanceText}>Your Coins: {coins}</Text>
      </View>
      <Text style={styles.sectionTitle}>Available Rewards</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0288d1" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={rewards}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <View style={styles.rewardItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rewardName}>{item.name}</Text>
                <View style={styles.coinRow}>
                  <FontAwesome name="star" size={18} color="#FFD600" />
                  <Text style={styles.coinText}>{item.cost} coins</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.claimButton,
                  coins < item.cost && { backgroundColor: '#bdbdbd' },
                ]}
                onPress={() => handleClaim(item)}
                disabled={coins < item.cost || claiming}
                accessibilityRole="button"
                accessibilityLabel={
                  coins < item.cost
                    ? `Not enough coins to claim ${item.name}`
                    : `Claim ${item.name} for ${item.cost} coins`
                }
              >
                <Text style={styles.claimText}>Claim</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No rewards available to claim.</Text>
          }
        />
      )}

      <Text style={styles.sectionTitle}>Claim History</Text>
      <FlatList
        data={claims}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View style={styles.claimRow}>
            <Text style={styles.claimName}>{item.rewardName}</Text>
            <Text style={styles.claimStatus}>
              {item.status === 'pending' && '⏳ Pending'}
              {item.status === 'approved' && '✅ Approved'}
              {item.status === 'rejected' && '❌ Rejected'}
            </Text>
            <Text style={styles.claimCost}>-{item.cost} coins</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No claims yet.</Text>
        }
      />
    </View>
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
  balanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 18,
    backgroundColor: '#E6F7FF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  balanceText: {
    marginLeft: 8,
    color: '#0288d1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0288d1',
    marginTop: 24,
    marginBottom: 10,
    alignSelf: 'flex-start',
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
  claimButton: {
    backgroundColor: '#0288d1',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  claimText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    alignSelf: 'center',
    marginTop: 40,
  },
  claimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  claimName: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
  },
  claimStatus: {
    fontSize: 14,
    marginHorizontal: 10,
  },
  claimCost: {
    fontSize: 14,
    color: '#0288d1',
    fontWeight: 'bold',
  },
});