import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Camera, Package, User, Calendar, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { useAppStore } from '@/store/app-store';
import { uploadScan } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';

export default function OrderDetailsScreen() {
  const { orderId, orderData } = useLocalSearchParams();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { token, baseUrl, addToHistory } = useAppStore();

  const order = orderData ? JSON.parse(orderData as string) : null;

  const takePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'L\'accès à la caméra est nécessaire pour prendre une photo');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo');
    }
  };

  const handleUpload = async (imageUri: string) => {
    if (!token) {
      Alert.alert('Erreur', 'Token API non configuré');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadScan(orderId as string, imageUri, token, baseUrl);
      
      setUploadedImage(response.cloudinary.url);
      
      // Add to history
      await addToHistory({
        orderId: orderId as string,
        orderData: order,
        imageUrl: response.cloudinary.url,
        scannedAt: new Date().toISOString(),
      });

      Alert.alert('Succès', 'Scan enregistré avec succès.');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de l\'envoi');
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifié';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'to-pack':
        return '#f59e0b';
      case 'packed':
        return '#059669';
      case 'shipped':
        return '#2563eb';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'to-pack':
        return 'À emballer';
      case 'packed':
        return 'Emballé';
      case 'shipped':
        return 'Expédié';
      default:
        return status || 'Statut inconnu';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Détails de la commande',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Package size={32} color="#2563eb" />
            <View style={styles.orderInfo}>
              <Text style={styles.orderReference}>
                {order?.reference || `Commande ${orderId}`}
              </Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order?.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order?.status) }]}>
                    {getStatusText(order?.status)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <User size={20} color="#64748b" />
              <Text style={styles.detailLabel}>Client:</Text>
              <Text style={styles.detailValue}>{order?.customer_name || 'Non spécifié'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Calendar size={20} color="#64748b" />
              <Text style={styles.detailLabel}>Créée le:</Text>
              <Text style={styles.detailValue}>{formatDate(order?.created_at)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Prendre une photo du colis</Text>
          <Text style={styles.actionSubtitle}>
            Photographiez le colis préparé pour conserver une preuve
          </Text>

          {uploadedImage ? (
            <View style={styles.uploadedContainer}>
              <Image source={{ uri: uploadedImage }} style={styles.uploadedImage} />
              <View style={styles.successContainer}>
                <CheckCircle size={24} color="#059669" />
                <Text style={styles.successText}>Photo envoyée avec succès</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.cameraButton, isUploading && styles.cameraButtonDisabled]}
              onPress={takePicture}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <>
                  <Camera size={32} color="white" />
                  <Text style={styles.cameraButtonText}>Prendre une photo</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {uploadedImage && (
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={takePicture}
            disabled={isUploading}
          >
            <Camera size={20} color="#2563eb" />
            <Text style={styles.retakeButtonText}>Prendre une nouvelle photo</Text>
          </TouchableOpacity>
        )}
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
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderInfo: {
    flex: 1,
    marginLeft: 16,
  },
  orderReference: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    flex: 1,
  },
  actionCard: {
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
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },
  cameraButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  cameraButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  uploadedContainer: {
    alignItems: 'center',
    gap: 16,
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
  },
  retakeButton: {
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
  retakeButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
});