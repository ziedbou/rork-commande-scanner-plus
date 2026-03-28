import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Save, LogOut, User, Globe } from 'lucide-react-native';
import { useAuth } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { user, selectedCompany, baseUrl, logout, updateBaseUrl } = useAuth();
  const { clearHistory } = useAppStore();
  const [urlInput, setUrlInput] = useState(baseUrl);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveUrl = async () => {
    const newUrl = urlInput.trim() || 'http://api.tiktak.space';
    await updateBaseUrl(newUrl);
    Alert.alert('Succès', 'URL de base mise à jour');
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer l\'historique ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            clearHistory();
            Alert.alert('Succès', 'Historique supprimé');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            await logout();
            router.replace('/login-email');
            setIsLoading(false);
          },
        },
      ]
    );
  };

  const getLogoUrl = (logoPath: string) => {
    if (logoPath?.startsWith('http')) {
      return logoPath;
    }
    return `${baseUrl}/${logoPath}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Settings size={48} color="#2563eb" />
          <Text style={styles.title}>Paramètres</Text>
          <Text style={styles.subtitle}>
            Gérez votre compte et vos préférences
          </Text>
        </View>

        {/* Profil utilisateur */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil</Text>
          
          <View style={styles.profileCard}>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: getLogoUrl(selectedCompany?.company__logo || '') }}
                style={styles.logo}
                defaultSource={require('@/assets/images/icon.png')}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user?.email
                }
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.companyName}>{selectedCompany?.company__name}</Text>
            </View>
          </View>
        </View>

        {/* Configuration API */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration API</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de base</Text>
            <TextInput
              style={styles.input}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="http://api.tiktak.space"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveUrl}>
            <Globe size={20} color="white" />
            <Text style={styles.saveButtonText}>Mettre à jour l'URL</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleClearHistory}>
            <Settings size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Supprimer l'historique</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            disabled={isLoading}
          >
            <LogOut size={20} color="#dc2626" />
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logo: {
    width: 45,
    height: 45,
    borderRadius: 8,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500' as const,
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500' as const,
  },
  logoutButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

});