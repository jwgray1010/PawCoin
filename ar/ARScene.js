import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Modal, TextInput, Text, Alert } from 'react-native';
import { ViroARScene, Viro3DObject, ViroAmbientLight, ViroNode, ViroText, ViroARPlaneSelector, ViroQuad } from '@viro-community/react-viro';
import { useNavigation } from '@react-navigation/native';
import AnchorManager from './AnchorManager';
import { Audio } from 'expo-av';

const anchorManager = new AnchorManager();

export default function ARScene({ bubbleText, bubbleVisible, animation, sound }) {
  const [anchors, setAnchors] = useState([]);
  const [selectedAnchor, setSelectedAnchor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [choreName, setChoreName] = useState('');
  const [pendingPosition, setPendingPosition] = useState(null);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const [redoAvailable, setRedoAvailable] = useState(false);
  const navigation = useNavigation();

  // Real-time anchor updates
  useEffect(() => {
    anchorManager.listenToAnchors();
    const listener = updatedAnchors => setAnchors([...updatedAnchors]);
    anchorManager.addListener(listener);
    return () => {
      anchorManager.removeListener(listener);
      anchorManager.stopListening();
    };
  }, []);

  // Update undo/redo availability
  useEffect(() => {
    setUndoAvailable(anchorManager.undoStack.length > 0);
    setRedoAvailable(anchorManager.redoStack.length > 0);
  }, [anchors]);

  // Play sound feedback
  const playSound = async () => {
    if (!sound) return;
    try {
      const { sound: s } = await Audio.Sound.createAsync(sound);
      await s.playAsync();
      setTimeout(() => s.unloadAsync(), 1000);
    } catch (e) {}
  };

  // Handle AR plane tap: prompt for chore name
  const handlePlaneClick = (source, position, normal) => {
    setPendingPosition(position);
    setChoreName('');
    setModalVisible(true);
  };

  // Confirm anchor placement
  const handleAddAnchor = async () => {
    if (!choreName.trim()) {
      Alert.alert('Please enter a chore name.');
      return;
    }
    await anchorManager.addAnchor({
      name: choreName,
      position: { x: pendingPosition[0], y: pendingPosition[1], z: pendingPosition[2] },
      description: choreName,
    });
    setChoreName('');
    setPendingPosition(null);
    setModalVisible(false);
    playSound();
  };

  // Select anchor (tap)
  const handleAnchorTap = idx => {
    setSelectedAnchor(idx);
  };

  // Remove anchor (long-press)
  const handleAnchorLongPress = async idx => {
    const anchor = anchors[idx];
    if (!anchor) return;
    Alert.alert(
      'Remove Anchor',
      `Delete "${anchor.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await anchorManager.removeAnchor(anchor.id);
            setSelectedAnchor(null);
          },
        },
      ]
    );
  };

  // Edit anchor (double-tap)
  const handleAnchorDoubleTap = idx => {
    setSelectedAnchor(idx);
    setChoreName(anchors[idx].name);
    setEditModalVisible(true);
  };

  // Save anchor edit
  const handleEditAnchor = async () => {
    const anchor = anchors[selectedAnchor];
    if (!anchor) return;
    await anchorManager.updateAnchor({ ...anchor, name: choreName, description: choreName });
    setEditModalVisible(false);
    setChoreName('');
  };

  // Undo/redo handlers
  const handleUndo = async () => {
    await anchorManager.undo();
  };
  const handleRedo = async () => {
    await anchorManager.redo();
  };

  // Anchor tap handler with double-tap detection
  const tapTimeout = useRef(null);
  const lastTap = useRef(0);
  const handleNodeTap = idx => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      clearTimeout(tapTimeout.current);
      handleAnchorDoubleTap(idx);
    } else {
      tapTimeout.current = setTimeout(() => handleAnchorTap(idx), 300);
    }
    lastTap.current = now;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Home button */}
      <TouchableOpacity
        style={styles.logoBtn}
        onPress={() => navigation.navigate('Dashboard')}
        accessibilityRole="button"
        accessibilityLabel="Go to Home"
      >
        <Text style={{fontSize: 18, color: '#0288d1'}}>Home</Text>
      </TouchableOpacity>

      {/* Undo/Redo controls */}
      <View style={styles.undoRedoRow}>
        <TouchableOpacity
          style={[styles.undoRedoBtn, !undoAvailable && styles.disabledBtn]}
          onPress={handleUndo}
          disabled={!undoAvailable}
          accessibilityLabel="Undo"
        >
          <Text style={styles.undoRedoText}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.undoRedoBtn, !redoAvailable && styles.disabledBtn]}
          onPress={handleRedo}
          disabled={!redoAvailable}
          accessibilityLabel="Redo"
        >
          <Text style={styles.undoRedoText}>Redo</Text>
        </TouchableOpacity>
      </View>

      {/* Chore naming modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Name this Chore</Text>
            <TextInput
              style={styles.input}
              placeholder="Chore name"
              value={choreName}
              onChangeText={setChoreName}
              autoFocus
              onSubmitEditing={handleAddAnchor}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddAnchor} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit anchor modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Chore Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Chore name"
              value={choreName}
              onChangeText={setChoreName}
              autoFocus
              onSubmitEditing={handleEditAnchor}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEditAnchor} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ViroARScene>
        <ViroAmbientLight color="#ffffff" />
        {/* Barkley with speech bubble */}
        <ViroNode position={[0, -0.2, -1]}>
          <Viro3DObject
            source={BARKLEY_MODEL}
            scale={[0.15, 0.15, 0.15]}
            type="GLB"
            animation={{ name: animation, run: animation !== 'idle', loop: false }}
          />
          {bubbleVisible && (
            <ViroNode position={[0, 0.32, 0]}>
              <ViroQuad
                position={[0, 0, -0.01]}
                width={0.7}
                height={0.22}
                cornerRadius={0.11}
                color="#fffbe9"
                opacity={0.92}
              />
              <ViroText
                text={bubbleText}
                width={1.2}
                height={0.3}
                position={[0, 0, 0]}
                scale={[0.35, 0.35, 0.35]}
                style={{
                  fontFamily: 'AvenirNext-Bold',
                  fontSize: 32,
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
                position={[0, -0.14, 0]}
                rotation={[-90, 0, 0]}
                width={0.08}
                height={0.08}
                color="#fffbe9"
                opacity={0.92}
              />
            </ViroNode>
          )}
        </ViroNode>
        {/* Anchor placement */}
        <ViroARPlaneSelector onPlaneSelected={handlePlaneClick}>
          {anchors.map((anchor, idx) => (
            <ViroNode
              key={anchor.id || idx}
              position={[anchor.position.x, anchor.position.y, anchor.position.z]}
              onClick={() => handleNodeTap(idx)}
              onLongPress={() => handleAnchorLongPress(idx)}
            >
              {/* Use a simple colored quad as the anchor marker */}
              <ViroQuad
                width={0.1}
                height={0.1}
                color={selectedAnchor === idx ? '#FFD600' : '#0288d1'}
                opacity={0.8}
              />
              <ViroText
                text={anchor.name}
                scale={[0.2, 0.2, 0.2]}
                position={[0, 0.15, 0]}
                style={{ fontFamily: 'Arial', color: selectedAnchor === idx ? '#d32f2f' : '#0288d1' }}
              />
            </ViroNode>
          ))}
        </ViroARPlaneSelector>
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
  undoRedoRow: {
    position: 'absolute',
    top: 24,
    left: 24,
    flexDirection: 'row',
    zIndex: 100,
  },
  undoRedoBtn: {
    backgroundColor: '#e1f5fe',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#0288d1',
  },
  undoRedoText: {
    color: '#0288d1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledBtn: {
    opacity: 0.4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: 320,
    shadowColor: '#0288d1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0288d1',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 18,
    backgroundColor: '#f5f5f5',
    color: '#333',
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalBtnText: {
    color: '#0288d1',
    fontWeight: 'bold',
    fontSize: 16,
  },
});