import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function GroceryScreen() {
  const router = useRouter();

  const categories = [
    { name: 'Fresh Fruits', icon: 'nutrition-outline', color: '#10B981' },
    { name: 'Vegetables', icon: 'leaf-outline', color: '#84CC16' },
    { name: 'Dairy & Eggs', icon: 'water-outline', color: '#3B82F6' },
    { name: 'Meat & Seafood', icon: 'fish-outline', color: '#EF4444' },
    { name: 'Bakery', icon: 'cafe-outline', color: '#F59E0B' },
    { name: 'Beverages', icon: 'wine-outline', color: '#8B5CF6' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grocery Delivery</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Fresh Groceries</Text>
            <Text style={styles.bannerSubtitle}>Delivered in 30 mins</Text>
          </View>
          <Ionicons name="cart" size={60} color="#fff" style={{ opacity: 0.8 }} />
        </View>

        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <View style={styles.gridContainer}>
          {categories.map((item, index) => (
            <TouchableOpacity key={index} style={styles.categoryCard}>
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={32} color={item.color} />
              </View>
              <Text style={styles.categoryName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.popularButton}>
          <Text style={styles.popularButtonText}>View Popular Items</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  content: {
    padding: 20,
  },
  banner: {
    backgroundColor: '#004AAD',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#E0E7FF',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  popularButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#004AAD',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  popularButtonText: {
    color: '#004AAD',
    fontSize: 16,
    fontWeight: '700',
  },
});
