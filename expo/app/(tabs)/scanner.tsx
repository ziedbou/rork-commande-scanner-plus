import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScanLine, Search, Package } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { searchOrders } from '@/services/api';

export default function ScannerScreen() {
  const [manualCode, setManualCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { token, baseUrl } = useAuth();

  const handleSearch = async (code: string) => {
    if (!code.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un code de commande');
      return;
    }

    if (!token) {
      Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
      return;
    }

    setIsSearching(true);
    try {
      const orders = await searchOrders(code, token, baseUrl);
      
      if (orders.length === 0) {
        Alert.alert('Aucun résultat', 'Aucune commande trouvée. Vérifiez le code ou réessayez.');
      } else if (orders.length === 1) {
        router.push({
          pathname: '/order-details',
          params: { orderId: orders[0].id, orderData: JSON.stringify(orders[0]) }
        });
      } else {
        router.push({
          pathname: '/order-selection',
          params: { orders: JSON.stringify(orders) }
        });
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la recherche');
    } finally {
      setIsSearching(false);
    }
  };

  const openBarcodeScanner = () => {
    if (!token) {
      Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
      return;
    }
    router.push('/barcode-scanner');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Package size={48} color="#2563eb" />
          <Text style={styles.title}>Scanner de Commandes</Text>
          <Text style={styles.subtitle}>
            Scannez ou saisissez un code de commande pour commencer
          </Text>
        </View>

        <View style={styles.scanSection}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={openBarcodeScanner}
            disabled={!token}
          >
            <ScanLine size={32} color="white" />
            <Text style={styles.scanButtonText}>Scanner un code-barres</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.manualSection}>
            <Text style={styles.manualLabel}>Saisie manuelle</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Numéro de commande"
                value={manualCode}
                onChangeText={setManualCode}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.searchButton, (!manualCode.trim() || !token) && styles.searchButtonDisabled]}
                onPress={() => handleSearch(manualCode)}
                disabled={!manualCode.trim() || !token || isSearching}
              >
                {isSearching ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Search size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
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
  scanSection: {
    marginBottom: 30,
  },
  scanButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  manualSection: {
    gap: 12,
  },
  manualLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 56,
  },
  searchButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  warningText: {
    color: '#92400e',
    fontSize: 14,
    lineHeight: 20,
  },
});