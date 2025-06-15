/**
 * Configuration for PawCoin token.
 * You can expand this for more advanced tokenomics or blockchain integration.
 */

import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

const tokenConfig = {
  name: 'PawCoin',
  symbol: 'PAW',
  decimals: 0, // No fractional coins for simplicity
  initialSupply: 0, // Each wallet starts at 0
  maxSupply: 1000000, // Example: max PawCoins in the system
  icon: require('../assets/pawcoin-icon.png'), // Optional: token icon
  description: 'PawCoin is a fun family currency for chores and rewards!',
};

// Announce token info for accessibility and haptics
export function announceTokenInfo() {
  AccessibilityInfo.announceForAccessibility(
    `Token: ${tokenConfig.name}, symbol ${tokenConfig.symbol}, max supply ${tokenConfig.maxSupply}.`
  );
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export default tokenConfig;