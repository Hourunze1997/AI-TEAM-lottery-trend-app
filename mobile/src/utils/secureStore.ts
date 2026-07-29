import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const secureAvailable = !!SecureStore?.getItemAsync;

export function getStorage() {
  if (secureAvailable) {
    return {
      getItem: async (k: string) => {
        try {
          return await SecureStore.getItemAsync(k);
        } catch {
          return null;
        }
      },
      setItem: async (k: string, v: string) => {
        try {
          await SecureStore.setItemAsync(k, v);
        } catch {
          // 降级
          await AsyncStorage.setItem(k, v);
        }
      },
      removeItem: async (k: string) => {
        try {
          await SecureStore.deleteItemAsync(k);
        } catch {
          await AsyncStorage.removeItem(k);
        }
      },
    };
  }
  return {
    getItem: (k: string) => AsyncStorage.getItem(k),
    setItem: (k: string, v: string) => AsyncStorage.setItem(k, v),
    removeItem: (k: string) => AsyncStorage.removeItem(k),
  };
}

export async function setItem(k: string, v: string) {
  return getStorage().setItem(k, v);
}
export async function getItem(k: string): Promise<string | null> {
  return getStorage().getItem(k);
}
