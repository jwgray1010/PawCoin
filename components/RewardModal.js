import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, AccessibilityInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
// Optionally import a confetti component if you want animation
import ConfettiCannon from 'react-native-confetti-cannon';
// import BarkleyAnimation from './BarkleyAnimation';

const LOGO = require('../assets/logo.png');

export default function RewardModal({
  visible,
  onClose,
  reward,
  pointsLabel = "Paw Points",
  showConfetti = false,
  barkleyAnimation = "attack2",
}) {
  const navigation = useNavigation();
  const { width } = Dimensions.get('window');
  const modalWidth = Math.min(width * 0.9, 340);

  // Accessibility: Announce reward
  useEffect(() => {
    if (visible && reward) {
      AccessibilityInfo.announceForAccessibility(
        `Reward: ${reward.title || 'Reward'}${reward.points ? `, ${reward.points} ${pointsLabel}` : ''}. ${reward.description || ''}`
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible, reward, pointsLabel]);

  if (!reward) return null;

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onClose) onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
      accessible
      accessibilityViewIsModal
      accessibilityLabel={`Reward: ${reward.title || 'Reward'}`}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { width: modalWidth }]}>
          {/* Home button with logo */}
          <TouchableOpacity
            style={styles.logoBtn}
            onPress={() => navigation.navigate('Dashboard')}
            accessibilityRole="button"
            accessibilityLabel="Go to Home"
          >
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </TouchableOpacity>
          {/* Confetti animation */}
          {showConfetti && (
            <ConfettiCannon count={100} origin={{ x: modalWidth / 2, y: 0 }} fadeOut explosionSpeed={350} fallSpeed={2500} />
          )}
          {/* Barkley celebration animation */}
          {/* <BarkleyAnimation animation={barkleyAnimation} style={{ width: 120, height: 120, marginBottom: 18 }} /> */}
          {/* You can replace with an emoji, logo, or nothing: */}
          <Text style={{ fontSize: 60, marginBottom: 18 }}>🐾</Text>
          {/* Reward image */}
          {reward.image && (
            <Image source={reward.image} style={styles.image} resizeMode="contain" accessibilityLabel="Reward image" />
          )}
          <Text style={styles.title}>{reward.title || "Reward!"}</Text>
          {reward.points !== undefined && (
            <Text style={styles.points}>+{reward.points} {pointsLabel}</Text>
          )}
          <Text style={styles.description}>{reward.description}</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close reward modal"
          >
            <Text style={styles.closeText}>Yay!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(40,40,40,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fffbe9',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: 320,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  logoBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 6,
  },
  logo: {
    width: 36,
    height: 36,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#795548',
    marginBottom: 8,
    textAlign: 'center',
  },
  points: {
    fontSize: 18,
    color: '#0288d1',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#795548',
    textAlign: 'center',
    marginBottom: 18,
  },
  closeBtn: {
    backgroundColor: '#0288d1',
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 8,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});