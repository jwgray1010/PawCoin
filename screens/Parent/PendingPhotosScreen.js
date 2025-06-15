import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, AccessibilityInfo } from 'react-native';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useIsFocused } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { setDoc } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';

export default function PendingPhotosScreen() {
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      const unsub = onSnapshot(
        collection(db, 'photos'),
        (snapshot) => {
          setPendingPhotos(
            snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(photo => photo.status === 'pending')
          );
        }
      );
      return unsub;
    }
  }, [isFocused]);

  const handleApprove = async (photoId) => {
    await updateDoc(doc(db, 'photos', photoId), { status: 'approved' });
    AccessibilityInfo.announceForAccessibility('Photo approved.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Photo Approved');
  };

  const handleReject = async (photoId) => {
    await updateDoc(doc(db, 'photos', photoId), { status: 'rejected' });
    AccessibilityInfo.announceForAccessibility('Photo rejected.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Photo Rejected');
  };

  // Example function to upload and submit a photo for approval
  const submitPhotoForApproval = async (photoUri, kidId, parentId) => {
    // 1. Upload photo to Firebase Storage
    const response = await fetch(photoUri);
    const blob = await response.blob();
    const storage = getStorage();
    const photoRef = ref(storage, `kid_photos/${kidId}_${Date.now()}.jpg`);
    await uploadBytes(photoRef, blob);
    const photoUrl = await getDownloadURL(photoRef);

    // 2. Create Firestore doc with status "pending"
    await addDoc(collection(db, 'photos'), {
      kidId,
      parentId,
      photoUrl,
      status: 'pending',
      createdAt: new Date(),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Photo Approvals</Text>
      <FlatList
        data={pendingPhotos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.photoBox}>
            <Image source={{ uri: item.photoUrl }} style={styles.photo} />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#0288d1' }]}
                onPress={() => handleApprove(item.id)}
                accessibilityRole="button"
                accessibilityLabel="Approve photo"
              >
                <Text style={styles.buttonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#d32f2f' }]}
                onPress={() => handleReject(item.id)}
                accessibilityRole="button"
                accessibilityLabel="Reject photo"
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No pending photos.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b3e5fc', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0288d1', marginBottom: 24 },
  photoBox: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, alignItems: 'center' },
  photo: { width: 200, height: 200, borderRadius: 16, marginBottom: 16, backgroundColor: '#eee' },
  buttonRow: { flexDirection: 'row', justifyContent: 'center' },
  button: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginHorizontal: 10,
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyText: { color: '#0288d1', fontSize: 16, textAlign: 'center', marginTop: 40 },
});

// Cloud Function (for reference, not part of React Native app)
/*
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.notifyParentOnPendingPhoto = functions.firestore
  .document('photos/{photoId}')
  .onCreate(async (snap, context) => {
    const photo = snap.data();
    if (photo.status !== 'pending') return null;

    // Get parent's FCM token
    const parentDoc = await admin.firestore().collection('users').doc(photo.parentId).get();
    const fcmToken = parentDoc.get('fcmToken');
    if (!fcmToken) return null;

    const message = {
      notification: {
        title: 'Photo Approval Needed',
        body: 'A new photo is waiting for your approval.',
      },
      data: {
        photoId: snap.id,
      },
      token: fcmToken,
    };

    return admin.messaging().send(message);
  });
*/

// Register parent for push notifications
export async function registerParentForPush(parentId) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;
  await setDoc(doc(db, 'users', parentId), { fcmToken: token }, { merge: true });
}