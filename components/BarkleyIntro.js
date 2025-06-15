import React, { useEffect, useRef, useState } from 'react';
import {
  ViroARScene, ViroNode, Viro3DObject, ViroText, ViroQuad, ViroAmbientLight,
  ViroSound, ViroImage, ViroParticleEmitter
} from 'react-viro';
import { View, TouchableOpacity, Image, StyleSheet, Dimensions, AccessibilityInfo, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const LOGO = require('../../assets/logo.png');
const BARKLEY_MODEL = require('../../assets/barkley.glb');
const SWEAT_IMG = require('../../assets/sweat_drop.png');
const DUST_PARTICLE = require('../../assets/dust_particle.png');
const CONFETTI_PARTICLE = require('../../assets/confetti_particle.png');
const SPARKLE_PARTICLE = require('../../assets/sparkle_particle.png');
const SPEED_SOUND = require('../../assets/speed.mp3');
const HEEL_SOUND = require('../../assets/heel_stop.mp3');
const PANTING_SOUND = require('../../assets/panting.mp3');

const DEFAULT_BUBBLES = [
  "Hi there!",
  "Welcome to PawCoin!",
  "Let's set up!",
  "Ready to play?",
  "Barkley is here to help!"
];

export default function BarkleyIntro({
  onFinish,
  bubbleTexts = DEFAULT_BUBBLES,
  onStepChange
}) {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get('window');
  const scaleFactor = Math.min(width / 375, height / 667);

  // Animation state
  const [barkleyX, setBarkleyX] = useState(-1.5);
  const [animStage, setAnimStage] = useState('wait'); // 'wait', 'runIn', 'stop', 'tired', 'bubble', 'done'
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleText, setBubbleText] = useState(
    Array.isArray(bubbleTexts) ? bubbleTexts[Math.floor(Math.random() * bubbleTexts.length)] : bubbleTexts
  );
  const [showSweat, setShowSweat] = useState(false);
  const [showDust, setShowDust] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const [barkleyAnim, setBarkleyAnim] = useState('idle');
  const [playSpeedSound, setPlaySpeedSound] = useState(false);
  const [playHeelSound, setPlayHeelSound] = useState(false);
  const [playPantingSound, setPlayPantingSound] = useState(false);

  // Timers for cleanup
  const timers = useRef([]);

  // Accessibility: Announce bubble text
  useEffect(() => {
    if (bubbleVisible && bubbleText) {
      AccessibilityInfo.announceForAccessibility(bubbleText);
    }
  }, [bubbleVisible, bubbleText]);

  // Onboarding step callback
  useEffect(() => {
    if (onStepChange) onStepChange(animStage);
  }, [animStage, onStepChange]);

  // Animation sequence
  useEffect(() => {
    // Wait before Barkley runs in
    if (animStage === 'wait') {
      timers.current.push(setTimeout(() => {
        setAnimStage('runIn');
        setPlaySpeedSound(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 1500));
    }
    // Barkley runs in from left
    if (animStage === 'runIn') {
      setBarkleyAnim('run');
      let start = Date.now();
      const duration = 1200;
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        setBarkleyX(-1.5 + 1.5 * progress);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setAnimStage('stop');
          setPlaySpeedSound(false);
          setPlayHeelSound(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      };
      animate();
    }
    // Barkley stops with heel sound
    if (animStage === 'stop') {
      setBarkleyAnim('stop');
      timers.current.push(setTimeout(() => {
        setAnimStage('tired');
        setPlayHeelSound(false);
        setPlayPantingSound(true);
      }, 500));
    }
    // Barkley tired, sweat, panting
    if (animStage === 'tired') {
      setBarkleyAnim('tired');
      setShowSweat(true);
      timers.current.push(setTimeout(() => {
        setAnimStage('bubble');
        setBubbleVisible(true);
        setPlayPantingSound(false);
      }, 1200));
    }
    // Barkley shows bubble, confetti, sparkle
    if (animStage === 'bubble') {
      setShowConfetti(true);
      setShowSparkle(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      timers.current.push(setTimeout(() => setShowConfetti(false), 1500));
      timers.current.push(setTimeout(() => setShowSparkle(false), 1500));
    }
    // Barkley exits
    if (animStage === 'done') {
      setBubbleVisible(false);
      setShowSweat(false);
      setShowDust(true);
      setBarkleyAnim('run');
      let start = Date.now();
      const duration = 700;
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        setBarkleyX(0 + 1.5 * progress);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setShowDust(false);
          if (onFinish) timers.current.push(setTimeout(onFinish, 400));
        }
      };
      animate();
    }
    // Cleanup timers on unmount or stage change
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [animStage, onFinish]);

  // Bubble tap to continue
  const handleNext = () => setAnimStage('done');

  // Skip intro
  const handleSkip = () => setAnimStage('done');

  // Sweat drop animation (simple up/down)
  const [sweatY, setSweatY] = useState(0);
  useEffect(() => {
    let running = true;
    if (showSweat) {
      let dir = 1;
      let y = 0;
      const animate = () => {
        if (!running) return;
        y += dir * 0.003;
        if (y > 0.03) dir = -1;
        if (y < 0) dir = 1;
        setSweatY(y);
        requestAnimationFrame(animate);
      };
      animate();
    } else {
      setSweatY(0);
    }
    return () => { running = false; };
  }, [showSweat]);

  return (
    <View style={{ flex: 1 }}>
      {/* Home button with logo */}
      <TouchableOpacity
        style={styles.logoBtn}
        onPress={() => navigation.navigate('Dashboard')}
        accessibilityRole="button"
        accessibilityLabel="Go to Home"
      >
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </TouchableOpacity>
      {/* Skip Intro Button */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={handleSkip}
        accessibilityRole="button"
        accessibilityLabel="Skip Intro"
      >
        <Text style={styles.skipText}>Skip Intro</Text>
      </TouchableOpacity>
      <ViroARScene>
        <ViroAmbientLight color="#ffffff" />
        <ViroNode position={[barkleyX, -0.2 * scaleFactor, -1]}>
          <Viro3DObject
            source={BARKLEY_MODEL}
            scale={[0.15 * scaleFactor, 0.15 * scaleFactor, 0.15 * scaleFactor]}
            type="GLB"
            animation={{ name: barkleyAnim, run: true, loop: barkleyAnim === 'run' }}
          />
          {/* Sweat drop */}
          {showSweat && (
            <ViroImage
              source={SWEAT_IMG}
              position={[0.08 * scaleFactor, (0.18 + sweatY) * scaleFactor, 0.07 * scaleFactor]}
              scale={[0.03 * scaleFactor, 0.05 * scaleFactor, 0.01 * scaleFactor]}
              opacity={0.8}
            />
          )}
          {/* Dust particle emitter when leaving */}
          {showDust && (
            <ViroParticleEmitter
              position={[0.09 * scaleFactor, -0.09 * scaleFactor, 0]}
              duration={700}
              visible={true}
              run={true}
              loop={false}
              fixedToEmitter={true}
              image={{
                source: DUST_PARTICLE,
                height: 0.06 * scaleFactor,
                width: 0.06 * scaleFactor,
                bloomThreshold: 0.0
              }}
              spawnBehavior={{
                particleLifetime: [400, 700],
                emissionRatePerSecond: [20, 30],
                maxParticles: 30,
                spawnVolume: { shape: "box", params: [0.12 * scaleFactor, 0.03 * scaleFactor, 0.01], spawnOnSurface: true }
              }}
              particleAppearance={{
                opacity: {
                  initialRange: [0.7, 0.9],
                  factor: "Time",
                  interpolation: [
                    { endValue: 0.7, interval: [0, 0.2] },
                    { endValue: 0.0, interval: [0.8, 1] }
                  ]
                }
              }}
              particlePhysics={{
                velocity: {
                  initialRange: [
                    [-0.04 * scaleFactor, 0.03 * scaleFactor, 0],
                    [0.04 * scaleFactor, 0.08 * scaleFactor, 0]
                  ]
                },
                acceleration: {
                  initialRange: [[0, 0.01 * scaleFactor, 0], [0, 0.02 * scaleFactor, 0]]
                }
              }}
            />
          )}
          {/* Confetti particle emitter */}
          {showConfetti && (
            <ViroParticleEmitter
              position={[0, 0.55 * scaleFactor, 0]}
              duration={1200}
              visible={true}
              run={true}
              loop={false}
              fixedToEmitter={true}
              image={{
                source: CONFETTI_PARTICLE,
                height: 0.05 * scaleFactor,
                width: 0.05 * scaleFactor,
                bloomThreshold: 0.0
              }}
              spawnBehavior={{
                particleLifetime: [900, 1400],
                emissionRatePerSecond: [30, 40],
                maxParticles: 40,
                spawnVolume: { shape: "box", params: [0.6 * scaleFactor, 0.02 * scaleFactor, 0.01], spawnOnSurface: true }
              }}
              particleAppearance={{
                opacity: {
                  initialRange: [0.8, 1.0],
                  factor: "Time",
                  interpolation: [
                    { endValue: 1.0, interval: [0, 0.2] },
                    { endValue: 0.0, interval: [0.8, 1] }
                  ]
                }
              }}
              particlePhysics={{
                velocity: {
                  initialRange: [
                    [-0.1 * scaleFactor, -0.1 * scaleFactor, 0],
                    [0.1 * scaleFactor, -0.25 * scaleFactor, 0]
                  ]
                },
                acceleration: {
                  initialRange: [[0, -0.2 * scaleFactor, 0], [0, -0.3 * scaleFactor, 0]]
                }
              }}
            />
          )}
          {/* Sparkle particle emitter */}
          {showSparkle && (
            <ViroParticleEmitter
              position={[0, 0.45 * scaleFactor, 0]}
              duration={1200}
              visible={true}
              run={true}
              loop={false}
              fixedToEmitter={true}
              image={{
                source: SPARKLE_PARTICLE,
                height: 0.04 * scaleFactor,
                width: 0.04 * scaleFactor,
                bloomThreshold: 0.0
              }}
              spawnBehavior={{
                particleLifetime: [700, 1200],
                emissionRatePerSecond: [18, 25],
                maxParticles: 25,
                spawnVolume: { shape: "box", params: [0.4 * scaleFactor, 0.05 * scaleFactor, 0.01], spawnOnSurface: true }
              }}
              particleAppearance={{
                opacity: {
                  initialRange: [0.8, 1.0],
                  factor: "Time",
                  interpolation: [
                    { endValue: 1.0, interval: [0, 0.2] },
                    { endValue: 0.0, interval: [0.8, 1] }
                  ]
                }
              }}
              particlePhysics={{
                velocity: {
                  initialRange: [
                    [-0.03 * scaleFactor, 0.05 * scaleFactor, 0],
                    [0.03 * scaleFactor, 0.15 * scaleFactor, 0]
                  ]
                },
                acceleration: {
                  initialRange: [[0, 0.01 * scaleFactor, 0], [0, 0.02 * scaleFactor, 0]]
                }
              }}
            />
          )}
          {/* Speech bubble */}
          {bubbleVisible && (
            <ViroNode position={[0, 0.32 * scaleFactor, 0]}>
              <ViroQuad
                position={[0, 0, -0.01]}
                width={0.7 * scaleFactor}
                height={0.22 * scaleFactor}
                cornerRadius={0.11 * scaleFactor}
                color="#fffbe9"
                opacity={0.92}
              />
              <ViroText
                text={bubbleText}
                width={1.2 * scaleFactor}
                height={0.3 * scaleFactor}
                position={[0, 0, 0]}
                scale={[0.35 * scaleFactor, 0.35 * scaleFactor, 0.35 * scaleFactor]}
                style={{
                  fontFamily: 'AvenirNext-Bold',
                  fontSize: 32 * scaleFactor,
                  color: '#795548',
                  textAlign: 'center',
                  backgroundColor: 'transparent',
                  fontWeight: 'bold',
                  shadowColor: '#ffe0b2',
                  shadowOpacity: 0.5,
                  shadowRadius: 2,
                }}
                extrusionDepth={0.01}
              />
              <ViroQuad
                position={[0, -0.14 * scaleFactor, 0]}
                rotation={[-90, 0, 0]}
                width={0.08 * scaleFactor}
                height={0.08 * scaleFactor}
                color="#fffbe9"
                opacity={0.92}
              />
              <ViroText
                text="Let's set up!"
                width={1.2 * scaleFactor}
                height={0.3 * scaleFactor}
                position={[0, -0.22 * scaleFactor, 0]}
                scale={[0.22 * scaleFactor, 0.22 * scaleFactor, 0.22 * scaleFactor]}
                style={{
                  fontFamily: 'AvenirNext-Bold',
                  fontSize: 28 * scaleFactor,
                  color: '#0288d1',
                  textAlign: 'center',
                  backgroundColor: 'transparent',
                  fontWeight: 'bold',
                }}
                onClick={handleNext}
                accessibilityRole="button"
                accessibilityLabel="Continue"
              />
            </ViroNode>
          )}
          {/* Sounds */}
          {playSpeedSound && (
            <ViroSound source={SPEED_SOUND} paused={false} muted={false} loop={false} volume={1.0} />
          )}
          {playHeelSound && (
            <ViroSound source={HEEL_SOUND} paused={false} muted={false} loop={false} volume={1.0} />
          )}
          {playPantingSound && (
            <ViroSound source={PANTING_SOUND} paused={false} muted={false} loop={false} volume={1.0} />
          )}
        </ViroNode>
      </ViroARScene>
    </View>
  );
}

const styles = StyleSheet.create({
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
  skipBtn: {
    position: 'absolute',
    top: 24,
    left: 24,
    zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#0288d1',
    fontWeight: 'bold',
    fontSize: 16,
  },
});