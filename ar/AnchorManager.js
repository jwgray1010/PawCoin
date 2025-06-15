// This is a scaffold for managing AR anchors for chores

// Example anchor object:
// {
//   id: 'anchor-uuid',
//   name: 'Feed the Dog',
//   position: { x: 0, y: 0 },
//   description: 'Put food in Barkley’s bowl', // reverted to Barkley
//   assignedKidId: 'kid123',
//   completed: false
// }

import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';

/**
 * @typedef {Object} Anchor
 * @property {string} id
 * @property {string} name
 * @property {{x: number, y: number, z: number}} position
 * @property {string} description
 * @property {string} [assignedKidId]
 * @property {boolean} completed
 * @property {string} qrStartCode
 * @property {string} qrEndCode
 * @property {number} minDurationSeconds
 * @property {number|null} startedAt
 * @property {number|null} finishedAt
 * @property {Array<Object>} [history]
 */

export default class AnchorManager {
  constructor() {
    this.anchors = [];
    this.listeners = [];
    this.unsubscribe = null;
    this.undoStack = [];
    this.redoStack = [];
  }

  // --- Event System ---

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  notifyListeners() {
    for (const cb of this.listeners) {
      cb(this.anchors);
    }
  }

  // --- Validation ---

  validateAnchor(anchor) {
    if (!anchor.name) return 'Anchor must have a name.';
    if (
      !anchor.position ||
      typeof anchor.position.x !== 'number' ||
      typeof anchor.position.y !== 'number' ||
      typeof anchor.position.z !== 'number'
    ) {
      return 'Anchor position must be an object with x, y, z numbers.';
    }
    if (!anchor.description) return 'Anchor must have a description.';
    return null;
  }

  // --- Real-Time Firestore Sync ---

  listenToAnchors() {
    if (this.unsubscribe) this.unsubscribe();
    this.unsubscribe = onSnapshot(collection(db, 'anchors'), snapshot => {
      this.anchors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.notifyListeners();
    });
  }

  stopListening() {
    if (this.unsubscribe) this.unsubscribe();
    this.unsubscribe = null;
  }

  // --- CRUD Operations ---

  async loadAnchors() {
    try {
      const snapshot = await getDocs(collection(db, 'anchors'));
      this.anchors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.notifyListeners();
      return this.anchors;
    } catch (e) {
      console.error('Failed to load anchors:', e);
      return [];
    }
  }

  async addAnchor(anchor) {
    const validationError = this.validateAnchor(anchor);
    if (validationError) {
      console.error(validationError);
      return null;
    }
    try {
      const anchorId = uuidv4();
      const anchorData = {
        ...anchor,
        id: anchorId,
        qrStartCode: uuidv4(),
        qrEndCode: uuidv4(),
        minDurationSeconds: anchor.minDurationSeconds || 60,
        startedAt: null,
        finishedAt: null,
        completed: false,
        history: [],
      };
      await setDoc(doc(db, 'anchors', anchorId), anchorData);
      this.anchors.push(anchorData);
      this._pushUndo({ type: 'add', anchor: anchorData });
      this.notifyListeners();
      return anchorData;
    } catch (e) {
      console.error('Failed to add anchor:', e);
      return null;
    }
  }

  async updateAnchor(anchor) {
    if (!anchor.id) {
      console.error('Anchor must have an id to update.');
      return false;
    }
    try {
      const prev = this.anchors.find(a => a.id === anchor.id);
      await updateDoc(doc(db, 'anchors', anchor.id), anchor);
      this.anchors = this.anchors.map(a => (a.id === anchor.id ? anchor : a));
      this._pushUndo({ type: 'update', before: prev, after: anchor });
      this.notifyListeners();
      return true;
    } catch (e) {
      console.error('Failed to update anchor:', e);
      return false;
    }
  }

  async removeAnchor(anchorId) {
    try {
      const prev = this.anchors.find(a => a.id === anchorId);
      await deleteDoc(doc(db, 'anchors', anchorId));
      this.anchors = this.anchors.filter(a => a.id !== anchorId);
      this._pushUndo({ type: 'remove', anchor: prev });
      this.notifyListeners();
      return true;
    } catch (e) {
      console.error('Failed to remove anchor:', e);
      return false;
    }
  }

  async completeAnchor(anchorId) {
    try {
      await updateDoc(doc(db, 'anchors', anchorId), { completed: true });
      this.anchors = this.anchors.map(a => a.id === anchorId ? { ...a, completed: true } : a);
      this.notifyListeners();
      return true;
    } catch (e) {
      console.error('Failed to complete anchor:', e);
      return false;
    }
  }

  async assignKidToAnchor(anchorId, kidId) {
    try {
      await updateDoc(doc(db, 'anchors', anchorId), { assignedKidId: kidId });
      this.anchors = this.anchors.map(a => a.id === anchorId ? { ...a, assignedKidId: kidId } : a);
      this.notifyListeners();
      return true;
    } catch (e) {
      console.error('Failed to assign kid:', e);
      return false;
    }
  }

