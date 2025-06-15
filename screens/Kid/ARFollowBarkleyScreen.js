import React, { useEffect, useState, useRef } from 'react';
import { AccessibilityInfo, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ViroARScene, ViroARSceneNavigator, Viro3DObject, ViroAmbientLight, ViroAnimations, ViroNode, ViroSound, ViroImage, ViroParticleEmitter } from 'react-viro';

const BARKLEY_MODEL = require('../../assets/barkley.glb');
const BARK_SOUND = require('../../assets/bark.mp3');
const COIN_IMAGE = require('../../assets/logo.png');
const CONFETTI_IMAGE = require('../../assets/confetti_particle.png'); // Add a confetti image to your assets

function distance(a, b) {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow(a[2] - b[2], 2)
  );
}

function BarkleyARScene({ anchorPosition, onChoreComplete }) {
  const initialPosition = [0, 0, -0.6];
  const [moveAnim, setMoveAnim] = useState(null);
  const [jumpAnim, setJumpAnim] = useState('barkleyJump');
  const [isAtAnchor, setIsAtAnchor] = useState(false);
  const [showBark, setShowBark] = useState(false);
  const [lookBackAnim, setLookBackAnim] = useState(null);
  const [shouldReturn, setShouldReturn] = useState(false);
  const [devicePos, setDevicePos] = useState([0, 0, 0]);
  const [celebrate, setCelebrate] = useState(false);
  const [showCoin, setShowCoin] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const lastDistanceRef = useRef(null);
  const notMovingCountRef = useRef(0);

  // Register animations once
  useEffect(() => {
    ViroAnimations.registerAnimations({
      barkleyJump: {
        properties: { positionY: "+=0.3" },
        duration: 300,
      },
      barkleyJumpDown: {
        properties: { positionY: "-=0.3" },
        duration: 300,
      },
      barkleyJumpLoop: [
        ["barkleyJump", "barkleyJumpDown"]
      ],
      lookBack: {
        properties: { rotateY: "+=60" },
        duration: 400,
      },
      lookForward: {
        properties: { rotateY: "-=60" },
        duration: 400,
      },
      barkleyCelebrate: {
        properties: { rotateY: "+=360" },
        duration: 1200,
      },
      coinPop: {
        properties: { scaleX: 1.5, scaleY: 1.5, scaleZ: 1.5, opacity: 0 },
        duration: 1200,
      },
    });
  }, []);

  // Move Barkley to anchor on mount or after return
  useEffect(() => {
    if (!shouldReturn) {
      const animName = `moveToAnchor_${anchorPosition.join('_')}`;
      ViroAnimations.registerAnimations({
        [animName]: {
          properties: {
            positionX: anchorPosition[0],
            positionY: anchorPosition[1],
            positionZ: anchorPosition[2],
          },
          duration: 3000,
          easing: "EaseInEaseOut",
        },
      });
      setMoveAnim(animName);
      setTimeout(() => setIsAtAnchor(true), 3000);
    }
  }, [anchorPosition, shouldReturn]);

  // Barkley jumps and looks back at anchor, monitors device movement
  useEffect(() => {
    let interval;
    if (isAtAnchor && !shouldReturn && !celebrate) {
      setJumpAnim("barkleyJumpLoop");
      interval = setInterval(() => {
        setShowBark(true);
        setLookBackAnim("lookBack");
        setTimeout(() => {
          setLookBackAnim("lookForward");
          setShowBark(false);
        }, 1000);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAtAnchor, shouldReturn, celebrate]);

  // Monitor device movement toward anchor
  useEffect(() => {
    if (isAtAnchor && !shouldReturn && !celebrate) {
      const checkInterval = setInterval(() => {
        const dist = distance(devicePos, anchorPosition);
        // If close enough, Barkley celebrates, coin pops up, and confetti
        if (dist < 0.5) {
          setIsAtAnchor(false);
          setJumpAnim(null);
          setMoveAnim(null);
          setLookBackAnim(null);
          setShowBark(false);
          setCelebrate(true);
          setShowCoin(true);
          setShowConfetti(true);
          AccessibilityInfo.announceForAccessibility('Chore complete! Barkley celebrates!');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (onChoreComplete) onChoreComplete();
          setTimeout(() => setShowCoin(false), 1200);
          setTimeout(() => setCelebrate(false), 1200);
          setTimeout(() => setShowConfetti(false), 1800);
          return;
        }
        if (lastDistanceRef.current !== null) {
          if (dist >= lastDistanceRef.current - 0.05) {
            notMovingCountRef.current += 1;
          } else {
            notMovingCountRef.current = 0;
          }
        }
        lastDistanceRef.current = dist;
        if (notMovingCountRef.current >= 5) {
          setShouldReturn(true);
          setIsAtAnchor(false);
          setMoveAnim(null);
          setJumpAnim(null);
          AccessibilityInfo.announceForAccessibility('Try moving closer to Barkley!');
        }
      }, 1000);
      return () => clearInterval(checkInterval);
    }
  }, [isAtAnchor, shouldReturn, devicePos, anchorPosition, celebrate, onChoreComplete]);

  // If Barkley should return, animate back to child
  useEffect(() => {
    if (shouldReturn) {
      const animName = `returnToChild`;
      ViroAnimations.registerAnimations({
        [animName]: {
          properties: {
            positionX: initialPosition[0],
            positionY: initialPosition[1],
            positionZ: initialPosition[2],
          },
          duration: 2000,
          easing: "EaseInEaseOut",
        },
      });
      setMoveAnim(animName);
      setTimeout(() => {
        setShouldReturn(false);
        setIsAtAnchor(false);
        setMoveAnim(null);
        setJumpAnim(null);
        lastDistanceRef.current = null;
        notMovingCountRef.current = 0;
      }, 2000);
    }
  }, [shouldReturn]);

  // Track device position in AR space
  const handleCameraTransformUpdate = (state, reason, cameraTransform) => {
    setDevicePos(cameraTransform.position);
  };

  return (
    <ViroARScene onCameraTransformUpdate={handleCameraTransformUpdate}>
      <ViroAmbientLight color="#ffffff" />
      <ViroNode position={anchorPosition}>
        {/* Optional: anchor marker */}
      </ViroNode>
      <Viro3DObject
        source={BARKLEY_MODEL}
        position={initialPosition}
        scale={[0.2, 0.2, 0.2]}
        type="VRX"
        animation={{
          name: celebrate
            ? "barkleyCelebrate"
            : moveAnim || jumpAnim || lookBackAnim,
          run: !!(celebrate || moveAnim || jumpAnim || lookBackAnim),
          loop: false,
        }}
        onAnimationFinish={() => {
          if (lookBackAnim === "lookBack") setLookBackAnim("lookForward");
          else if (lookBackAnim === "lookForward") setLookBackAnim(null);
        }}
      />
      {showBark && (
        <ViroSound source={BARK_SOUND} paused={false} loop={false} volume={1.0} />
      )}
      {showCoin && (
        <ViroNode position={[anchorPosition[0], anchorPosition[1] + 0.5, anchorPosition[2]]}>
          <ViroImage
            source={COIN_IMAGE}
            scale={[1, 1, 1]}
            opacity={1}
            animation={{ name: "coinPop", run: true, loop: false }}
          />
        </ViroNode>
      )}
      {showConfetti && (
        <ViroParticleEmitter
          position={[anchorPosition[0], anchorPosition[1] + 1, anchorPosition[2]]}
          duration={1500}
          visible={true}
          run={true}
          fixedToEmitter={true}
          image={{
            source: CONFETTI_IMAGE,
            height: 0.1,
            width: 0.1,
          }}
          spawnBehavior={{
            particleLifetime: [800, 1200],
            emissionRatePerSecond: [30, 40],
            maxParticles: 60,
            spawnVolume: { shape: "box", params: [0.5, 0.1, 0.5], spawnOnSurface: false },
            emissionBurst: [],
          }}
          particleAppearance={{
            opacity: {
              initialRange: [0.8, 1.0],
              factor: "Time",
              interpolation: [{ endValue: 0.0, interval: [0.7, 1.0] }],
            },
          }}
          particlePhysics={{
            velocity: {
              initialRange: [
                [-0.5, 1.5, -0.5],
                [0.5, 2.5, 0.5],
              ],
            },
            acceleration: { initialRange: [[0, -2, 0], [0, -3, 0]] },
          }}
        />
      )}
    </ViroARScene>
  );
}

export default function ARFollowBarkleyScreen({ route }) {
  const anchorPosition = route?.params?.anchorPosition || [0, 0, -2];
  if (!Array.isArray(anchorPosition) || anchorPosition.length !== 3) {
    Alert.alert('AR Error', 'Anchor position is invalid.');
    AccessibilityInfo.announceForAccessibility('Anchor position is invalid.');
    return null;
  }
  return (
    <ViroARSceneNavigator
      autofocus={true}
      initialScene={{
        scene: () => <BarkleyARScene anchorPosition={anchorPosition} />,
      }}
      style={{ flex: 1 }}
    />
  );
}