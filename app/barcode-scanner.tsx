import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, Flashlight, FlashlightOff } from 'lucide-react-native';
import { searchOrders } from '@/services/api';
import { useAuth } from '@/store/auth-store';

// Mock barcode scanner for web compatibility
const MockBarcodeScanner = ({ onBarcodeScanned }: { onBarcodeScanned: (data: string) => void }) => {
  return (
    <View style={styles.mockScanner}>
      <Text style={styles.mockText}>Scanner de code-barres</Text>
      <Text style={styles.mockSubtext}>
        Scanner non disponible sur web. Utilisez la saisie manuelle.
      </Text>
      <TouchableOpacity
        style={styles.mockButton}
        onPress={() => onBarcodeScanned('TEST123')}
      >
        <Text style={styles.mockButtonText}>Simuler un scan (TEST123)</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function BarcodeScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const { token, baseUrl } = useAuth();

  console.log('Scanner - Permission status:', permission?.granted);
  console.log('Scanner - Platform:', Platform.OS);

  // Demander automatiquement les permissions au chargement
  React.useEffect(() => {
    if (Platform.OS !== 'web' && permission !== null && !permission.granted) {
      console.log('Demande automatique des permissions caméra');
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    
    console.log('Code scanné:', data);
    setScanned(true);
    
    // Délai de 2 secondes pour éviter les doubles détections
    setTimeout(() => setScanned(false), 2000);
    
    try {
      const orders = await searchOrders(data, token!, baseUrl);
      
      if (orders.length === 0) {
        Alert.alert(
          'Aucun résultat',
          'Aucune commande trouvée. Vérifiez le code ou réessayez.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                console.log('Retour au scanner après échec de recherche');
                // Permettre un nouveau scan après 1 seconde
                setTimeout(() => setScanned(false), 1000);
              }
            }
          ]
        );
      } else if (orders.length === 1) {
        router.replace({
          pathname: '/order-details',
          params: { orderId: orders[0].id, orderData: JSON.stringify(orders[0]) }
        });
      } else {
        router.replace({
          pathname: '/order-selection',
          params: { orders: JSON.stringify(orders) }
        });
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.message || 'Erreur lors de la recherche',
        [
          { 
            text: 'OK', 
            onPress: () => {
              console.log('Retour au scanner après erreur');
              // Permettre un nouveau scan après 1 seconde
              setTimeout(() => setScanned(false), 1000);
            }
          }
        ]
      );
    }
  };

  // Gestion des permissions pour web et mobile
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Scanner',
            headerShown: true,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.scannerContainer}>
          <MockBarcodeScanner onBarcodeScanned={(data) => handleBarCodeScanned({ data })} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Scanner',
            headerShown: true,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            ),
          }}
        />
        <Text style={styles.permissionText}>Demande d&apos;autorisation caméra...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Scanner',
            headerShown: true,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Nous avons besoin d&apos;accéder à votre caméra pour scanner les codes-barres.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Autoriser l&apos;accès</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Scanner',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.camera}
          facing={'back' as CameraType}
          enableTorch={flashOn}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417', 'aztec', 'ean13', 'ean8', 'upc_e', 'datamatrix', 'code128', 'code39', 'code93', 'codabar', 'itf14', 'upc_a'],
          }}
        />
        
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.flashButton}
            onPress={() => setFlashOn(!flashOn)}
          >
            {flashOn ? (
              <FlashlightOff size={24} color="white" />
            ) : (
              <Flashlight size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Centrez le code-barres dans le cadre
          </Text>
          {scanned && (
            <Text style={styles.scannedText}>
              Code détecté ! Recherche en cours...
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mockScanner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  mockText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  mockSubtext: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 40,
  },
  mockButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  mockButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  controls: {
    position: 'absolute',
    bottom: 100,
    right: 30,
  },
  flashButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 30,
    padding: 15,
  },
  instructions: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scannedText: {
    color: '#10b981',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
    lineHeight: 24,
  },
});