  async startChore(anchorId) {
    try {
      const startedAt = Date.now();
      await updateDoc(doc(db, 'anchors', anchorId), { startedAt });
      this.anchors = this.anchors.map(a => a.id === anchorId ? { ...a, startedAt } : a);
      this.notifyListeners();
      return true;
    } catch (e) {
      console.error('Failed to start chore:', e);
      return false;
    }
  }

  async finishChore(anchorId) {
    try {
      const anchorRef = doc(db, 'anchors', anchorId);
      const anchorSnap = await getDoc(anchorRef);
      if (anchorSnap.exists()) {
        const anchor = anchorSnap.data();
        const finishedAt = Date.now();
        const duration = anchor.startedAt ? (finishedAt - anchor.startedAt) / 1000 : 0;
        const completed = duration >= (anchor.minDurationSeconds || 60);
        await updateDoc(anchorRef, { finishedAt, completed });
        this.anchors = this.anchors.map(a => a.id === anchorId ? { ...a, finishedAt, completed } : a);
        this.notifyListeners();
        return { finishedAt, completed, duration };
      }
      return null;
    } catch (e) {
      console.error('Failed to finish chore:', e);
      return null;
    }
  }

  async getQrCodes(anchorId) {
    try {
      const anchorSnap = await getDoc(doc(db, 'anchors', anchorId));
      if (anchorSnap.exists()) {
        const anchor = anchorSnap.data();
        return {
          start: anchor.qrStartCode,
          end: anchor.qrEndCode,
        };
      }
      return null;
    } catch (e) {
      console.error('Failed to get QR codes:', e);
      return null;
    }
  }

  // --------- SYNC METHODS ---------

  async syncToBackend(apiUrl) {
    try {
      if (!this.anchors.length) await this.loadAnchors();
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.anchors),
      });
      if (!response.ok) throw new Error('Failed to sync to backend');
      return true;
    } catch (e) {
      console.error('Failed to sync to backend:', e);
      return false;
    }
  }

  async loadFromBackend(apiUrl) {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to load from backend');
      const anchors = await response.json();
      const batch = writeBatch(db);
      for (const anchor of anchors) {
        batch.set(doc(db, 'anchors', anchor.id), anchor);
      }
      await batch.commit();
      this.anchors = anchors;
      this.notifyListeners();
      return anchors;
    } catch (e) {
      console.error('Failed to load from backend:', e);
      return [];
    }
  }

  // --------- AR HELPERS ---------

  findNearestAnchor(position, maxDistance = 1.0) {
    if (!this.anchors.length) return null;
    let nearest = null;
    let minDist = Infinity;
    for (const anchor of this.anchors) {
      if (!anchor.position) continue;
      const dx = anchor.position.x - position.x;
      const dy = anchor.position.y - position.y;
      const dz = anchor.position.z - position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < minDist && dist <= maxDistance) {
        minDist = dist;
        nearest = anchor;
      }
    }
    return nearest;
  }

  getAnchorsForKid(kidId) {
    return this.anchors.filter(anchor => anchor.assignedKidId === kidId);
  }

  // --------- Undo/Redo & History ---------

  _pushUndo(action) {
    this.undoStack.push(action);
    this.redoStack = [];
  }

  async undo() {
    const action = this.undoStack.pop();
    if (!action) return false;
    switch (action.type) {
      case 'add':
        await this.removeAnchor(action.anchor.id);
        break;
      case 'remove':
        await this.addAnchor(action.anchor);
        break;
      case 'update':
        await this.updateAnchor(action.before);
        break;
      default:
        return false;
    }
    this.redoStack.push(action);
    return true;
  }

  async redo() {
    const action = this.redoStack.pop();
    if (!action) return false;
    switch (action.type) {
      case 'add':
        await this.addAnchor(action.anchor);
        break;
      case 'remove':
        await this.removeAnchor(action.anchor.id);
        break;
      case 'update':
        await this.updateAnchor(action.after);
        break;
      default:
        return false;
    }
    this.undoStack.push(action);
    return true;
  }

  async addHistory(anchorId, entry) {
    try {
      const anchor = this.anchors.find(a => a.id === anchorId);
      if (!anchor) return false;
      const updatedHistory = [...(anchor.history || []), { ...entry, timestamp: Date.now() }];
      await updateDoc(doc(db, 'anchors', anchorId), { history: updatedHistory });
      this.anchors = this.anchors.map(a => a.id === anchorId ? { ...a, history: updatedHistory } : a);
      this.notifyListeners();
      return true;
    } catch (e) {
      console.error('Failed to add history:', e);
      return false;
    }
  }

  // --------- DEV UTIL ---------

  async clearAllAnchors() {
    try {
      const snapshot = await getDocs(collection(db, 'anchors'));
      const batch = writeBatch(db);
      for (const docSnap of snapshot.docs) {
        batch.delete(doc(db, 'anchors', docSnap.id));
      }
      await batch.commit();
      this.anchors = [];
      this.notifyListeners();
      return true;
    } catch (e) {
      console.error('Failed to clear all anchors:', e);
      return false;
    }
  }
}