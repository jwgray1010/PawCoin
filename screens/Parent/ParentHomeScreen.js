import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Alert, ScrollView, AccessibilityInfo, Dimensions } from 'react-native';
import { useFonts, Baloo2_700Bold } from '@expo-google-fonts/baloo-2';
import { ViroARSceneNavigator, Viro3DObject, ViroAmbientLight, ViroARScene } from '@viro-community/react-viro';
import { Audio } from 'expo-av';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
const LOGO = require('../../assets/logo.png');
import * as Haptics from 'expo-haptics';

const funFacts = [
  "Dogs have three eyelids!",
  "A dog’s nose print is as unique as a human’s fingerprint.",
  "Dogs can learn more than 1000 words.",
  "The Basenji is the only barkless dog.",
  "Dogs dream just like humans do.",
];

const poses = [
  { scale: [0.2, 0.2, 0.2], rotation: [0, 0, 0] },
  { scale: [0.25, 0.2, 0.2], rotation: [0, 30, 0] },
  { scale: [0.2, 0.25, 0.2], rotation: [0, -30, 0] },
  { scale: [0.22, 0.22, 0.22], rotation: [0, 0, 20] },
  { scale: [0.18, 0.18, 0.18], rotation: [0, 0, -20] },
];

const BarkleyScene = ({ onBarkleyTap, onBarkleyLongPress, scale, rotation }) => (
  <ViroARScene>
    <ViroAmbientLight color="#ffffff" />
    <Viro3DObject
      source={require('../../assets/barkley.glb')}
      resources={[]}
      position={[0, 0, -2]}
      scale={scale}
      rotation={rotation}
      type="GLB"
      onClick={onBarkleyTap}
      onClickState={(state, pos, src) => {
        if (state === 3) onBarkleyLongPress();
      }}
    />
  </ViroARScene>
);

export default function ParentHomeScreen() {
  const [barkleyScale, setBarkleyScale] = useState([0.2, 0.2, 0.2]);
  const [barkleyRotation, setBarkleyRotation] = useState([0, 0, 0]);
  const [lastFact, setLastFact] = useState('');
  const animating = useRef(false);
  const navigation = useNavigation();

  let [fontsLoaded] = useFonts({ Baloo2_700Bold });
  if (!fontsLoaded) return null;

  // Play bark sound
  const playBarkSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/bark.mp3')
      );
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 1000);
    } catch (e) {
      console.log('Error playing bark sound:', e);
    }
  };

  // Random pose/animation on tap
  const handleBarkleyTap = () => {
    if (animating.current) return;
    animating.current = true;
    playBarkSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    AccessibilityInfo.announceForAccessibility('Barkley tapped.');
    // Pick a random pose different from the current one
    let nextPose;
    do {
      nextPose = poses[Math.floor(Math.random() * poses.length)];
    } while (
      JSON.stringify(nextPose.scale) === JSON.stringify(barkleyScale) &&
      JSON.stringify(nextPose.rotation) === JSON.stringify(barkleyRotation)
    );
    setBarkleyScale(nextPose.scale);
    setBarkleyRotation(nextPose.rotation);
    setTimeout(() => {
      setBarkleyScale([0.2, 0.2, 0.2]);
      setBarkleyRotation([0, 0, 0]);
      animating.current = false;
    }, 600);
  };

  // Show fun fact on long press
  const handleBarkleyLongPress = () => {
    const fact = funFacts[Math.floor(Math.random() * funFacts.length)];
    setLastFact(fact);
    AccessibilityInfo.announceForAccessibility(`Barkley says: ${fact}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Barkley says:", fact);
  };

  const handleShowQR = () => {
    AccessibilityInfo.announceForAccessibility('Show My QR selected.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ShareQRScreen', { data: 'some-data' });
  };

  // Add accessibility and haptics to menu navigation
  const handleMenuNav = (screen, label, hint) => {
    AccessibilityInfo.announceForAccessibility(`${label} selected.${hint ? ' ' + hint : ''}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* WalletConnect logo button in top right */}
      <TouchableOpacity
        style={styles.walletLogoBtn}
        onPress={() => {
          // TODO: Replace with your wallet connect logic
          alert('Open Wallet pressed!');
        }}
        accessibilityRole="button"
        accessibilityLabel="Open Wallet"
      >
        <Image
          source={require('../../assets/walletconnectlogo.png')}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.title, { fontFamily: 'Baloo2_700Bold', color: '#0288d1' }]}>
          Welcome to PawCoin!
        </Text>
        <View style={styles.barkleyContainer}>
          <ViroARSceneNavigator
            autofocus={true}
            initialScene={{
              scene: () => (
                <BarkleyScene
                  onBarkleyTap={handleBarkleyTap}
                  onBarkleyLongPress={handleBarkleyLongPress}
                  scale={barkleyScale}
                  rotation={barkleyRotation}
                />
              ),
            }}
            style={styles.barkley}
          />
        </View>
        {lastFact ? (
          <Text style={styles.funFact}>🐾 {lastFact}</Text>
        ) : null}
        <TouchableOpacity
          style={styles.qrButton}
          onPress={handleShowQR}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Show My QR"
        >
          <Text style={styles.qrButtonText}>Show My QR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleMenuNav('ForgotPassword', 'Forgot Password')}
          accessibilityRole="button"
          accessibilityLabel="Forgot Password"
        >
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleMenuNav('RoleSelect', 'Sign Up')}
          accessibilityRole="button"
          accessibilityLabel="Sign Up"
        >
          <Text style={styles.link}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleMenuNav('Wallet', 'Go to Wallet', 'View your PawCoin wallet and transactions')}
          accessibilityRole="button"
          accessibilityLabel="Go to Wallet"
          accessibilityHint="View your PawCoin wallet and transactions"
        >
          <FontAwesome name="credit-card" size={22} color="#0288d1" style={styles.icon} />
          <Text style={styles.menuText}>Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleMenuNav('ParentChores', 'Go to Chores')}
          accessibilityRole="button"
          accessibilityLabel="Go to Chores"
        >
          <FontAwesome name="list-ul" size={22} color="#0288d1" style={styles.icon} />
          <Text style={styles.menuText}>Chores</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleMenuNav('ParentARSetup', 'Go to AR Setup')}
          accessibilityRole="button"
          accessibilityLabel="Go to AR Setup"
        >
          <MaterialIcons name="view-in-ar" size={24} color="#0288d1" style={styles.icon} />
          <Text style={styles.menuText}>AR Setup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleMenuNav('QRscanner', 'Open QR Scanner')}
          accessibilityRole="button"
          accessibilityLabel="Open QR Scanner"
        >
          <FontAwesome name="qrcode" size={22} color="#0288d1" style={styles.icon} />
          <Text style={styles.menuText}>QR Scanner</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fffbe9' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#0288d1' },
  logo: { width: 90, height: 90, marginBottom: 16, alignSelf: 'center' },
  barkleyContainer: { width: 220, height: 220, marginBottom: 24 },
  barkley: { flex: 1 },
  qrButton: {
    backgroundColor: '#0288d1',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 20,
  },
  qrButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  link: {
    marginTop: 10,
    color: '#0288d1',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  funFact: {
    fontSize: 16,
    color: '#795548',
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1f5fe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
  },
  icon: { marginRight: 16 },
  menuText: {
    fontSize: 18,
    color: '#0288d1',
    fontWeight: 'bold',
  },
  walletLogoBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 6,
  },
});