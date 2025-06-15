import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, AccessibilityInfo, Alert } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

const avatars = [
  require('../../assets/avatars/avatar1.png'),
  require('../../assets/avatars/avatar2.png'),
  require('../../assets/avatars/avatar3.png'),
  require('../../assets/avatars/avatar4.png'),
  require('../../assets/avatars/avatar5.png'),
  require('../../assets/avatars/avatar6.png'),
  require('../../assets/avatars/avatar7.png')
  // Add more avatar images here
];

export default function KidSignUp({ navigation }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selected, setSelected] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);

  // Accessibility: Announce screen and errors
  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility('Kid Sign Up screen');
  }, []);
  React.useEffect(() => {
    if (error) {
      AccessibilityInfo.announceForAccessibility(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [error]);
  React.useEffect(() => {
    if (success) {
      AccessibilityInfo.announceForAccessibility(`Welcome, ${name}! Your account has been created.`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [success]);

  const pickPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setSelected('photo');
      AccessibilityInfo.announceForAccessibility('Photo selected.');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setSelected('photo');
      AccessibilityInfo.announceForAccessibility('Photo taken.');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Combine avatars and photo option for FlatList
  const avatarOptions = photoUri
    ? [...avatars, { uri: photoUri, isPhoto: true }]
    : avatars;

  const handleSignUp = async () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!username.trim()) {
      setError('Please choose a username.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setLoading(true);
    // TODO: Connect to your sign-up API or Firebase here
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <FontAwesome name="paw" size={44} color="#0288d1" style={{ marginBottom: 12 }} />
        <Text style={styles.title}>Kid Sign Up</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? (
          <Text style={styles.success}>
            🎉 Welcome, {name}! Your account has been created.
          </Text>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
              accessibilityLabel="Your Name"
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              returnKeyType="next"
              accessibilityLabel="Username"
            />
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                returnKeyType="done"
                accessibilityLabel="Password"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                accessibilityRole="button"
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="#0288d1"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Pick your avatar</Text>
            <FlatList
              data={avatarOptions}
              numColumns={3}
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={({ item, index }) => {
                const isPhoto = item.isPhoto;
                const isSelected = selected === index || (isPhoto && selected === 'photo');
                return (
                  <TouchableOpacity
                    style={[
                      styles.avatarBox,
                      isSelected && styles.avatarSelected,
                    ]}
                    onPress={() => {
                      setSelected(isPhoto ? 'photo' : index);
                      AccessibilityInfo.announceForAccessibility(
                        isPhoto
                          ? `Your photo${isSelected ? ', selected' : ''}`
                          : `Avatar ${index + 1}${isSelected ? ', selected' : ''}`
                      );
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    accessibilityLabel={
                      isPhoto
                        ? `Your photo${isSelected ? ', selected' : ''}`
                        : `Avatar ${index + 1}${isSelected ? ', selected' : ''}`
                    }
                    accessibilityRole="button"
                  >
                    <Image
                      source={isPhoto ? { uri: item.uri } : item}
                      style={styles.avatarImg}
                    />
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Text style={{ color: '#0288d1', fontWeight: 'bold' }}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}
            />
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={pickPhoto}
                accessibilityRole="button"
                accessibilityLabel="Choose Photo"
              >
                <Text style={styles.photoButtonText}>Choose Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={takePhoto}
                accessibilityRole="button"
                accessibilityLabel="Take Photo"
              >
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.nextButton,
                selected === null && { backgroundColor: '#90caf9' },
              ]}
              disabled={selected === null}
              onPress={() => {
                if (selected === 'photo') {
                  AccessibilityInfo.announceForAccessibility('Photo selected. Proceeding to parent approval.');
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  navigation.navigate('ParentApprovePhoto', { photoUri });
                } else {
                  AccessibilityInfo.announceForAccessibility('Avatar selected. Proceeding to profile.');
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  navigation.navigate('KidProfile', { avatar: avatars[selected] });
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Next"
            >
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: '#43a047', marginTop: 10 }]}
              onPress={handleSignUp}
              accessibilityRole="button"
              accessibilityLabel="Sign Up"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.nextText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbe9', justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#0288d1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0288d1',
    marginBottom: 18,
    fontFamily: 'Baloo2_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 18,
    backgroundColor: '#f5f5f5',
    color: '#333',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
  },
  eyeBtn: {
    padding: 8,
    marginLeft: -40,
    zIndex: 1,
  },
  avatarBox: {
    margin: 12,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'transparent',
    padding: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarSelected: {
    borderColor: '#0288d1',
    backgroundColor: '#E6F7FF',
  },
  avatarImg: { width: 70, height: 70, borderRadius: 35 },
  checkmark: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#0288d1',
  },
  photoButton: {
    backgroundColor: '#E6F7FF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  photoButtonText: {
    color: '#0288d1',
    fontWeight: 'bold',
    fontSize: 15,
  },
  nextButton: {
    marginTop: 10,
    backgroundColor: '#0288d1',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  nextText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  error: {
    color: '#d32f2f',
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  success: {
    color: '#43a047',
    fontSize: 16,
    marginTop: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});