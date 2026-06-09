import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { historyStyles as styles } from '../../styles/history.styles';
import { getUserOrders } from '../../services/orderService';
import { getUserRides } from '../../services/rideService';
import { getRestaurantName } from '../../src/utils/orderUtils';
import { useRouter } from 'expo-router';

interface HistoryItem {
  id: string;
  type: string;
  title: string;
  date: string;
  rawDate: string; // for sorting
  price: string;
  status: string;
  icon: string;
  originalItem: any;
}


export default function HistoryPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleItemPress = (item: HistoryItem) => {
    if (item.type === 'ride') {
      const status = item.originalItem.status;
      if (status === 'Pending' || status === 'Accepted' || status === 'InProgress') {
        router.push({
          pathname: "/map",
          params: { 
            ride: JSON.stringify(item.originalItem)
          }
        });
      } else {
        router.push({
          // cast pathname to any to satisfy router typings for custom routes
          pathname: "/transaction-detail" as any,
          params: {
            item: JSON.stringify(item)
          }
        });
      }
    } else { // delivery
      const status = item.originalItem.status;
      if (status !== 'Completed' && status !== 'Cancelled' && status !== 'Delivered') {
        router.push({
          pathname: "/order-tracking",
          params: { orderId: item.id }
        });
      } else {
        router.push({
          // cast pathname to any to satisfy router typings for custom routes
          pathname: "/transaction-detail" as any,
          params: {
            item: JSON.stringify(item)
          }
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
      return `${date.toLocaleDateString('en-US', options)} • ${date.toLocaleTimeString('en-US', timeOptions)}`;
    } catch (e) {
      return dateString;
    }
  };

  const parseOrderTitle = (order: any) => {
    if (order.delivery?.itemDescription) {
      try {
        const parsed = JSON.parse(order.delivery.itemDescription);
        if (parsed.items && Array.isArray(parsed.items)) {
          return parsed.items.map((i: any) => `${i.name} (x${i.quantity})`).join(', ');
        }
      } catch (e) {
        return order.delivery.itemDescription;
      }
    }
    return order.delivery?.packageDetails || 'Delivery Order';
  };

  const mapOrderStatus = (status: string) => {
    if (status === 'Completed' || status === 'Delivered') return 'Completed';
    if (status === 'Cancelled') return 'Canceled';
    return status;
  };

  const fetchHistory = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [orders, rides] = await Promise.all([
        getUserOrders().catch((err) => {
          console.error('Error fetching user orders:', err);
          return [];
        }),
        getUserRides().catch((err) => {
          console.error('Error fetching user rides:', err);
          return [];
        }),
      ]);

      const formattedRides: HistoryItem[] = (rides || []).map((ride: any) => ({
        id: ride.id,
        type: 'ride',
        title: `Ride to ${ride.dropoffLocation || 'Destination'}`,
        date: formatDate(ride.requestedAt),
        rawDate: ride.requestedAt,
        price: `ETB ${(ride.fare || 0).toFixed(2)}`,
        status: mapOrderStatus(ride.status),
        icon: 'car-sport-outline',
        originalItem: ride,
      }));

      const formattedOrders: HistoryItem[] = (orders || []).map((order: any) => {
        const restaurantName = getRestaurantName(order);
        const itemsTitle = parseOrderTitle(order);
        return {
        id: order.id,
        type: 'delivery',
        title: restaurantName ? `${restaurantName} · ${itemsTitle}` : itemsTitle,
        date: formatDate(order.createdAt),
        rawDate: order.createdAt,
        price: `ETB ${(order.totalAmount || 0).toFixed(2)}`,
        status: mapOrderStatus(order.status),
        icon: 'fast-food-outline',
        originalItem: order,
      };
      });

      const combined = [...formattedRides, ...formattedOrders].sort(
        (a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
      );

      setHistoryData(combined);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory(false);
  }, []);

  const filteredData = filter === 'All' 
    ? historyData 
    : historyData.filter(item => {
        if (filter === 'Rides') return item.type === 'ride';
        if (filter === 'Food') return item.type === 'delivery';
        return true;
      });

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity style={styles.historyItem} activeOpacity={0.7} onPress={() => handleItemPress(item)}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon as any} size={24} color="#1E40AF" />
      </View>
      
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.itemDate}>{item.date}</Text>
      </View>
      
      <View style={styles.itemRight}>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <View style={[
          styles.statusBadge, 
          item.status === 'Completed' ? styles.completedBadge : styles.canceledBadge
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'Completed' ? styles.completedText : styles.canceledText
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      <View style={styles.filterContainer}>
        {['All', 'Rides', 'Food'].map((item) => (
          <TouchableOpacity 
            key={item}
            style={[styles.filterButton, filter === item && styles.activeFilterButton]}
            onPress={() => setFilter(item)}
          >
            <Text style={[styles.filterText, filter === item && styles.activeFilterText]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1E40AF" />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1E40AF']} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 100 }}>
              <Ionicons name="receipt-outline" size={64} color="#CBD5E1" />
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#64748B', marginTop: 16 }}>
                No activity yet
              </Text>
              <Text style={{ fontSize: 14, color: '#94A3B8', marginTop: 8 }}>
                Your {filter.toLowerCase() === 'all' ? 'activity' : filter.toLowerCase()} history will appear here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
