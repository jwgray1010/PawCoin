import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, Image, Modal, Pressable, Alert, Animated, PanResponder, AccessibilityInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { Audio } from 'expo-av';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';

const LOGO = require('../../assets/logo.png');
const barkleyImg = require('../../assets/barkley.glb'); // Replace with your Barkley asset
const boneImg = require('../../assets/bone.png'); // Add your bone image
const waterImg = require('../../assets/water.png');
const emotionIcon = require('../../assets/emotion.png');
const foodIcon = require('../../assets/bone.png');
const waterIcon = require('../../assets/water.png');

export default function KidHomeScreen({ route }) {
  const navigation = useNavigation();
  const boneAnim = useRef(new Animated.Value(0)).current;
  const bonePosition = useRef(new Animated.ValueXY({ x: 60, y: 400 })).current; // Start position
  const waterPosition = useRef(new Animated.ValueXY({ x: 120, y: 400 })).current;

  // Example kid and chores (replace with Firestore data)
  const [kid, setKid] = useState(route?.params?.kid || { name: 'Barkley Fan', coins: 12 });
  const [chores, setChores] = useState(route?.params?.chores || [
    { id: '1', name: 'Feed the Dog', completed: false },
    { id: '2', name: 'Clean Room', completed: true },
    { id: '3', name: 'Take Out Trash', completed: false },
  ]);
  const [accessories, setAccessories] = useState([]); // e.g., ['hat', 'collar']
  const [happiness, setHappiness] = useState(100);
  const [shopVisible, setShopVisible] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const [isSleeping, setIsSleeping] = useState(true);
  const [showBone, setShowBone] = useState(false);
  const [showWater, setShowWater] = useState(false);
  const [barkleyAnim, setBarkleyAnim] = useState('idle1');
  const [food, setFood] = useState(100);   // 0-100
  const [water, setWater] = useState(100); // 0-100
  const [funFact, setFunFact] = useState('Did you know? Barkley loves to chase his tail!');

  // Accessibility: Announce mood and progress
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`Welcome, ${kid.name}. You have ${kid.coins} coins.`);
  }, [kid.name, kid.coins]);
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`Barkley's happiness is ${happiness} percent.`);
  }, [happiness]);
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`Food: ${food} percent. Water: ${water} percent.`);
  }, [food, water]);
  useEffect(() => {
    const completedCount = chores.filter(c => c.completed).length;
    AccessibilityInfo.announceForAccessibility(`Chores completed: ${completedCount} of ${chores.length}`);
  }, [chores]);

  // PanResponder for feeding Barkley
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: bonePosition.x, dy: bonePosition.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        if (
          gesture.moveY < 220 &&
          gesture.moveX > 60 && gesture.moveX < 200
        ) {
          handleFeed();
          setBarkleyAnim('happy');
          playSound(require('../../assets/bark.mp3'));
          setTimeout(() => setBarkleyAnim('idle1'), 2000);
          setShowBone(false);
          bonePosition.setValue({ x: 60, y: 400 });
        } else {
          Animated.spring(bonePosition, {
            toValue: { x: 60, y: 400 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // PanResponder for watering Barkley
  const waterPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: waterPosition.x, dy: waterPosition.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        if (
          gesture.moveY < 220 &&
          gesture.moveX > 60 && gesture.moveX < 200
        ) {
          handleGiveWater();
          setBarkleyAnim('happy');
          setTimeout(() => setBarkleyAnim('idle1'), 2000);
          setShowWater(false);
          waterPosition.setValue({ x: 120, y: 400 });
        } else {
          Animated.spring(waterPosition, {
            toValue: { x: 120, y: 400 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Decrease happiness every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setHappiness(h => Math.max(0, h - 1));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Decrease food and water every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setFood(f => Math.max(0, f - 2));
      setWater(w => Math.max(0, w - 2));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Time-of-day effect for Barkley animation
  useEffect(() => {
    const updateBarkleyForTime = () => {
      const hour = new Date().getHours();
      if (hour >= 21 || hour < 7) {
        setIsSleeping(true);
        setBarkleyAnim('rest');
      } else {
        setIsSleeping(false);
        setBarkleyAnim('idle1');
      }
    };

    updateBarkleyForTime();
    const interval = setInterval(updateBarkleyForTime, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Feed Barkley (costs 1 coin)
  const handleFeed = () => {
    if (kid.coins < 1) {
      AccessibilityInfo.announceForAccessibility("You don't have enough Pawcoin to feed Barkley!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert("You don't have enough Pawcoin to feed Barkley!");
      return;
    }
    setKid({ ...kid, coins: kid.coins - 1 });
    setHappiness(h => {
      const newH = Math.min(100, h + 10);
      if (newH > 70) triggerDance();
      return newH;
    });
    setFood(f => Math.min(100, f + 20));
    AccessibilityInfo.announceForAccessibility('You fed Barkley!');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    alert('You fed Barkley! 🦴');
    setShowBone(true);
    boneAnim.setValue(0);
    Animated.timing(boneAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start(() => setShowBone(false));
  };

  // Give water to Barkley (costs 1 coin)
  const handleGiveWater = () => {
    setHappiness(h => Math.min(100, h + 8));
    setWater(w => Math.min(100, w + 20));
    AccessibilityInfo.announceForAccessibility('You gave Barkley water!');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    alert('You gave Barkley water! 💧');
  };

  // Add accessory (costs 3 coins)
  const handleAddAccessory = (type) => {
    if (kid.coins < 3) {
      AccessibilityInfo.announceForAccessibility("You don't have enough Pawcoin for this accessory!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert("You don't have enough Pawcoin for this accessory!");
      return;
    }
    setKid({ ...kid, coins: kid.coins - 3 });
    setAccessories([...accessories, type]);
    setHappiness(h => {
      const newH = Math.min(100, h + 5);
      if (newH > 70) triggerDance();
      return newH;
    });
    setBarkleyAnim('happy');
    setTimeout(() => setBarkleyAnim('idle1'), 2000);
    AccessibilityInfo.announceForAccessibility(`You added a ${type} to Barkley!`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    alert(`You added a ${type} to Barkley!`);
  };

  const handleChorePress = (chore) => {
    navigation.navigate('CompleteChoreScreen', {
      anchor: chore,
      onComplete: () => {
        const attackAnim = Math.random() > 0.5 ? 'attack1' : 'attack2';
        setBarkleyAnim(attackAnim);
        setTimeout(() => setBarkleyAnim('idle1'), 2000);
        AccessibilityInfo.announceForAccessibility('Chore complete! Great job!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    });
  };

  const getHappinessText = () => {
    if (happiness > 70) return "Barkley is super happy!";
    if (happiness > 40) return "Barkley is okay, but could use some attention.";
    return "Barkley feels sad. Feed or play with him!";
  };

  const triggerDance = () => {
    setIsDancing(true);
    setTimeout(() => setIsDancing(false), 3000);
    AccessibilityInfo.announceForAccessibility('Barkley is dancing!');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  useEffect(() => {
    if (!isSleeping && !isDancing && !showBone) {
      const idleAnimations = ['idle1', 'idle2', 'waving', 'happy'];
      const interval = setInterval(() => {
        setIsDancing(false);
        setIsSleeping(false);
        setBarkleyAnim(idleAnimations[Math.floor(Math.random() * idleAnimations.length)]);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isSleeping, isDancing, showBone]);

  useEffect(() => {
    if (happiness <= 40 && !isSleeping && !isDancing) {
      setBarkleyAnim('no');
    }
  }, [happiness, isSleeping, isDancing]);

  useEffect(() => {
    if (food < 30 || water < 30) {
      setBarkleyAnim('no');
    }
  }, [food, water]);

  const handleWakeUp = () => {
    setIsSleeping(false);
    setBarkleyAnim('wakesup1');
    setTimeout(() => setBarkleyAnim('idle1'), 2000);
    AccessibilityInfo.announceForAccessibility('Barkley woke up!');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const celebrate = () => {
    setBarkleyAnim('run2');
    setTimeout(() => setBarkleyAnim('idle1'), 2000);
    AccessibilityInfo.announceForAccessibility('Barkley is celebrating!');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const playSound = async (soundFile) => {
    try {
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 1000);
    } catch (e) {}
  };

  // Animation sets by mood
  const happyAnimations = ['yes', 'jump', 'waving', 'dmg1', 'happy', 'dmg2'];
  const sadAnimations = ['no', 'falls1', 'falls2', 'falls3'];
  const contentAnimations = ['idle1', 'idle2', 'rest'];

  // Helper to get a random animation from a set
  const getRandomAnim = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Mood-based animation effect: update immediately on happiness/mood change
  useEffect(() => {
    if (isSleeping) return;
    let animSet;
    if (happiness > 70) {
      animSet = happyAnimations;
    } else if (happiness > 40) {
      animSet = contentAnimations;
    } else {
      animSet = sadAnimations;
    }
    setBarkleyAnim(getRandomAnim(animSet));
  }, [happiness, isSleeping]);

  // Lifelike: randomize animation every 10 seconds based on mood
  useEffect(() => {
    if (isSleeping) return;
    const interval = setInterval(() => {
      let animSet;
      if (happiness > 70) {
        animSet = happyAnimations;
      } else if (happiness > 40) {
        animSet = contentAnimations;
      } else {
        animSet = sadAnimations;
      }
      setBarkleyAnim(getRandomAnim(animSet));
    }, 10000);
    return () => clearInterval(interval);
  }, [happiness, isSleeping]);

  const getMoodEmoji = () => {
    if (happiness > 70) return '😄';
    if (happiness > 40) return '😐';
    return '😢';
  };

  const completedCount = chores.filter(c => c.completed).length;
  const progress = (completedCount / chores.length) * 100;

  return (
    <View style={styles.container}>
      {/* Home button with logo */}
      <TouchableOpacity
        style={styles.logoBtn}
        onPress={() => navigation.navigate('KidHome')}
        accessibilityRole="button"
        accessibilityLabel="Go to Home"
      >
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </TouchableOpacity>
      <Text style={styles.title}>Welcome, {kid.name}!</Text>
      <Text style={styles.coins}>You have {kid.coins} 🪙</Text>
      <View style={styles.barkleyBox}>
        <TouchableOpacity
          onPress={() => {
            setIsSleeping(false);
            setBarkleyAnim('waving');
            setTimeout(() => setBarkleyAnim('idle1'), 1500);
            AccessibilityInfo.announceForAccessibility('Barkley is waving!');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Light);
          }}
          activeOpacity={0.8}
        >
          {/* Replace <Barkley3D ... /> with a fallback, e.g. emoji or image */}
          <Image
            source={barkleyImg}
            style={styles.barkleyImg}
            accessibilityLabel="Barkley"
          />
          {/* Accessories ... */}
          {showBone && (
            <Animated.View
              style={[
                styles.bone,
                {
                  transform: [
                    { translateX: bonePosition.x },
                    { translateY: bonePosition.y },
                  ],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <Image source={boneImg} style={{ width: 40, height: 40 }} />
            </Animated.View>
          )}
          {showWater && (
            <Animated.View
              style={[
                styles.water,
                {
                  transform: [
                    { translateX: waterPosition.x },
                    { translateY: waterPosition.y },
                  ],
                },
              ]}
              {...waterPanResponder.panHandlers}
            >
              <Image source={waterImg} style={{ width: 40, height: 40 }} />
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.barkleyActions}>
        <Button title="Feed Barkley (1 🪙)" onPress={() => setShowBone(true)} />
        <Button title="Give Barkley Water" onPress={() => setShowWater(true)} />
        <Button title="Accessory Shop" onPress={() => setShopVisible(true)} />
      </View>
      <Modal visible={shopVisible} transparent animationType="slide">
        <View style={styles.shopModal}>
          <Text style={styles.shopTitle}>Accessory Shop</Text>
          <Pressable style={styles.shopItem} onPress={() => { handleAddAccessory('hat'); setShopVisible(false); }}>
            <Text>🎩 Hat (3 🪙)</Text>
          </Pressable>
          <Pressable style={styles.shopItem} onPress={() => { handleAddAccessory('collar'); setShopVisible(false); }}>
            <Text>🦴 Collar (3 🪙)</Text>
          </Pressable>
          <Button title="Close" onPress={() => setShopVisible(false)} />
        </View>
      </Modal>
      <Text style={styles.sectionTitle}>Your Chores</Text>
      <FlatList
        data={chores}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.choreItem,
              item.completed && styles.choreItemCompleted,
            ]}
            onPress={() => handleChorePress(item)}
            disabled={item.completed}
            accessibilityRole="button"
            accessibilityLabel={
              item.completed
                ? `${item.name} completed`
                : `Select ${item.name}`
            }
          >
            <Text style={styles.choreText}>{item.name}</Text>
            {item.completed && <Text style={styles.completedText}>✓ Done</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No chores assigned!</Text>}
      />
      <View style={{ marginVertical: 8 }}>
        <Text style={{ color: '#0288d1' }}>
          Chores Completed: {completedCount}/{chores.length}
        </Text>
        <View style={{ height: 8, backgroundColor: '#bdbdbd', borderRadius: 4, overflow: 'hidden', marginTop: 2 }}>
          <View style={{ width: `${progress}%`, height: 8, backgroundColor: '#43a047' }} />
        </View>
      </View>
      <Button
        title="Follow Barkley to Next Chore"
        onPress={() => navigation.navigate('FollowBarkleyScreen')}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 16 }}>
        <Button title="Play Fetch" onPress={() => navigation.navigate('FetchGameScreen')} />
        <Button title="Memory Game" onPress={() => navigation.navigate('MemoryGameScreen')} />
        <Button title="Clean Up Game" onPress={() => navigation.navigate('CleanUpGameScreen')} />
        <Button title="Quick Tap Game" onPress={() => navigation.navigate('QuickTapGameScreen')} />
      </View>
      <Pressable onPress={() => {
        Alert.alert("Barkley's Mood", getHappinessText());
        AccessibilityInfo.announceForAccessibility(getHappinessText());
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Light);
      }}>
        <View style={styles.happinessBarContainer}>
          <Text style={styles.happinessLabel}>Barkley's Happiness</Text>
          <View style={styles.happinessBarBg}>
            <View style={[styles.happinessBarFill, { width: `${happiness}%` }]} />
          </View>
          <Text style={styles.happinessValue}>{happiness}%</Text>
          <Text style={{ fontSize: 16, marginTop: 4, color: '#0288d1', textDecorationLine: 'underline' }}>
            Tap for Barkley's Mood
          </Text>
        </View>
      </Pressable>
      {showBone && (
        <Animated.Image
          source={boneImg}
          style={{
            position: 'absolute',
            width: 100,
            height: 100,
            top: '50%',
            left: '50%',
            marginLeft: -50,
            marginTop: -50,
            opacity: boneAnim,
          }}
        />
      )}
      {barkleyAnim === 'happy' && (
        <ConfettiCannon count={50} origin={{x: 160, y: 0}} fadeOut />
      )}
      <View style={styles.meterBar}>
        {/* Emotion Meter */}
        <View style={styles.meterItem}>
          <Image source={emotionIcon} style={styles.meterIcon} />
          <View style={styles.meterBg}>
            <View
              style={[
                styles.meterFill,
                {
                  width: `${happiness}%`,
                  backgroundColor: happiness > 40 ? '#4CAF50' : '#D32F2F',
                },
              ]}
            />
          </View>
          <Text style={styles.meterValue}>{happiness}%</Text>
        </View>
        {/* Water Meter */}
        <View style={styles.meterItem}>
          <Image source={waterIcon} style={styles.meterIcon} />
          <View style={styles.meterBg}>
            <View
              style={[
                styles.meterFill,
                {
                  width: `${water}%`,
                  backgroundColor: water > 30 ? '#4FC3F7' : '#D32F2F',
                },
              ]}
            />
          </View>
          <Text style={styles.meterValue}>{water}%</Text>
        </View>
        {/* Food Meter */}
        <View style={styles.meterItem}>
          <Image source={foodIcon} style={styles.meterIcon} />
          <View style={styles.meterBg}>
            <View
              style={[
                styles.meterFill,
                {
                  width: `${food}%`,
                  backgroundColor: food > 30 ? '#8BC34A' : '#D32F2F',
                },
              ]}
            />
          </View>
          <Text style={styles.meterValue}>{food}%</Text>
        </View>
      </View>
      <Button title="See Barkley in AR" onPress={() => navigation.navigate('BarkleyARScreen')} />
      <Text style={{ color: '#0288d1', fontStyle: 'italic', marginBottom: 8 }}>
        Fun Fact: {funFact}
      </Text>
      <Text style={{ fontSize: 32, textAlign: 'center' }}>{getMoodEmoji()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F7FF', padding: 24 },
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
  title: { fontSize: 26, fontWeight: 'bold', color: '#0288d1', marginBottom: 8 },
  coins: { fontSize: 18, color: '#FFD600', fontWeight: 'bold', marginBottom: 16 },
  barkleyBox: { alignItems: 'center', marginBottom: 16 },
  barkleyImg: { width: 140, height: 140, resizeMode: 'contain' },
  accessoryHat: {
    position: 'absolute',
    top: 10,
    left: 40,
    width: 60,
    height: 40,
    resizeMode: 'contain',
  },
  accessoryCollar: {
    position: 'absolute',
    bottom: 20,
    left: 55,
    width: 40,
    height: 20,
    resizeMode: 'contain',
  },
  barkleyActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  sectionTitle: { fontSize: 20, color: '#0288d1', marginBottom: 12, fontWeight: 'bold' },
  choreItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  choreItemCompleted: {
    backgroundColor: '#b2dfdb',
  },
  choreText: { fontSize: 16, color: '#0288d1', fontWeight: 'bold' },
  completedText: { color: 'green', fontWeight: 'bold', marginLeft: 10 },
  empty: { color: '#0288d1', textAlign: 'center', marginTop: 40 },
  happinessBarContainer: { alignItems: 'center', marginBottom: 12 },
  happinessLabel: { fontSize: 14, color: '#0288d1', marginBottom: 2 },
  happinessBarBg: { width: 120, height: 12, backgroundColor: '#bdbdbd', borderRadius: 6, overflow: 'hidden' },
  happinessBarFill: { height: 12, backgroundColor: '#FFD600' },
  happinessValue: { fontSize: 12, color: '#0288d1', marginTop: 2 },
  shopModal: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0008' },
  shopTitle: { fontSize: 20, fontWeight: 'bold', color: '#0288d1', marginBottom: 16 },
  shopItem: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginVertical: 8, width: 180, alignItems: 'center' },
  barkleyDance: { width: 150, height: 150, alignSelf: 'center', marginTop: 20 },
  bone: {
    position: 'absolute',
    bottom: 0,
    left: 60, // Adjust so it lines up with Barkley's mouth
    width: 40,
    height: 40,
    zIndex: 10,
  },
  water: {
    position: 'absolute',
    bottom: 0,
    left: 120, // Adjust as needed
    width: 40,
    height: 40,
    zIndex: 10,
  },
  meterBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  meterItem: {
    alignItems: 'center',
    marginHorizontal: 14,
  },
  meterIcon: {
    width: 32,
    height: 32,
    marginBottom: 2,
    resizeMode: 'contain',
  },
  meterBg: {
    width: 48,
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 2,
  },
  meterFill: {
    height: 10,
    borderRadius: 5,
  },
  meterValue: {
    fontSize: 12,
    color: '#0288d1',
    marginTop: 2,
  },
});