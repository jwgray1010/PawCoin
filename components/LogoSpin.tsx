import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, TouchableOpacity, AccessibilityInfo, Dimensions, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

type LogoSpinProps = {
  size?: number;
  duration?: number;
  alt?: string;
  accessible?: boolean;
  hapticOnPress?: boolean;
  paused?: boolean;
};

export default function LogoSpin({
  size,
  duration = 2000,
  alt = 'PawCoin Logo',
  accessible = true,
  hapticOnPress = false,
  paused = false,
}: LogoSpinProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [isPaused, setIsPaused] = useState(paused);

  const logoSize = size || Math.min(Dimensions.get('window').width, 320) * 0.5;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Accessibility: Announce logo
  useEffect(() => {
    if (accessible) AccessibilityInfo.announceForAccessibility(alt);
  }, [alt, accessible]);

  // Spin animation
  useEffect(() => {
    let isMounted = true;
    const startSpin = () => {
      if (!isMounted || isPaused) return;
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => startSpin());
    };
    startSpin();
    return () => {
      isMounted = false;
    };
  }, [spinValue, duration, isPaused]);

  // Pause/resume on prop change
  useEffect(() => {
    setIsPaused(paused);
  }, [paused]);

  // Haptic feedback on tap
  const handlePress = () => {
    if (hapticOnPress) Haptics.selectionAsync();
    setIsPaused((prev) => !prev);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      accessible={accessible}
      accessibilityLabel={alt}
      accessibilityRole="imagebutton"
      style={styles.center}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: logoSize, height: logoSize }}
          resizeMode="contain"
          accessibilityLabel={alt}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});