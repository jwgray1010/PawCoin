import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, AccessibilityInfo } from 'react-native';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, getDoc, query, where } from 'firebase/firestore';
import KidPicker from '../../components/KidPicker';
import * as Haptics from 'expo-haptics';

export default function ClaimApprovalScreen() {
  const [kids, setKids] = useState([]);
  const [selectedKidId, setSelectedKidId] = useState(null);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Accessibility: Announce screen on mount
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility('Pending reward claims screen. Select a kid to review claims.');
  }, []);

  // Fetch all kids (assumes you have a 'users' collection with a 'role' field)
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'kid')),
      (snapshot) => {
        const kidList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setKids(kidList);
        if (!selectedKidId && kidList.length > 0) setSelectedKidId(kidList[0].id);
      }
    );
    return unsub;
  }, []);

  // Fetch pending claims for selected kid
  useEffect(() => {
    if (!selectedKidId) return;
    const q = query(
      collection(db, 'claims'),
      where('kidId', '==', selectedKidId),
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setPendingClaims(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, [selectedKidId]);

  const handleApprove = async (claim) => {
    // Deduct coins from kid's balance
    const userRef = doc(db, 'users', claim.kidId);
    const userSnap = await getDoc(userRef);
    const currentCoins = userSnap.exists() ? userSnap.data().coins || 0 : 0;
    if (currentCoins < claim.cost) {
      AccessibilityInfo.announceForAccessibility('Not enough coins to approve claim.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Not enough coins', 'Kid does not have enough coins.');
      await updateDoc(doc(db, 'claims', claim.id), { status: 'rejected' });
      return;
    }
    await updateDoc(userRef, { coins: currentCoins - claim.cost });
    await updateDoc(doc(db, 'claims', claim.id), { status: 'approved' });
    AccessibilityInfo.announceForAccessibility('Claim approved.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Claim Approved');
  };

  const handleReject = async (claimId) => {
    await updateDoc(doc(db, 'claims', claimId), { status: 'rejected' });
    AccessibilityInfo.announceForAccessibility('Claim rejected.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Claim Rejected');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Reward Claims</Text>
      <KidPicker kids={kids} selectedKidId={selectedKidId} onSelect={setSelectedKidId} />
      {loading ? (
        <ActivityIndicator size="large" color="#0288d1" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={pendingClaims}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.claimBox}>
              <Text style={styles.claimName}>{item.rewardName}</Text>
              <Text style={styles.claimCost}>Cost: {item.cost} coins</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#0288d1' }]}
                  onPress={() => handleApprove(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Approve claim for ${item.rewardName}, cost ${item.cost} coins`}
                >
                  <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#d32f2f' }]}
                  onPress={() => handleReject(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Reject claim for ${item.rewardName}`}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No pending claims for this kid.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b3e5fc', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0288d1', marginBottom: 24, alignSelf: 'center' },
  claimBox: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, alignItems: 'center' },
  claimName: { fontSize: 18, fontWeight: 'bold', color: '#0288d1', marginBottom: 8 },
  claimCost: { fontSize: 16, color: '#333', marginBottom: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center' },
  button: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginHorizontal: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyText: { color: '#0288d1', fontSize: 16, textAlign: 'center', marginTop: 40 },
});