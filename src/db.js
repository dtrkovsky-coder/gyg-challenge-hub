import { db } from './firebase';
import { doc, getDoc, setDoc, runTransaction, collection, getDocs, addDoc, deleteDoc, query, where } from 'firebase/firestore';

// --- Users (stored as individual Firestore documents for concurrent safety) ---

export async function getUsers() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const users = [];
    snap.forEach(d => users.push({ ...d.data(), _docId: d.id }));
    return users;
  } catch (e) { console.error('getUsers error:', e); return []; }
}

export async function addUser(user) {
  try {
    await setDoc(doc(db, 'users', user.id), user);
    return true;
  } catch (e) { console.error('addUser error:', e); return false; }
}

export async function updateUser(userId, updates) {
  try {
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await setDoc(ref, { ...snap.data(), ...updates });
    }
    return true;
  } catch (e) { console.error('updateUser error:', e); return false; }
}

export async function deleteUser(userId) {
  try {
    await deleteDoc(doc(db, 'users', userId));
    // Also delete their completions
    const compsSnap = await getDocs(query(collection(db, 'completions'), where('userId', '==', userId)));
    const deletes = [];
    compsSnap.forEach(d => deletes.push(deleteDoc(d.ref)));
    await Promise.all(deletes);
    return true;
  } catch (e) { console.error('deleteUser error:', e); return false; }
}

// --- Completions (individual documents) ---

export async function getCompletions() {
  try {
    const snap = await getDocs(collection(db, 'completions'));
    const comps = [];
    snap.forEach(d => comps.push({ ...d.data(), _docId: d.id }));
    return comps;
  } catch (e) { console.error('getCompletions error:', e); return []; }
}

export async function addCompletion(comp) {
  try {
    await setDoc(doc(db, 'completions', comp.id), comp);
    return true;
  } catch (e) { console.error('addCompletion error:', e); return false; }
}

export async function updateCompletion(compId, updates) {
  try {
    const ref = doc(db, 'completions', compId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await setDoc(ref, { ...snap.data(), ...updates });
    }
    return true;
  } catch (e) { console.error('updateCompletion error:', e); return false; }
}

// --- Challenges (single document per program) ---

export async function getChallenges() {
  try {
    const ref = doc(db, 'config', 'challenges');
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (e) { console.error('getChallenges error:', e); return null; }
}

export async function setChallenges(challenges) {
  try {
    await setDoc(doc(db, 'config', 'challenges'), challenges);
    return true;
  } catch (e) { console.error('setChallenges error:', e); return false; }
}

// --- Lunch Config ---

export async function getLunchConfig() {
  try {
    const ref = doc(db, 'config', 'lunchConfig');
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (e) { console.error('getLunchConfig error:', e); return null; }
}

export async function setLunchConfig(config) {
  try {
    await setDoc(doc(db, 'config', 'lunchConfig'), config);
    return true;
  } catch (e) { console.error('setLunchConfig error:', e); return false; }
}

// --- Session (localStorage - device specific) ---

export function getSession() {
  try {
    const s = localStorage.getItem('gyg-session');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function setSession(session) {
  if (session) {
    localStorage.setItem('gyg-session', JSON.stringify(session));
  } else {
    localStorage.removeItem('gyg-session');
  }
}

// --- Activity Completions (individual documents) ---

export async function getActivityCompletions() {
  try {
    const snap = await getDocs(collection(db, 'activityCompletions'));
    const comps = [];
    snap.forEach(d => comps.push({ ...d.data(), _docId: d.id }));
    return comps;
  } catch (e) { console.error('getActivityCompletions error:', e); return []; }
}

export async function addActivityCompletion(comp) {
  try {
    await setDoc(doc(db, 'activityCompletions', comp.id), comp);
    return true;
  } catch (e) { console.error('addActivityCompletion error:', e); return false; }
}

// --- Batch Control (single config document) ---

export async function getBatchControl() {
  try {
    const ref = doc(db, 'config', 'batchControl');
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (e) { console.error('getBatchControl error:', e); return null; }
}

export async function setBatchControl(config) {
  try {
    await setDoc(doc(db, 'config', 'batchControl'), config);
    return true;
  } catch (e) { console.error('setBatchControl error:', e); return false; }
}

// --- Coolroom Images (one doc per image to stay under 1MB limit) ---

export async function getCoolroomImages(batch) {
  try {
    const result = {};
    for (const key of ['imgA', 'imgB']) {
      const ref = doc(db, 'coolroomImages', `${batch}_${key}`);
      const snap = await getDoc(ref);
      if (snap.exists()) result[key] = snap.data().data;
    }
    return Object.keys(result).length ? result : null;
  } catch (e) { console.error('getCoolroomImages error:', e); return null; }
}

export async function setCoolroomImage(batch, key, b64) {
  try {
    const ref = doc(db, 'coolroomImages', `${batch}_${key}`);
    if (b64) {
      await setDoc(ref, { data: b64, batch, key, updatedAt: new Date().toISOString() });
    } else {
      await deleteDoc(ref);
    }
    return true;
  } catch (e) { console.error('setCoolroomImage error:', e); throw e; }
}

// --- Push Notification Subscriptions ---

export async function savePushToken(userId, token) {
  try {
    await setDoc(doc(db, 'pushTokens', userId), { token, userId, createdAt: new Date().toISOString() });
    return true;
  } catch (e) { console.error('savePushToken error:', e); return false; }
}
