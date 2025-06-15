import React from 'react';
import { View, Text, Image, StyleSheet, Platform, TouchableOpacity, AccessibilityInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const WALLETCONNECT_LOGO = require('../../assets/walletconnectlogo.png');

export default function ParentHomeScreen() {
  const navigation = useNavigation();

  const handleHomePress = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'ParentHome' }],
    });
  };

  const handleNav = (screen, label) => {
    AccessibilityInfo.announceForAccessibility(`${label} selected.`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate(screen);
  };

  const handleOpenWallet = () => {
    // TODO: Add your wallet connect logic here
    alert('Open Wallet pressed!');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Home button with logo */}
      <TouchableOpacity
        style={styles.logoBtn}
        onPress={handleHomePress}
        accessibilityRole="button"
        accessibilityLabel="Go to Home"
      >
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      </TouchableOpacity>

      {/* Dashboard icons and content */}
      <View style={styles.iconRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleNav('ParentChores', 'Manage Chores')}
          accessibilityRole="button"
          accessibilityLabel="Manage Chores"
        >
          <Image source={require('../../assets/icons/chores.png')} style={styles.iconImg} />
          <Text style={styles.iconLabel}>Chores</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleNav('ClaimApproval', 'Approve Claims')}
          accessibilityRole="button"
          accessibilityLabel="Approve Claims"
        >
          <Image source={require('../../assets/icons/claim.png')} style={styles.iconImg} />
          <Text style={styles.iconLabel}>Claims</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleNav('AssignChore', 'Assign Chore')}
          accessibilityRole="button"
          accessibilityLabel="Assign Chore"
        >
          <Image source={require('../../assets/icons/assign.png')} style={styles.iconImg} />
          <Text style={styles.iconLabel}>Assign</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleNav('ParentARSetup', 'AR Setup')}
          accessibilityRole="button"
          accessibilityLabel="AR Setup"
        >
          <Image source={require('../../assets/icons/ar.png')} style={styles.iconImg} />
          <Text style={styles.iconLabel}>AR Setup</Text>
        </TouchableOpacity>
      </View>

      {/* WalletConnect button */}
      <TouchableOpacity
        style={styles.walletBtn}
        onPress={handleOpenWallet}
        accessibilityRole="button"
        accessibilityLabel="Open Wallet"
      >
        <Image
          source={WALLETCONNECT_LOGO}
          style={{ width: 48, height: 48, marginBottom: 8 }}
          resizeMode="contain"
        />
        <Text style={{ color: '#0288d1', fontWeight: 'bold', fontSize: 16 }}>
          Open Wallet
        </Text>
      </TouchableOpacity>

      <View
        style={styles.barkleyContainer}
        accessible={true}
        accessibilityRole="alert"
      >
        <Image
          source={require('../../assets/barkley.png')}
          style={styles.barkleyImage}
          accessibilityLabel="Barkley the mascot"
        />
        <Text
          style={styles.barkleyText}
          accessibilityRole="text"
        >
          Tap an icon to get started!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b3e5fc', // PawPal light blue
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
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 90,
    marginBottom: 40,
  },
  iconBtn: {
    alignItems: 'center',
    backgroundColor: '#E6F7FF',
    borderRadius: 18,
    padding: 18,
    width: 80,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  iconImg: {
    width: 36,
    height: 36,
    marginBottom: 8,
  },
  iconLabel: {
    fontSize: 14,
    color: '#0288d1',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  walletBtn: {
    alignItems: 'center',
    backgroundColor: '#E1F5FE',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 50,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  barkleyContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#E6F7FF',
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4, // Android shadow
  },
  barkleyImage: {
    width: 44,
    height: 44,
    marginRight: 14,
  },
  barkleyText: {
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'Baloo2_400Regular',
      android: 'Baloo2_400Regular',
      default: 'System',
    }),
    color: '#333',
  },
});
