import React, { useState, useRef } from 'react';
import { View, Button, Alert, FlatList, Text, TouchableOpacity, StyleSheet, Image, AccessibilityInfo } from 'react-native';
import ARScene from '../../ar/ARScene';
import firestore from '@react-native-firebase/firestore';
import { BarkleyProvider, useBarkley } from '../../ar/BarkleyController';
import { useNavigation } from '@react-navigation/native';

const LOGO = require('../../assets/logo.png');

const barkleyCues = [
  "Hi! Let's set up where chores happen. Tap in AR to add a chore location.",
  "Great! Tap again to add more, or edit/delete below.",
  "All set? Tap 'Save Chore Locations' when you're done."
];

function ParentARSetupScreenInner({ navigation: navProp, route }) {
  const navigation = useNavigation();
  const { bubbleText, bubbleVisible, animation, sound, speak, animate, playSound } = useBarkley();
  const [anchors, setAnchors] = useState([]);
  const [bubbleNext, setBubbleNext] = useState(false);
  const bubbleTimeout = useRef(null);

  // Accessibility: Announce screen and anchor changes
  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility('Parent AR Setup screen. Tap in AR to add a chore location.');
  }, []);
  React.useEffect(() => {
    if (anchors.length === 0) {
      AccessibilityInfo.announceForAccessibility('No chore locations set.');
    } else {
      AccessibilityInfo.announceForAccessibility(`${anchors.length} chore location${anchors.length > 1 ? 's' : ''} set.`);
    }
  }, [anchors.length]);

  // Show Barkley bubble with text for a few seconds or until Next is hit
  const showBubble = (text, showNext = false) => {
    speak(text);
    setBubbleNext(showNext);
    if (bubbleTimeout.current) clearTimeout(bubbleTimeout.current);
    if (!showNext) {
      bubbleTimeout.current = setTimeout(() => setBubbleNext(false), 3500);
    }
  };

  // Called by ARScene when anchors change
  const handleAnchorsChanged = (newAnchors) => {
    setAnchors(newAnchors);
    if (newAnchors.length === 0) {
      showBubble(barkleyCues[0], true);
    } else if (newAnchors.length === 1) {
      showBubble(barkleyCues[1], true);
    } else {
      showBubble(barkleyCues[2], true);
    }
  };

  // Delete anchor by index
  const handleDeleteAnchor = (idx) => {
    const updated = anchors.filter((_, i) => i !== idx);
    setAnchors(updated);
    showBubble("Chore location deleted. You can add more or save when ready.", true);
    AccessibilityInfo.announceForAccessibility('Chore location deleted.');
  };

  // Edit anchor label
  const handleEditAnchor = (idx) => {
    Alert.prompt(
      "Edit Chore Name",
      "Update the name for this chore location:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: (label) => {
            if (!label) return;
            const updated = anchors.map((a, i) => i === idx ? { ...a, label } : a);
            setAnchors(updated);
            showBubble("Chore name updated!", true);
            AccessibilityInfo.announceForAccessibility('Chore name updated.');
          }
        }
      ],
      "plain-text",
      anchors[idx].label
    );
  };

  // Save anchors to Firestore
  const handleSave = async () => {
    if (anchors.length === 0) {
      showBubble("Please add at least one chore location before saving.", true);
      AccessibilityInfo.announceForAccessibility('Please add at least one chore location before saving.');
      return;
    }
    try {
      const parentId = route?.params?.parentId || "demoParent";
      await firestore()
        .collection('house_anchors')
        .add({
          anchors,
          parentId,
          created: Date.now()
        });
      showBubble("Chore locations saved! You can exit setup.", true);
      AccessibilityInfo.announceForAccessibility('Chore locations saved.');
      setTimeout(() => navigation.goBack(), 1800);
    } catch (e) {
      showBubble("Could not save anchors. Please try again.", true);
      AccessibilityInfo.announceForAccessibility('Could not save anchors. Please try again.');
    }
  };

  // Show the initial bubble only once
  React.useEffect(() => {
    showBubble(barkleyCues[0], true);
    return () => {
      if (bubbleTimeout.current) clearTimeout(bubbleTimeout.current);
    };
  }, []);

  // Handler for Next button
  const handleNext = () => {
    setBubbleNext(false);
    if (bubbleTimeout.current) clearTimeout(bubbleTimeout.current);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Home button with logo */}
      <TouchableOpacity
        style={styles.logoBtn}
        onPress={() => {
          AccessibilityInfo.announceForAccessibility('Returning to home.');
          navigation.navigate('Dashboard');
        }}
        accessibilityRole="button"
        accessibilityLabel="Go to Home"
      >
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </TouchableOpacity>
      <ARScene
        onAnchorsChanged={handleAnchorsChanged}
        bubbleText={bubbleText}
        bubbleVisible={bubbleVisible}
        animation={animation}
        sound={sound}
      />
      {/* List of placed anchors with edit/delete */}
      <View style={styles.anchorListContainer}>
        <Text style={styles.anchorListTitle}>Chore Locations</Text>
        <FlatList
          data={anchors}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.anchorItem}>
              <Text style={styles.anchorLabel}>{item.label}</Text>
              <TouchableOpacity
                onPress={() => handleEditAnchor(index)}
                style={styles.editBtn}
                accessibilityRole="button"
                accessibilityLabel={`Edit chore location ${item.label}`}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteAnchor(index)}
                style={styles.deleteBtn}
                accessibilityRole="button"
                accessibilityLabel={`Delete chore location ${item.label}`}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Tap in AR to add a chore location</Text>}
        />
      </View>
      {/* Save button */}
      <View style={styles.saveBtnContainer}>
        <Button
          title="Save Chore Locations"
          onPress={handleSave}
          color="#0288d1"
          accessibilityLabel="Save Chore Locations"
          accessibilityRole="button"
        />
      </View>
      {/* Next button for bubble */}
      {bubbleVisible && bubbleNext && (
        <View style={styles.nextBtnOverlay}>
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel="Next"
          >
            <Text style={styles.nextBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function ParentARSetupScreen(props) {
  return (
    <BarkleyProvider>
      <ParentARSetupScreenInner {...props} />
    </BarkleyProvider>
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
  anchorListContainer: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: '#ffffffee',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  anchorListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0288d1',
    marginBottom: 8,
    textAlign: 'center',
  },
  anchorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  anchorLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  editBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
    borderRadius: 6,
    backgroundColor: '#e3f2fd',
  },
  editText: {
    color: '#0288d1',
    fontWeight: 'bold',
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#ffebee',
  },
  deleteText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#0288d1',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  saveBtnContainer: {
    position: 'absolute',
    bottom: 40,
    left: 32,
    right: 32,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0288d1',
    elevation: 4,
  },
  nextBtnOverlay: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  nextBtn: {
    marginTop: 4,
    backgroundColor: '#0288d1',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});