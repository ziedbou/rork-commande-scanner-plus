import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Package, User, Calendar, ArrowLeft } from 'lucide-react-native';

export default function OrderSelectionScreen() {
  const { orders } = useLocalSearchParams();
  const orderList = orders ? JSON.parse(orders as string) : [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifié';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => router.replace({
        pathname: '/order-details',
        params: { orderId: item.id, orderData: JSON.stringify(item) }
      })}
    >
      <View style={styles.orderHeader}>
        <Package size={24} color="#2563eb" />
        <View style={styles.orderInfo}>
          <Text style={styles.orderReference}>
            {item.reference || `Commande ${item.id}`}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <User size={16} color="#64748b" />
          <Text style={styles.detailText}>{item.customer_name || 'Client non spécifié'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Calendar size={16} color="#64748b" />
          <Text style={styles.detailText}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Sélectionner une commande',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Plusieurs commandes trouvées</Text>
          <Text style={styles.subtitle}>
            Sélectionnez la commande que vous souhaitez traiter
          </Text>
        </View>

        <FlatList
          data={orderList}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 22,
  },
  list: {
    gap: 12,
  },
  orderItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orderReference: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
  },
});