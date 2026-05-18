import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { restaurantService } from '../../services/restaurantService';
import { styles } from '@/styles/menu.styles';

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
