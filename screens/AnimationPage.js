import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, AccessibilityInfo } from 'react-native';
import { ViroARSceneNavigator, ViroARScene, Viro3DObject, ViroAmbientLight } from 'react-viro';
import * as Haptics from 'expo-haptics';

const MODEL = require('../assets/your_model.glb'); // Replace with your .glb file path

function AnimationScene({ animation }) {
  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" />
      <Viro3DObject
        source={MODEL}
        resources={[]} // Add any additional resources if needed
        position={[0, 0, -1]}
        scale={[0.2, 0.2, 0.2]}
        type="GLB"
        animation={{ name: animation, run: true, loop: true }}
      />
    </ViroARScene>
  );
}

export default function AnimationPage() {
  const [animation, setAnimation] = useState('walk'); // Default animation

  const handleAnimationChange = (anim) => {
    setAnimation(anim);
    AccessibilityInfo.announceForAccessibility(`${anim.charAt(0).toUpperCase() + anim.slice(1)} animation selected.`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: () => <AnimationScene animation={animation} />
        }}
        key={animation} // Force re-mount to update animation
        style={styles.arView}
      />
      <View style={styles.buttonRow}>
        {['walk', 'run', 'talk', 'jump'].map(anim => (
          <TouchableOpacity
            key={anim}
            style={[
              styles.button,
              animation === anim && styles.buttonActive
            ]}
            onPress={() => handleAnimationChange(anim)}
            accessibilityRole="button"
            accessibilityLabel={`${anim.charAt(0).toUpperCase() + anim.slice(1)} animation`}
          >
            <Text style={styles.buttonText}>{anim.charAt(0).toUpperCase() + anim.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  arView: { flex: 1 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fffbe9',
  },
  button: {
    backgroundColor: '#0288d1',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  buttonActive: {
    backgroundColor: '#01579b',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});