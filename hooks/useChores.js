import { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { AccessibilityInfo, Alert } from 'react-native';

// Usage: const { chores, loading, error, addChore, updateChore, deleteChore, refresh } = useChores(userId);
export default function useChores(userId) {
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch chores from Firestore
  const fetchChores = async () => {
    setLoading(true);
    try {
      const snapshot = await firestore()
        .collection('chores')
        .where('userId', '==', userId)
        .orderBy('created', 'desc')
        .get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChores(data);
      setError(null);
      AccessibilityInfo.announceForAccessibility(`Loaded ${data.length} chores`);
    } catch (e) {
      setError(e);
      AccessibilityInfo.announceForAccessibility(`Failed to load chores: ${e.message}`);
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) {
      setChores([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Real-time updates
    const unsubscribe = firestore()
      .collection('chores')
      .where('userId', '==', userId)
      .orderBy('created', 'desc')
      .onSnapshot(
        snapshot => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setChores(data);
          setLoading(false);
          AccessibilityInfo.announceForAccessibility(`Updated chores list, ${data.length} items`);
        },
        err => {
          setError(err);
          setLoading(false);
          AccessibilityInfo.announceForAccessibility(`Failed to update chores: ${err.message}`);
        }
      );
    return () => unsubscribe();
  }, [userId]);

  // Add a new chore
  const addChore = async (chore) => {
    if (!userId) {
      setError(new Error('No user ID'));
      AccessibilityInfo.announceForAccessibility('Cannot add chore: No user ID');
      return;
    }
    try {
      await firestore().collection('chores').add({
        ...chore,
        userId,
        created: Date.now(),
      });
      AccessibilityInfo.announceForAccessibility('Chore added');
    } catch (e) {
      setError(e);
      AccessibilityInfo.announceForAccessibility(`Failed to add chore: ${e.message}`);
      Alert.alert('Error', e.message);
    }
  };

  // Update a chore
  const updateChore = async (id, updates) => {
    try {
      await firestore().collection('chores').doc(id).update(updates);
      AccessibilityInfo.announceForAccessibility('Chore updated');
    } catch (e) {
      setError(e);
      AccessibilityInfo.announceForAccessibility(`Failed to update chore: ${e.message}`);
      Alert.alert('Error', e.message);
    }
  };

  // Delete a chore
  const deleteChore = async (id) => {
    try {
      await firestore().collection('chores').doc(id).delete();
      AccessibilityInfo.announceForAccessibility('Chore deleted');
    } catch (e) {
      setError(e);
      AccessibilityInfo.announceForAccessibility(`Failed to delete chore: ${e.message}`);
      Alert.alert('Error', e.message);
    }
  };

  // Manual refresh
  const refresh = fetchChores;

  return {
    chores,
    loading,







}  };    refresh,    deleteChore,    updateChore,    addChore,    error,    error,
    addChore,
    updateChore,
    deleteChore,
    refresh,
  };
}