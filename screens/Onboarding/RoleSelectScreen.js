import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AccessibilityInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function RoleSelectScreen({ navigation }) {
  // Accessibility: Announce screen on mount
  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility('Role selection screen. Choose Parent or Kid.');
  }, []);

  const handleSelect = (role) => {
    AccessibilityInfo.announceForAccessibility(`${role} selected.`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate(role === 'Parent' ? 'ParentSignUp' : 'KidSignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Who are you?</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => handleSelect('Parent')}
          accessibilityRole="button"
          accessibilityLabel="I am a Parent"
        >
          <FontAwesome5 name="user-tie" size={36} color="#0288d1" />
          <Text style={styles.roleText}>Parent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => handleSelect('Kid')}
          accessibilityRole="button"
          accessibilityLabel="I am a Kid"
        >
          <FontAwesome5 name="user" size={36} color="#0288d1" />
          <Text style={styles.roleText}>Kid</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b3e5fc',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0288d1',
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  roleButton: {
    backgroundColor: '#E6F7FF',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
  },
  roleText: {
    marginTop: 16,
    fontSize: 18,
    color: '#0288d1',
    fontWeight: 'bold',
  },
});