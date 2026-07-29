import AsyncStorage from '@react-native-async-storage/async-storage';

// 通用 AsyncStorage 封装
export async function saveItem<T>(key: string, value: T): Promise<void> {
  try {
    const json = JSON.stringify(value);
    await AsyncStorage.setItem(key, json);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[saveItem] failed', key, e);
  }
}

export async function loadItem<T>(key: string): Promise<T | null> {
  try {
    const json = await AsyncStorage.getItem(key);
    if (json == null) return null;
    return JSON.parse(json) as T;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[loadItem] failed', key, e);
    return null;
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[removeItem] failed', key, e);
  }
}