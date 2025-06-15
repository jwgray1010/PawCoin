import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, AccessibilityInfo, TouchableOpacity, Image } from 'react-native';
import colors from '../constants/colors';
import fonts from '../constants/fonts';

const PAW_ICON = require('../assets/paw_coin.png'); // Optional: add your own icon

/**
 * Displays a badge with the user's Paw Points.
 * @param {Object} props
 * @param {number} props.points - The number of Paw Points to display.
 * @param {Object} [props.style] - Optional style overrides.
 * @param {string} [props.label] - Optional label override.
 * @param {string} [props.accessibilityLabel] - Optional accessibility label.
 * @param {function} [props.onPress] - Optional press handler.
 * @param {string} [props.color] - Optional badge color.
 * @param {boolean} [props.showIcon] - Show paw icon.
 */
export default function PointBadge({
  points = 0,
  style,
  label = 'Paw Points',
  accessibilityLabel,
  onPress,
  color,
  showIcon = true,
}) {
  const badgeColor = color || colors.primary;
  const { width } = Dimensions.get('window');
  const scale = Math.min(width / 375, 1.2);

  // Accessibility: Announce points
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      accessibilityLabel || `${points} ${label}`
    );
  }, [points, label, accessibilityLabel]);

  const badgeContent = (
    <View style={[
      styles.badge,
      { backgroundColor: badgeColor, paddingVertical: 8 * scale, paddingHorizontal: 18 * scale, borderRadius: 24 * scale },
      style,
    ]}>
      <View style={styles.row}>
        {showIcon && (
          <Image
            source={PAW_ICON}
            style={{ width: 24 * scale, height: 24 * scale, marginRight: 7 }}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        )}
        <Text style={[styles.pointsText, { fontSize: 22 * scale }]}>{typeof points === 'number' ? points : 0}</Text>
      </View>
      <Text style={[styles.label, { fontSize: 13 * scale }]}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || `${points} ${label}`}
      >
        {badgeContent}
      </TouchableOpacity>
    );
  }

  return badgeContent;
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    minWidth: 80,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    color: colors.textLight,
    fontFamily: fonts.bold,
    fontWeight: 'bold',
  },
  label: {
    color: colors.accent,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
});