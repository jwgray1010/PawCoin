import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, AccessibilityInfo } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';

const initialChores = [
  { id: '1', chore: 'Feed the Dog', points: 5, assignedTo: 'Barkley Fan', completed: false, due: null },
  { id: '2', chore: 'Clean Room', points: 3, assignedTo: 'Barkley Fan', completed: true, due: new Date() },
  { id: '3', chore: 'Take Out Trash', points: 2, assignedTo: 'Barkley Fan', completed: false, due: null },
];

const FILTERS = ['All', 'Active', 'Completed'];
const kids = ['Barkley Fan', 'Max', 'Sophie'];

export default function ParentChoresScreen() {
  const [chores, setChores] = useState(initialChores);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingChore, setEditingChore] = useState(null);
  const [newChore, setNewChore] = useState('');
  const [newPoints, setNewPoints] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDue, setNewDue] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filter, setFilter] = useState('All');
  const [showConfetti, setShowConfetti] = useState(false);

  const filteredChores = chores.filter(chore => {
    if (filter === 'Active') return !chore.completed;
    if (filter === 'Completed') return chore.completed;
    return true;
  });

  const handleAddOrEditChore = () => {
    if (!newChore || !newPoints || !newAssignee) {
      Alert.alert('Please fill out all fields.');
      return;
    }
    if (editMode && editingChore) {
      setChores(chores.map(chore =>
        chore.id === editingChore.id
          ? { ...chore, chore: newChore, points: Number(newPoints), assignedTo: newAssignee, due: newDue }
          : chore
      ));
    } else {
      setChores([
        ...chores,
        {
          id: (chores.length + 1).toString(),
          chore: newChore,
          points: Number(newPoints),
          assignedTo: newAssignee,
          completed: false,
          due: newDue,
        },
      ]);
    }
    setModalVisible(false);
    setEditMode(false);
    setEditingChore(null);
    setNewChore('');
    setNewPoints('');
    setNewAssignee('');
    setNewDue(null);
  };

  const handleEditChore = (chore) => {
    setEditMode(true);
    setEditingChore(chore);
    setNewChore(chore.chore);
    setNewPoints(chore.points.toString());
    setNewAssignee(chore.assignedTo);
    setNewDue(chore.due);
    setModalVisible(true);
  };

  const handleDeleteChore = (id) => {
    Alert.alert('Delete Chore', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setChores(chores.filter(chore => chore.id !== id)) },
    ]);
  };

  const handleToggleComplete = (id) => {
    setChores(chores.map(chore =>
      chore.id === id ? { ...chore, completed: !chore.completed } : chore
    ));
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1200);
    AccessibilityInfo.announceForAccessibility('Chore completion toggled.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReward = (item) => {
    Alert.alert('Reward sent!', 'You rewarded this chore!');
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1200);
    AccessibilityInfo.announceForAccessibility(`Reward sent for ${item.chore}.`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setNewDue(selectedDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Chores</Text>
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredChores}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={[styles.choreItem, item.completed && styles.choreCompleted]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.choreText}>{item.chore}</Text>
              <Text style={styles.assignee}>Assigned to: {item.assignedTo}</Text>
              {item.due && (
                <Text style={[styles.due, item.completed ? styles.dueDone : (item.due < new Date() ? styles.dueLate : null)]}>
                  Due: {item.due instanceof Date ? item.due.toLocaleDateString() : new Date(item.due).toLocaleDateString()}
                </Text>
              )}
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.points}>{item.points} pts</Text>
              <TouchableOpacity style={styles.completeBtn} onPress={() => handleToggleComplete(item.id)}
                accessibilityRole="button"
                accessibilityLabel={item.completed ? `Mark ${item.chore} as incomplete` : `Mark ${item.chore} as complete`}
              >
                <FontAwesome
                  name={item.completed ? 'check-circle' : 'circle-thin'}
                  size={24}
                  color={item.completed ? '#43a047' : '#0288d1'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => handleEditChore(item)}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${item.chore}`}
              >
                <MaterialIcons name="edit" size={22} color="#0288d1" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => handleDeleteChore(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.chore}`}
              >
                <MaterialIcons name="delete" size={22} color="#d32f2f" />
              </TouchableOpacity>
              {item.completed && (
                <TouchableOpacity
                  style={styles.rewardBtn}
                  onPress={() => handleReward(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Send reward for ${item.chore}`}
                >
                  <FontAwesome name="gift" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            {item.due && item.due < new Date() && !item.completed && (
              <FontAwesome name="exclamation-circle" size={18} color="#d32f2f" style={{ marginLeft: 6 }} />
            )}
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => { setModalVisible(true); setEditMode(false); setEditingChore(null); }}
        accessibilityRole="button"
        accessibilityLabel="Add a new chore"
      >
        <FontAwesome name="plus" size={24} color="#fff" />
        <Text style={styles.addBtnText}>Add Chore</Text>
      </TouchableOpacity>

      {/* Add/Edit Chore Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editMode ? 'Edit Chore' : 'Add New Chore'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Chore Name"
              value={newChore}
              onChangeText={setNewChore}
            />
            <TextInput
              style={styles.input}
              placeholder="Points"
              value={newPoints}
              onChangeText={setNewPoints}
              keyboardType="numeric"
            />
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Assign to:</Text>
              {kids.map(kid => (
                <TouchableOpacity
                  key={kid}
                  style={[
                    styles.kidOption,
                    newAssignee === kid && styles.kidOptionSelected,
                  ]}
                  onPress={() => setNewAssignee(kid)}
                >
                  <Text style={{ color: newAssignee === kid ? '#fff' : '#0288d1' }}>{kid}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialIcons name="date-range" size={20} color="#0288d1" />
              <Text style={styles.dateBtnText}>
                {newDue ? `Due: ${new Date(newDue).toLocaleDateString()}` : 'Set Due Date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={newDue ? new Date(newDue) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtn} onPress={handleAddOrEditChore}>
                <Text style={styles.modalBtnText}>{editMode ? 'Save' : 'Add'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#bdbdbd' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {showConfetti && (
        <ConfettiCannon count={40} origin={{ x: 200, y: 0 }} fadeOut />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbe9', padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0288d1',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Baloo2_700Bold',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#e1f5fe',
    marginHorizontal: 5,
  },
  filterBtnActive: {
    backgroundColor: '#0288d1',
  },
  filterText: {
    color: '#0288d1',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#fff',
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
  choreCompleted: {
    opacity: 0.5,
    backgroundColor: '#c8e6c9',
  },
  choreText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
  assignee: { fontSize: 13, color: '#0288d1', marginTop: 2 },
  due: { fontSize: 13, color: '#0288d1', marginTop: 2 },
  dueLate: { color: '#d32f2f', fontWeight: 'bold' },
  dueDone: { color: '#43a047', fontWeight: 'bold' },
  rightSection: { alignItems: 'center', flexDirection: 'row' },
  points: {
    backgroundColor: '#43a047',
    color: '#fff',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 15,
    overflow: 'hidden',
  },
  completeBtn: {
    marginTop: 2,
    padding: 4,
  },
  iconBtn: {
    marginLeft: 8,
    padding: 4,
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: '#0288d1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0288d1',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateBtnText: {
    marginLeft: 8,
    color: '#0288d1',
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: '#0288d1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerWrapper: { width: '100%', marginBottom: 12 },
  pickerLabel: { color: '#0288d1', marginBottom: 4, fontWeight: 'bold' },
  kidOption: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e1f5fe',
    marginBottom: 4,
    alignItems: 'center',
  },
  kidOptionSelected: {
    backgroundColor: '#0288d1',
  },
  rewardBtn: {
    backgroundColor: '#fbc02d',
    borderRadius: 8,
    padding: 6,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1000,
  },
});