import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { historyStyles as styles } from '../../styles/history.styles';

const HISTORY_DATA = [
  {
    id: '1',
    type: 'ride',
    title: 'Ride to Bole Airport',
    date: 'May 3, 2024 • 10:30 AM',
    price: 'ETB 250.00',
    status: 'Completed',
    icon: 'car-sport-outline'
  },
  {
    id: '2',
    type: 'delivery',
    title: 'Burger House - 2 items',
    date: 'May 2, 2024 • 8:15 PM',
    price: 'ETB 420.00',
    status: 'Completed',
    icon: 'fast-food-outline'
  },
  {
    id: '3',
    type: 'ride',
    title: 'Ride to Piassa',
    date: 'May 1, 2024 • 9:00 AM',
    price: 'ETB 180.00',
    status: 'Canceled',
    icon: 'car-sport-outline'
  },
  {
    id: '4',
    type: 'delivery',
    title: 'Chicken Cottage',
    date: 'Apr 28, 2024 • 1:20 PM',
    price: 'ETB 650.00',
    status: 'Completed',
    icon: 'fast-food-outline'
  },
  {
    id: '5',
    type: 'ride',
    title: 'Ride to Saris',
    date: 'Apr 25, 2024 • 6:45 PM',
    price: 'ETB 310.00',
    status: 'Completed',
    icon: 'car-sport-outline'
  }
];

export default function HistoryPage() {
  const [filter, setFilter] = useState('All');

  const filteredData = filter === 'All' 
    ? HISTORY_DATA 
    : HISTORY_DATA.filter(item => item.type === filter.toLowerCase().slice(0, -1) || item.type === filter.toLowerCase());

  const renderItem = ({ item }: { item: typeof HISTORY_DATA[0] }) => (
    <TouchableOpacity style={styles.historyItem} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon as any} size={24} color="#1E40AF" />
      </View>
      
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
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

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <Ionicons name="receipt-outline" size={64} color="#CBD5E1" />
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#64748B', marginTop: 16 }}>
              No activity yet
            </Text>
            <Text style={{ fontSize: 14, color: '#94A3B8', marginTop: 8 }}>
              Your {filter.toLowerCase()} history will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}
