import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, Button, PanResponder, Dimensions } from 'react-native';
import { ViroARSceneNavigator, Viro3DObject, ViroAmbientLight, ViroARScene, ViroMaterials } from '@viro-community/react-viro';

const tennisBall = require('../../assets/tennisball.glb');
const powerBall = require('../../assets/tennisball.glb'); // Optional: add a special ball image

const { width } = Dimensions.get('window');
const GAME_AREA_WIDTH = width - 40;
const GAME_AREA_HEIGHT = 220;

function getRandomPosition() {
  // Random X within game area, Y is fixed for simplicity
  const x = Math.random() * (GAME_AREA_WIDTH - 60) + 20;
  return { x, y: 80 };
}

// Define materials once (outside your component)
ViroMaterials.createMaterials({
  tennisBall: {
    diffuseColor: '#FFD600', // yellow
  },
  powerBall: {
    diffuseColor: '#FF3333', // red
  },
});

// Barkley AR Scene for Fetch Game
const BarkleyScene = ({ animation, barkleyX, balls }) => (
  <ViroARScene>
    <ViroAmbientLight color="#ffffff" />
    <Viro3DObject
      source={require('../../assets/barkley.glb')}
      resources={[]}
      position={[barkleyX / 50, 0, -2]} // Adjust X for AR space
      scale={[0.2, 0.2, 0.2]}
      rotation={[0, 0, 0]}
      type="GLB"
      animation={{ name: animation, run: true, loop: true }}
    />
    {/* Render all balls as 3D objects */}
    {balls.map(ball => (
      <Viro3DObject
        key={ball.id}
        source={require('../../assets/tennisball.glb')}
        resources={[]}
        position={[ball.x / 50, 0, -2]}
        scale={[0.05, 0.05, 0.05]}
        rotation={[0, 0, 0]}
        type="GLB"
        materials={[ball.isPowerUp ? 'powerBall' : 'tennisBall']}
      />
    ))}
  </ViroARScene>
);

export default function FetchGameScreen({ navigation }) {
  const [balls, setBalls] = useState([]); // {x, y, isPowerUp, id}
  const [barkleyAnim, setBarkleyAnim] = useState('idle1');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30); // 30 seconds
  const [level, setLevel] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [showPerfect, setShowPerfect] = useState(false);

  const barkleyX = useRef(new Animated.Value(0)).current;
  const timerRef = useRef();

  // Skill-based throw: drag to aim
  const throwBall = (gestureX) => {
    if (!gameActive) return;
    const pos = getRandomPosition();
    // Power-up: 1 in 5 chance
    const isPowerUp = Math.random() < 0.2;
    setBalls(balls => [
      ...balls,
      { ...pos, isPowerUp, id: Date.now() + Math.random() }
    ]);
    // Barkley runs to ball
    Animated.timing(barkleyX, {
      toValue: pos.x,
      duration: 700,
      useNativeDriver: false,
    }).start(() => {
      // Fetch accuracy: if Barkley lands close to ball, perfect!
      if (Math.abs(pos.x - barkleyX._value) < 15) {
        setShowPerfect(true);
        setTimeout(() => setShowPerfect(false), 700);
      }
      setBarkleyAnim(isPowerUp ? 'jump' : 'happy');
      setScore(s => s + (isPowerUp ? 3 : 1));
      setTimeout(() => setBarkleyAnim('run'), 400);
      // Barkley returns
      Animated.timing(barkleyX, {
        toValue: 0,
        duration: 700,
        useNativeDriver: false,
      }).start(() => setBarkleyAnim('idle1'));
      // Remove ball after fetch
      setBalls(balls => balls.slice(1));
    });
  };

  // Timed fetch logic
  const startGame = () => {
    setScore(0);
    setLevel(1);
    setGameActive(true);
    setTimer(30);
    setBalls([]);
    barkleyX.setValue(0);
    setBarkleyAnim('idle1');
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setGameActive(false);
          setHighScore(h => Math.max(h, score));
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // Progression: increase level every 10 points
  React.useEffect(() => {
    if (score > 0 && score % 10 === 0) {
      setLevel(l => l + 1);
    }
  }, [score]);

  // Clean up timer
  React.useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // Skill-based throw: pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => gameActive,
      onPanResponderRelease: (e, gesture) => {
        // Use gesture.dx for throw direction/strength if desired
        throwBall(gesture.moveX);
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fetch Game</Text>
      <Text style={styles.score}>Score: {score} | Level: {level} | Time: {timer}s</Text>
      <Text style={styles.score}>High Score: {highScore}</Text>
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {/* Barkley 3D Model in AR */}
        <View style={styles.barkleyAR}>
          <ViroARSceneNavigator
            autofocus={true}
            initialScene={{
              scene: () => <BarkleyScene animation={barkleyAnim} barkleyX={barkleyX._value} balls={balls} />
            }}
            style={{ flex: 1 }}
          />
        </View>
        {balls.map(ball => (
          <Image
            key={ball.id}
            source={ball.isPowerUp ? powerBall : tennisBall}
            style={[
              styles.ball,
              { left: ball.x, top: ball.y, borderColor: ball.isPowerUp ? '#FFD600' : 'transparent', borderWidth: ball.isPowerUp ? 2 : 0 }
            ]}
          />
        ))}
        {showPerfect && (
          <Text style={styles.perfect}>Perfect Fetch!</Text>
        )}
      </View>
      {!gameActive ? (
        <Button title="Start Game" onPress={startGame} />
      ) : (
        <Text style={styles.instruction}>Swipe or tap to throw a ball!</Text>
      )}
      <Button title="Back to Home" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6F7FF' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#0288d1' },
  score: { fontSize: 16, marginBottom: 4 },
  gameArea: { width: GAME_AREA_WIDTH, height: GAME_AREA_HEIGHT, backgroundColor: '#fff', borderRadius: 12, marginVertical: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#B3E5FC', position: 'relative' },
  barkleyAR: { position: 'absolute', bottom: 10, left: 0, right: 0, height: 100, zIndex: 2 },
  ball: { position: 'absolute', width: 36, height: 36, borderRadius: 18 },
  perfect: { position: 'absolute', top: 10, left: 10, color: '#FFD600', fontWeight: 'bold', fontSize: 18 },
  instruction: { marginVertical: 8, color: '#0288d1' },
});