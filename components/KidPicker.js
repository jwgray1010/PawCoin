import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

const fallbackAvatar = require('../../assets/avatars/default_avatar.png');

export default function KidPicker({
  kids = [],
  selectedKidId,
  onSelect,
  showSkip = false,
  onSkip,
  label = 'Select Kid',
}) {
  const { width } = Dimensions.get('window');
  const avatarSize = Math.max(36, Math.min(60, width * 0.13));

  // Accessibility: Announce selection
  React.useEffect(() => {
    if (selectedKidId) {
      const kid = kids.find(k => k.id === selectedKidId);
      if (kid) {
        AccessibilityInfo.announceForAccessibility(`Selected ${kid.name}${kid.nickname ? ', ' + kid.nickname : ''}`);
      }
    }
  }, [selectedKidId, kids]);

  const handleSelect = (id) => {
    if (onSelect) onSelect(id);
    Haptics.selectionAsync();
  };

  if (!kids.length) {
    return (
      <View style={styles.emptyRow}>
        <Text style={styles.emptyText}>No kids found.</Text>
        {showSkip && onSkip && (
          <TouchableOpacity style={styles.skipBtn} onPress={onSkip} accessibilityRole="button" accessibilityLabel="Skip">
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.pickerRow}>
      <Text style={styles.label}>{label}:</Text>
      <FlatList
        horizontal
        data={kids}
        keyExtractor={kid => kid.id}
        showsHorizontalScrollIndicator={true}
        renderItem={({ item }) => {
          let avatarSource = fallbackAvatar;
          if (item.avatar) {
            if (typeof item.avatar === 'string' && item.avatar.startsWith('http')) {
              avatarSource = { uri: item.avatar };
            } else {
              avatarSource = item.avatar;
            }
          }
          return (
            <TouchableOpacity
              style={[
                styles.kidButton,
                item.id === selectedKidId && styles.kidButtonSelected,
              ]}
              onPress={() => handleSelect(item.id)}
              accessibilityRole="button"
              accessible={true}
              accessibilityLabel={`Select ${item.name}${item.nickname ? ', ' + item.nickname : ''}${item.id === selectedKidId ? ', selected' : ''}`}
            >
              <View style={{ alignItems: 'center', position: 'relative' }}>
                <Image
                  source={avatarSource}
                  style={[
                    styles.avatar,
                    { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
                    item.id === selectedKidId && styles.avatarSelected,
                  ]}
                />
                {typeof item.coins === 'number' && (
                  <Text style={styles.coinText}>{item.coins} 🪙</Text>
                )}
                {item.isFavorite && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>★</Text>
                  </View>
                )}
              </View>
              <View>
                <Text style={[
                  styles.kidText,
                  item.id === selectedKidId && styles.kidTextSelected,
                ]}>
                  {item.name}
                </Text>
                {item.nickname && (
                  <Text style={styles.kidSubtext}>{item.nickname}</Text>
                )}
                {item.age && (
                  <Text style={styles.kidSubtext}>Age: {item.age}</Text>
                )}
              </View>
              {item.id === selectedKidId && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
      {showSkip && onSkip && (
        <TouchableOpacity style={styles.skipBtn} onPress={onSkip} accessibilityRole="button" accessibilityLabel="Skip">
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pickerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  label: { fontWeight: 'bold', color: '#0288d1', marginRight: 10, fontSize: 16 },
  kidButton: {
    backgroundColor: '#E6F7FF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  kidButtonSelected: {
    backgroundColor: '#0288d1',
    shadowColor: '#0288d1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFD600',
  },
  avatar: {
    marginRight: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#b3e5fc',
  },
  avatarSelected: {
    borderColor: '#fff',
    borderWidth: 3,
    shadowColor: '#0288d1',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  coinText: {
    fontSize: 12,
    color: '#FFD600',
    fontWeight: 'bold',
    marginTop: 2,
  },
  kidText: { color: '#0288d1', fontWeight: 'bold', fontSize: 16 },
  kidTextSelected: { color: '#fff' },
  kidSubtext: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  checkmark: {
    marginLeft: 8,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FFD600',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#0288d1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  skipBtn: {
    backgroundColor: '#fffde7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#FFD600',
  },
  skipText: {
    color: '#0288d1',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  emptyText: { color: '#888', fontSize: 16, marginRight: 10 },
});