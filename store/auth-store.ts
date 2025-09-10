import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { getCompaniesByEmail, loginMobile } from '@/services/api';

interface Company {
  company__slug: string;
  company__name: string;
  company__logo: string;
}

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  selectedCompany: Company | null;
  baseUrl: string;
  isLoading: boolean;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
    selectedCompany: null,
    baseUrl: 'https://api.tiktak.space',
    isLoading: true,
  });

  const [rememberedEmail, setRememberedEmail] = useState<string>('');
  const [rememberedSlug, setRememberedSlug] = useState<string>('');

  // Charger les données depuis AsyncStorage au démarrage
  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = async () => {
    try {
      const [token, user, company, baseUrl, email, slug] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('auth_user'),
        AsyncStorage.getItem('auth_company'),
        AsyncStorage.getItem('auth_base_url'),
        AsyncStorage.getItem('remembered_email'),
        AsyncStorage.getItem('remembered_slug'),
      ]);

      const parsedUser = user ? JSON.parse(user) : null;
      const parsedCompany = company ? JSON.parse(company) : null;

      setAuthState({
        isAuthenticated: !!token && !!parsedUser,
        token,
        user: parsedUser,
        selectedCompany: parsedCompany,
        baseUrl: baseUrl || 'https://api.tiktak.space',
        isLoading: false,
      });

      setRememberedEmail(email || '');
      setRememberedSlug(slug || '');
    } catch (error) {
      console.error('Erreur lors du chargement depuis le stockage:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const saveToStorage = async (token: string, user: User, company: Company) => {
    try {
      await Promise.all([
        AsyncStorage.setItem('auth_token', token),
        AsyncStorage.setItem('auth_user', JSON.stringify(user)),
        AsyncStorage.setItem('auth_company', JSON.stringify(company)),
        AsyncStorage.setItem('remembered_email', user.email),
        AsyncStorage.setItem('remembered_slug', company.company__slug),
      ]);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const clearStorage = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('auth_token'),
        AsyncStorage.removeItem('auth_user'),
        AsyncStorage.removeItem('auth_company'),
      ]);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const getCompaniesByEmailAction = async (email: string): Promise<Company[]> => {
    return getCompaniesByEmail(email, authState.baseUrl);
  };

  const login = async (email: string, password: string, company: Company): Promise<void> => {
    const response = await loginMobile(email, password, company.company__slug, authState.baseUrl);
    
    const newAuthState = {
      isAuthenticated: true,
      token: response.token,
      user: response.user,
      selectedCompany: company,
      baseUrl: authState.baseUrl,
      isLoading: false,
    };

    setAuthState(newAuthState);
    await saveToStorage(response.token, response.user, company);
  };

  const logout = async (): Promise<void> => {
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
      selectedCompany: null,
      baseUrl: authState.baseUrl,
      isLoading: false,
    });
    await clearStorage();
  };

  const updateBaseUrl = async (url: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, baseUrl: url }));
    await AsyncStorage.setItem('auth_base_url', url);
  };

  return {
    ...authState,
    rememberedEmail,
    rememberedSlug,
    getCompaniesByEmailAction,
    login,
    logout,
    updateBaseUrl,
  };
});

export type AuthContextType = ReturnType<typeof useAuth>;