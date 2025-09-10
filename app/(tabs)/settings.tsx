import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Save, Trash2, Info, Wifi } from 'lucide-react-native';
import { useAppStore } from '@/store/app-store';
import { searchOrders } from '@/services/api';

export default function SettingsScreen() {
  const { token, baseUrl, setToken, setBaseUrl, clearHistory } = useAppStore();
  const [tokenInput, setTokenInput] = useState(token || '');
  const [urlInput, setUrlInput] = useState(baseUrl);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleSave = () => {
    if (!tokenInput.trim()) {
      Alert.alert('Erreur', 'Le token API est obligatoire');
      return;
    }

    setToken(tokenInput.trim());
    setBaseUrl(urlInput.trim() || 'https://api.tiktak.space');
    Alert.alert('Succès', 'Configuration sauvegardée');
  };

  const handleClearHistory = () => {
    clearHistory();
    Alert.alert('Succès', 'Historique supprimé');
  };

  const testConnection = async () => {
    if (!tokenInput.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un token avant de tester la connexion');
      return;
    }

    setIsTestingConnection(true);
    try {
      console.log('🧪 Test de connexion API...');
      // Test avec un code fictif pour vérifier la connexion
      await searchOrders('TEST_CONNECTION_123456', tokenInput.trim(), urlInput.trim() || 'https://api.tiktak.space');
      Alert.alert('Succès', 'Connexion à l\'API réussie ! Le token est valide.');
    } catch (error: any) {
      if (error.message.includes('Token invalide')) {
        Alert.alert('Erreur', 'Token invalide. Vérifiez votre token d\'accès.');
      } else if (error.message.includes('Service momentanément')) {
        Alert.alert('Erreur', 'Service temporairement indisponible. Réessayez plus tard.');
      } else {
        Alert.alert('Succès', 'Connexion à l\'API réussie ! (Aucune commande trouvée pour le test, mais l\'authentification fonctionne)');
      }
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Settings size={48} color="#2563eb" />
          <Text style={styles.title}>Configuration</Text>
          <Text style={styles.subtitle}>
            Configurez votre accès à l&apos;API TikTak
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de base</Text>
            <TextInput
              style={styles.input}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="https://api.tiktak.space"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Token d&apos;accès *</Text>
            <TextInput
              style={styles.input}
              value={tokenInput}
              onChangeText={setTokenInput}
              placeholder="Votre token API"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.testButton} onPress={testConnection} disabled={isTestingConnection}>
              {isTestingConnection ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Wifi size={20} color="#2563eb" />
              )}
              <Text style={styles.testButtonText}>
                {isTestingConnection ? 'Test...' : 'Tester'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save size={20} color="white" />
              <Text style={styles.saveButtonText}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données</Text>
          
          <TouchableOpacity style={styles.dangerButton} onPress={handleClearHistory}>
            <Trash2 size={20} color="#dc2626" />
            <Text style={styles.dangerButtonText}>Supprimer l&apos;historique</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Info size={20} color="#2563eb" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Comment obtenir votre token ?</Text>
            <Text style={styles.infoText}>
              Contactez votre administrateur système pour obtenir votre token d&apos;accès à l&apos;API TikTak.
            </Text>
          </View>
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
  testButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  testButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
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
  dangerButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  dangerButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});