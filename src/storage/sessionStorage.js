import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "FOCUS_SESSIONS";

export async function loadSessionsFromStorage() {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.warn("loadSessions error", e);
    return [];
  }
}

export async function saveSessionsToStorage(sessions) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(sessions));
  } catch (e) {
    console.warn("saveSessions error", e);
  }
}
