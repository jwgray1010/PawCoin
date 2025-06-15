import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, AccessibilityInfo, Alert } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as Haptics from 'expo-haptics';

async function loadBarkleyModel(scene, animationName) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync('path/to/barkley_model.glb');
  const barkley = gltf.scene;
  barkley.position.set(0, 0.5, -2);
  scene.add(barkley);

  // Animation mixer setup
  const mixer = new THREE.AnimationMixer(barkley);
  const clip = THREE.AnimationClip.findByName(gltf.animations, animationName);
  if (clip) mixer.clipAction(clip).play();

  return { barkley, mixer, animations: gltf.animations };
}

export default function FollowBarkleyScreen({ route }) {
  const anchorPosition = route?.params?.anchorPosition || { x: 0, y: 0, z: -3 };
  const [barkleyAnim, setBarkleyAnim] = useState('fallback1');
  const [atAnchor, setAtAnchor] = useState(false);
  const [doingChore, setDoingChore] = useState(false);

  // Accessibility: Announce Barkley's arrival
  React.useEffect(() => {
    if (atAnchor) {
      AccessibilityInfo.announceForAccessibility('Barkley arrived at the anchor!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [atAnchor]);

  // Accessibility: Announce feed
  React.useEffect(() => {
    if (barkleyAnim === 'happy') {
      AccessibilityInfo.announceForAccessibility('You fed Barkley!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [barkleyAnim]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Follow Barkley to your Chore!</Text>
      <GLView
        style={styles.glview}
        onContextCreate={async (gl) => {
          try {
            const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            camera.position.set(0, 1, 3);

            const renderer = new Renderer({ gl });
            renderer.setSize(width, height);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
            scene.add(ambientLight);

            // Load Barkley
            const loader = new GLTFLoader();
            const gltf = await loader.loadAsync('path/to/barkley_model.glb');
            const barkley = gltf.scene;
            scene.add(barkley);
            const animations = gltf.animations;
            const mixer = new THREE.AnimationMixer(barkley);

            function playAnimation(name) {
              const clip = THREE.AnimationClip.findByName(animations, name);
              if (clip) {
                mixer.stopAllAction();
                mixer.clipAction(clip).play();
              }
            }

            playAnimation(barkleyAnim);

            const clock = new THREE.Clock();

            // Animation loop
            const animate = () => {
              requestAnimationFrame(animate);

              // Barkley attention-getting logic
              if (!doingChore && !atAnchor) {
                playAnimation('fallback1'); // or alternate with 'jump', 'waving'
              }

              // Move Barkley toward anchor if not at anchor and not doing chore
              if (!atAnchor && !doingChore) {
                barkley.position.lerp(new THREE.Vector3(anchorPosition.x, anchorPosition.y, anchorPosition.z), 0.02);
                if (barkley.position.distanceTo(new THREE.Vector3(anchorPosition.x, anchorPosition.y, anchorPosition.z)) < 0.1) {
                  setAtAnchor(true);
                  playAnimation('waving');
                }
              }

              // If doing chore, Barkley walks or runs
              if (doingChore) {
                playAnimation('walk'); // or 'run'
              }

              mixer.update(clock.getDelta());
              renderer.render(scene, camera);
              gl.endFrameEXP();
            };
            animate();
          } catch (e) {
            AccessibilityInfo.announceForAccessibility('3D Barkley failed to load.');
            Alert.alert('Error', 'Could not load Barkley 3D model.');
          }
        }}
      />
      <Text style={styles.instructions}>
        Walk with Barkley to the highlighted spot to start your chore.
      </Text>
      {!doingChore && atAnchor && (
        <TouchableOpacity
          style={{ marginTop: 16, backgroundColor: '#FFD600', padding: 12, borderRadius: 8 }}
          onPress={() => {
            setBarkleyAnim('happy');
            setTimeout(() => setBarkleyAnim('idle1'), 2000); // Return to idle after 2 seconds
          }}
          accessibilityRole="button"
          accessibilityLabel="Feed Barkley"
        >
          <Text style={{ color: '#795548', fontWeight: 'bold' }}>Feed Barkley</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F7FF', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0288d1', marginTop: 24, marginBottom: 12 },
  glview: { width: Dimensions.get('window').width, height: 350, backgroundColor: '#fff', borderRadius: 16 },
  instructions: { fontSize: 16, color: '#0288d1', marginTop: 20, textAlign: 'center', paddingHorizontal: 24 },
});