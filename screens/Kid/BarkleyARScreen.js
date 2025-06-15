import React, { useState, useRef } from 'react';
import { View, Button, Text, AccessibilityInfo, Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  ViroARSceneNavigator,
  ViroARScene,
  Viro3DObject,
  ViroAmbientLight,
  ViroARPlaneSelector,
  ViroNode,
  ViroQuad,
} from '@viro-community/react-viro';

const BARKLEY_MODEL = require('../../assets/barkley.glb');

function BarkleyARScene(props) {
  const [position, setPosition] = useState([0, 0, 0]);
  const [scale, setScale] = useState([0.2, 0.2, 0.2]);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [animation, setAnimation] = useState(null);
  const [placed, setPlaced] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  // Expose reset function to parent via props
  React.useEffect(() => {
    if (props.sceneNavigator && props.sceneNavigator.viroAppProps) {
      props.sceneNavigator.viroAppProps.setReset(() => {
        setPosition([0, 0, 0]);
        setScale([0.2, 0.2, 0.2]);
        setRotation([0, 0, 0]);
        setPlaced(false);
        AccessibilityInfo.announceForAccessibility('Barkley reset.');
      });
    }
  }, [props.sceneNavigator]);

  // Pinch to scale Barkley
  const handlePinch = (pinchState, scaleFactor, source) => {
    if (pinchState === 3) return; // Ended
    const newScale = scale.map(s => Math.max(0.05, Math.min(0.5, s * scaleFactor)));
    setScale(newScale);
  };

  // Rotate Barkley with two fingers
  const handleRotate = (rotateState, rotationFactor, source) => {
    if (rotateState === 3) return; // Ended
    setRotation([0, rotation[1] + rotationFactor, 0]);
  };

  // Tap Barkley to animate (if supported)
  const handleBarkleyClick = () => {
    setAnimation('jump'); // Replace 'jump' with your animation name if needed
    AccessibilityInfo.announceForAccessibility('Barkley jumps!');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => setAnimation(null), 1200);
  };

  // When user taps the plane, place Barkley there
  const handlePlaneClick = (source, pos, normal) => {
    if (!placed) {
      setPosition(pos);
      setPlaced(true);
      AccessibilityInfo.announceForAccessibility('Barkley placed.');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setPosition(pos);
      AccessibilityInfo.announceForAccessibility('Barkley moved.');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" />
      <ViroARPlaneSelector>
        <ViroNode
          position={position}
          onClick={handlePlaneClick}
          dragType="FixedToWorld"
        >
          {/* Placement indicator if not placed */}
          {!placed && (
            <Viro3DObject
              source={BARKLEY_MODEL}
              position={[0, 0, 0]}
              scale={[0.1, 0.1, 0.1]}
              rotation={rotation}
              type="GLB"
              opacity={0.3}
            />
          )}
          {/* Barkley appears after placement */}
          {placed && (
            <>
              <Viro3DObject
                source={BARKLEY_MODEL}
                position={[0, 0, 0]}
                scale={scale}
                rotation={rotation}
                type="GLB"
                onPinch={handlePinch}
                onRotate={handleRotate}
                onClick={handleBarkleyClick}
                animation={animation ? { name: animation, run: true, loop: false } : undefined}
              />
              <ViroQuad
                rotation={[-90, 0, 0]}
                width={0.5}
                height={0.5}
                position={[0, -0.01, 0]}
                arShadowReceiver={true}
              />
            </>
          )}
        </ViroNode>
      </ViroARPlaneSelector>
      {showHelp && (
        <View style={{
          position: 'absolute', top: 40, left: 20, right: 20, backgroundColor: '#fff9', padding: 16, borderRadius: 12, zIndex: 10
        }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>How to use AR Barkley:</Text>
          <Text>- Move your device to detect a surface</Text>
          <Text>- Tap the indicator to place Barkley</Text>
          <Text>- Pinch to resize</Text>
          <Text>- Twist to rotate</Text>
          <Text>- Tap Barkley to animate</Text>
          <Button title="Got it!" onPress={() => {
            setShowHelp(false);
            AccessibilityInfo.announceForAccessibility('Help closed.');
          }} />
        </View>
      )}
    </ViroARScene>
  );
}

export default function BarkleyARScreen({ navigation }) {
  const resetRef = useRef(() => {});
  return (
    <View style={{ flex: 1 }}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{ scene: BarkleyARScene }}
        viroAppProps={{
          setReset: fn => { resetRef.current = fn; }
        }}
        style={{ flex: 1 }}
      />
      <Button title="Reset Barkley" onPress={() => {
        resetRef.current();
        AccessibilityInfo.announceForAccessibility('Barkley reset.');
      }} />
      <Button title="Back to Home" onPress={() => {
        navigation.goBack();
        AccessibilityInfo.announceForAccessibility('Back to home.');
      }} />
    </View>
  );
}