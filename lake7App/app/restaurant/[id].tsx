import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { restaurantService } from '../../services/restaurantService';

export default function RestaurantMenuScreen() {
  const { id } = useLocalSearchParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [restRes, menuRes] = await Promise.all([
        restaurantService.getRestaurantDetails(id as string),
        restaurantService.getMenu(id as string)
      ]);
      setRestaurant(restRes.data);
      setMenu(menuRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const renderMenuItem = ({ item }: { item: any }) => (
    <View style={styles.menuItem}>
      <View style={styles.menuInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.itemPrice}>ETB {item.price}</Text>
      </View>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      )}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View>
          <Image 
            source={{ uri: restaurant?.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80' }} 
            style={styles.banner} 
          />
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Restaurant Info */}
        <View style={styles.infoCard}>
          <Text style={styles.name}>{restaurant?.name}</Text>
          <Text style={styles.category}>{restaurant?.category} • ⭐ 4.5</Text>
          <View style={styles.location}>
            <Ionicons name="location-outline" size={14} color="#64748B" />
            <Text style={styles.address}>{restaurant?.address}</Text>
          </View>
          <Text style={styles.description}>{restaurant?.description}</Text>
        </View>

        {/* Menu List */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu Items</Text>
          {menu.map((item) => (
             <View key={item.id}>
               {renderMenuItem({ item })}
             </View>
          ))}
          {menu.length === 0 && (
            <Text style={styles.emptyText}>No menu items available yet.</Text>
          )}
        </View>
      </ScrollView>
      
      <TouchableOpacity style={styles.cartButton}>
        <Text style={styles.cartButtonText}>View Cart (0)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    width: '100%',
    height: 250,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 5,
  },
  category: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 10,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  address: {
    marginLeft: 5,
    fontSize: 14,
    color: '#64748B',
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  menuSection: {
    padding: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  menuInfo: {
    flex: 1,
    paddingRight: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  addButton: {
    position: 'absolute',
    right: 0,
    bottom: 15,
    backgroundColor: '#1E40AF',
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#1E40AF',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 20,
  }
});
