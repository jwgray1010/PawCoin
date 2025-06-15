import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, AccessibilityInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ViroARSceneNavigator, Viro3DObject, ViroAmbientLight, ViroARScene } from '@viro-community/react-viro';
import { Audio } from 'expo-av';
import ConfettiCannon from 'react-native-confetti-cannon';
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

const sampleChores = [
  { id: '1', chore: 'Feed the Dog', points: 5, assignee: 'Barkley Fan', completed: false },
  { id: '2', chore: 'Clean Room', points: 3, assignee: 'Barkley Fan', completed: true },
  { id: '3', chore: 'Take Out Trash', points: 2, assignee: 'Barkley Fan', completed: false },
];

// 3D Barkley Scene
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

export default function KidChoresScreen() {
  const navigation = useNavigation();
  const [funFact, setFunFact] = useState('');
  const [barkleyScale, setBarkleyScale] = useState([0.2, 0.2, 0.2]);
  const [barkleyRotation, setBarkleyRotation] = useState([0, 0, 0]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedChore, setSelectedChore] = useState(null);
  const animating = useRef(false);

  useEffect(() => {
    const fact = funFacts[Math.floor(Math.random() * funFacts.length)];
    setFunFact(fact);
    AccessibilityInfo.announceForAccessibility(`Fun Fact: ${fact}`);
  }, []);

  // Play bark sound
  const playBarkSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/bark.mp3')
      );
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 1000);
    } catch (e) {}
  };

  // Barkley tap: random pose + bark
  const handleBarkleyTap = () => {
    if (animating.current) return;
    animating.current = true;
    playBarkSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  // Barkley long press: fun fact
  const handleBarkleyLongPress = () => {
    const fact = funFacts[Math.floor(Math.random() * funFacts.length)];
    setFunFact(fact);
    AccessibilityInfo.announceForAccessibility(`Fun Fact: ${fact}`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Barkley says:", fact);
  };

  // Chore tap: confetti and navigate
  const handleChorePress = (chore) => {
    setSelectedChore(chore.id);
    setShowConfetti(true);
    AccessibilityInfo.announceForAccessibility(`Chore selected: ${chore.chore}`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setShowConfetti(false), 1200);
    setTimeout(() => {
      setSelectedChore(null);
      navigation.navigate('AcceptChore', { choreData: chore });
    }, 800);
  };

  // Progress bar
  const completedCount = sampleChores.filter(c => c.completed).length;
  const progress = (completedCount / sampleChores.length) * 100;

  // Motivational message
  const allDone = completedCount === sampleChores.length;

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      `Chores completed: ${completedCount} of ${sampleChores.length}`
    );
    if (allDone) {
      AccessibilityInfo.announceForAccessibility('Great job! All chores done!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [completedCount, allDone]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.barkley3dContainer}>
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
            style={styles.barkley3d}
          />
        </View>
        <Text style={styles.title}>Your Chores</Text>
      </View>
      <Text style={styles.funFact}>🐾 Fun Fact: {funFact}</Text>
      <View style={styles.progressBarContainer}>
        <Text style={styles.progressText}>
          Chores Completed: {completedCount}/{sampleChores.length}
        </Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>
      {allDone && (
        <Text style={styles.motivation}>🎉 Great job! All chores done! 🎉</Text>
      )}
      <FlatList
        data={sampleChores}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.choreItem,
              selectedChore === item.id && styles.choreItemSelected,
              item.completed && styles.choreItemCompleted,
            ]}
            onPress={() => handleChorePress(item)}
            disabled={item.completed}
            accessibilityRole="button"
            accessibilityLabel={
              item.completed
                ? `${item.chore} completed`
                : `Select ${item.chore}, worth ${item.points} points`
            }
          >
            <View>
              <Text style={styles.choreText}>{item.chore}</Text>
              <Text style={styles.assignee}>Assigned to: {item.assignee}</Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.points}>{item.points} pts</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      {showConfetti && (
        <ConfettiCannon count={40} origin={{ x: 200, y: 0 }} fadeOut />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbe9', padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center',
  },
  barkley3dContainer: {
    width: 70,
    height: 70,
    marginRight: 12,
    borderRadius: 35,
    backgroundColor: '#e1f5fe',
    overflow: 'hidden',
  },
  barkley3d: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0288d1',
    fontFamily: 'Baloo2_700Bold',
  },
  funFact: {
    color: '#0288d1',
    fontStyle: 'italic',
    marginBottom: 18,
    fontSize: 15,
    textAlign: 'center',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressText: {
    color: '#0288d1',
    fontSize: 14,
    marginBottom: 2,
    textAlign: 'center',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#bdbdbd',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#43a047',
    borderRadius: 4,
  },
  motivation: {
    color: '#43a047',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  choreItem: {
    backgroundColor: '#e1f5fe',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#0288d1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  choreItemSelected: {
    borderWidth: 2,
    borderColor: '#0288d1',
  },
  choreItemCompleted: {
    opacity: 0.5,
  },
  choreText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
  assignee: { fontSize: 13, color: '#0288d1', marginTop: 2 },
  pointsBadge: {
    backgroundColor: '#43a047',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  points: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
});