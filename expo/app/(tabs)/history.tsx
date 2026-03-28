import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History, Calendar } from 'lucide-react-native';
import { useAppStore } from '@/store/app-store';
import { router } from 'expo-router';

export default function HistoryScreen() {
  const { scanHistory } = useAppStore();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderHistoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => router.push({
        pathname: '/order-details',
        params: { orderId: item.orderId, orderData: JSON.stringify(item.orderData) }
      })}
    >
      <View style={styles.itemHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderReference}>{item.orderData?.reference || `Commande ${item.orderId}`}</Text>
          <Text style={styles.customerName}>{item.orderData?.customer_name || 'Client'}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Calendar size={16} color="#64748b" />
          <Text style={styles.date}>{formatDate(item.scannedAt)}</Text>
        </View>
      </View>
      
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
      )}
      
      <View style={styles.statusContainer}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Scanné</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (scanHistory.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <History size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Aucun historique</Text>
          <Text style={styles.emptySubtitle}>
            Vos scans de commandes apparaîtront ici
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique des Scans</Text>
        <Text style={styles.subtitle}>{scanHistory.length} scan(s) effectué(s)</Text>
      </View>

      <FlatList
        data={scanHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => `${item.orderId}-${item.scannedAt}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  list: {
    padding: 20,
    paddingTop: 10,
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderReference: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#64748b',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: '#64748b',
  },
  thumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f1f5f9',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});