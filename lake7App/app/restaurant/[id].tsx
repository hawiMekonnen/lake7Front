import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { restaurantService, resolveImageUrl } from '../../services/restaurantService';
import { useCart } from '../../src/context/CartContext';
import { styles } from '@/styles/menu.styles';

export default function RestaurantMenuScreen() {
  const { id } = useLocalSearchParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const router = useRouter();
  const { addToCart, getCartCount } = useCart();

  const categories = ['All', 'Main Course', 'Drinks', 'Desserts', 'Appetizers'];

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
      {item.imageUrl ? (
        <Image source={{ uri: resolveImageUrl(item.imageUrl) }} style={styles.itemImage} />
      ) : null}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => addToCart(item, restaurant)}
      >
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

  const cartCount = getCartCount();

  const filteredMenu = menu.filter(item => {
    if (selectedCategory === 'All') return true;
    const itemCat = item.category?.toLowerCase().replace(/\s/g, '');
    const selCat = selectedCategory.toLowerCase().replace(/\s/g, '');
    return itemCat?.includes(selCat) || selCat?.includes(itemCat);
  });

  return (
    <View style={styles.container}>
      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View>
          <Image 
            source={{ uri: resolveImageUrl(restaurant?.imageUrl) || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80' }} 
            style={styles.banner} 
          />
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          {/* Logo overlay */}
          {restaurant?.logoUrl ? (
            <View style={{
              position: 'absolute',
              bottom: -28,
              left: 20,
              width: 56,
              height: 56,
              borderRadius: 28,
              overflow: 'hidden',
              borderWidth: 3,
              borderColor: 'white',
              backgroundColor: '#F1F5F9',
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
            }}>
              <Image source={{ uri: resolveImageUrl(restaurant.logoUrl) }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </View>
          ) : null}
        </View>

        {/* Restaurant Info */}
        <View style={[styles.infoCard, restaurant?.logoUrl ? { paddingTop: 36 } : {}]}>
          <Text style={styles.name}>{restaurant?.name}</Text>
          <Text style={styles.category}>{restaurant?.category} • ⭐ 4.5</Text>
          <View style={styles.location}>
            <Ionicons name="location-outline" size={14} color="#64748B" />
            <Text style={styles.address}>{restaurant?.address}</Text>
          </View>
          <Text style={styles.description}>{restaurant?.description}</Text>
        </View>

        {/* Category Tabs */}
        <View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.tabsContainer}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.tabButton,
                  selectedCategory === cat && styles.activeTabButton
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text 
                  style={[
                    styles.tabText,
                    selectedCategory === cat && styles.activeTabText
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu List */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu Items</Text>
          {filteredMenu.map((item) => (
             <View key={item.id}>
               {renderMenuItem({ item })}
             </View>
          ))}
          {filteredMenu.length === 0 && (
            <Text style={styles.emptyText}>No menu items in this category.</Text>
          )}
        </View>
      </ScrollView>
      
      {cartCount > 0 && (
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => router.push('/checkout' as any)}
        >
          <Text style={styles.cartButtonText}>View Cart ({cartCount})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
