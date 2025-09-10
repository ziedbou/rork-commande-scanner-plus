import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ScanHistoryItem {
  orderId: string;
  orderData: any;
  imageUrl?: string;
  scannedAt: string;
}

interface AppStore {
  token: string | null;
  baseUrl: string;
  scanHistory: ScanHistoryItem[];
  
  setToken: (token: string) => void;
  setBaseUrl: (url: string) => void;
  addToHistory: (item: ScanHistoryItem) => void;
  clearHistory: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  token: null,
  baseUrl: 'https://api.tiktak.space',
  scanHistory: [],

  setToken: async (token: string) => {
    set({ token });
    await AsyncStorage.setItem('api_token', token);
  },

  setBaseUrl: async (url: string) => {
    set({ baseUrl: url });
    await AsyncStorage.setItem('base_url', url);
  },

  addToHistory: async (item: ScanHistoryItem) => {
    const newHistory = [item, ...get().scanHistory];
    set({ scanHistory: newHistory });
    await AsyncStorage.setItem('scan_history', JSON.stringify(newHistory));
  },

  clearHistory: async () => {
    set({ scanHistory: [] });
    await AsyncStorage.removeItem('scan_history');
  },

  loadFromStorage: async () => {
    try {
      const [token, baseUrl, history] = await Promise.all([
        AsyncStorage.getItem('api_token'),
        AsyncStorage.getItem('base_url'),
        AsyncStorage.getItem('scan_history'),
      ]);

      set({
        token,
        baseUrl: baseUrl || 'https://api.tiktak.space',
        scanHistory: history ? JSON.parse(history) : [],
      });
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  },
}));