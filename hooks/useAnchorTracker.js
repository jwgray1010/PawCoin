import { useState } from 'react';
import { AccessibilityInfo, Alert } from 'react-native';
import { db } from '../lib/firebase'; // adjust path as needed
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Custom hook to track anchor/chore state and notify parent.
 * @param {object} anchor - The anchor/chore object
 * @param {function} [onNotifyParent] - Optional callback(type, anchor, duration)
 */
export default function useAnchorTracker(anchor, onNotifyParent) {
  const [startedAt, setStartedAt] = useState(anchor?.startedAt || null);
  const [finishedAt, setFinishedAt] = useState(anchor?.finishedAt || null);
  const [completed, setCompleted] = useState(anchor?.completed || false);

  // Start the chore
  const startChore = () => {
    if (!anchor) {
      Alert.alert('No chore found');
      return;
    }
    const now = Date.now();
    setStartedAt(now);
    setFinishedAt(null);
    setCompleted(false);
    AccessibilityInfo.announceForAccessibility(`Chore "${anchor.name}" started`);
    if (onNotifyParent) {
      onNotifyParent('started', anchor, 0);
    }
  };

  // Finish the chore
  const finishChore = () => {
    if (!startedAt) return false;
    const now = Date.now();
    setFinishedAt(now);
    const duration = (now - startedAt) / 1000;
    if (duration >= (anchor.minDurationSeconds || 60)) {
      setCompleted(true);
      AccessibilityInfo.announceForAccessibility(`Chore "${anchor.name}" completed in ${Math.round(duration)} seconds`);
      if (onNotifyParent) {
        onNotifyParent('completed', anchor, duration);
      }
      return true;
    } else {
      setCompleted(false);
      AccessibilityInfo.announceForAccessibility(`Chore "${anchor.name}" finished too quickly (${Math.round(duration)} seconds)`);
      if (onNotifyParent) {
        onNotifyParent('too_short', anchor, duration);
      }
      return false;
    }
  };

  // Duration in seconds
  const duration = startedAt && finishedAt ? Math.floor((finishedAt - startedAt) / 1000) : 0;

  // Reset chore state
  const resetChore = () => {
    setStartedAt(null);
    setFinishedAt(null);
    setCompleted(false);
    AccessibilityInfo.announceForAccessibility('Chore reset');
  };

  return {
    startedAt,
    finishedAt,
    completed,
    duration,
    startChore,
    finishChore,
    resetChore,
  };
}

// --- Example notification handler and cloud function ---

import useAnchorTracker from '../hooks/useAnchorTracker';

const handleNotifyParent = async (type, anchor, duration) => {
  let message = '';
  if (type === 'started') {
    message = `Chore "${anchor.name}" was started.`;
  } else if (type === 'completed') {
    message = `Chore "${anchor.name}" was completed in ${Math.round(duration)} seconds!`;
  } else if (type === 'too_short') {
    message = `Chore "${anchor.name}" was finished too quickly (${Math.round(duration)}s).`;
  }

  // Write notification to Firestore
  await addDoc(collection(db, 'notifications'), {
    parentId: anchor.parentId,
    kidId: anchor.assignedKidId,
    anchorId: anchor.id,
    anchorName: anchor.name,
    duration,
    type,
    message,
    timestamp: serverTimestamp(),
    read: false,
  });
};

// --- Example usage ---
/*
const anchor = { ... };
const {
  startedAt, finishedAt, completed, duration,
  startChore, finishChore, resetChore
} = useAnchorTracker(anchor, handleNotifyParent);
*/

// --- Cloud Function for FCM notification ---

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendParentNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    if (!notification || !notification.parentId) return null;

    const parentId = notification.parentId;
    // Get parent's FCM token
    const parentDoc = await admin.firestore().collection('users').doc(parentId).get();
    const fcmToken = parentDoc.get('fcmToken');
    if (!fcmToken) return null;

    // Optionally fetch kid's name for a more personal message
    let kidName = '';
    if (notification.kidId) {
      const kidDoc = await admin.firestore().collection('users').doc(notification.kidId).get();
      kidName = kidDoc.exists ? kidDoc.get('name') : '';
    }

    // Customize notification title and body
    let title = 'Chore Update';
    let body = notification.message;
    if (kidName && notification.type === 'completed') {
      title = 'Chore Completed!';
      body = `${kidName} finished "${notification.anchorName || 'a chore'}" in ${Math.round(notification.duration || 0)} seconds!`;
    } else if (kidName && notification.type === 'started') {
      title = 'Chore Started';
      body = `${kidName} started "${notification.anchorName || 'a chore'}".`;
    } else if (kidName && notification.type === 'too_short') {
      title = 'Chore Too Quick';
      body = `${kidName} finished "${notification.anchorName || 'a chore'}" too quickly (${Math.round(notification.duration || 0)}s).`;
    }

    const message = {
      notification: {
        title,
        body,
      },
      token: fcmToken,
      data: {
        anchorId: notification.anchorId || '',
        type: notification.type || '',
        kidId: notification.kidId || '',
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    return admin.messaging().send(message);
  });