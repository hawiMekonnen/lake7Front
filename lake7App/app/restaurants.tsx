import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput,
  FlatList,
  Dimensions,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { restaurantService } from '../services/restaurantService';
import { styles } from '@/styles/restaurant.styles';

const { width } = Dimensions.get('window');

export default function RestaurantsScreen() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await restaurantService.getRestaurants();
      setRestaurants(res.data);
    } catch (error) {
      console.error("Failed to fetch restaurants", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: '1', name: 'Fasting Specials', icon: 'leaf-outline', color: '#E0F2FE' },
    { id: '3', name: 'Breakfast For You', icon: 'cafe-outline', color: '#D1FAE5' },
    { id: '4', name: 'Burger', icon: 'fast-food-outline', color: '#FEE2E2' },
    { id: '5', name: 'Desserts', icon: 'ice-cream-outline', color: '#F3E8FF' },
  ];

  const specialOffers = [
    {
      id: '1',
      title: 'Fish Sandwich',
      restaurantName: 'Bella Ciao Chicken',
      price: '451.5 Br',
      originalPrice: '645.0 Br',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      discount: '30.0% OFF'
    },
    {
      id: '2',
      title: 'Vegetable Wrap',
      restaurantName: 'Bella Ciao Chicken',
      price: '323.4 Br',
      originalPrice: '462.0 Br',
      image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=800&q=80',
      discount: '30.0% OFF'
    },
    {
      id: '3',
      title: 'Cheese patty',
      restaurantName: 'Bella Ciao Chicken',
      price: '515.9 Br',
      originalPrice: '737.0 Br',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      discount: '30.0% OFF'
    }
  ];

  const mockRestaurants = [
    {
      id: 'mock-1',
      name: 'Bella Ciao Chicken',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      category: 'Burger & Chicken',
      rating: '4.0',
      distance: '1.3KM',
      time: '46 min',
      avgPrice: 'Avg 857 Br per person',
      deliveryFee: 'Delivery Fee starting from 59 Br'
    },
    {
      id: 'mock-2',
      name: 'Cade Burger',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      category: 'Gourmet Burgers',
      rating: '5.0',
      distance: '1.3KM',
      time: '46 min',
      avgPrice: 'Avg 854 Br per person',
      deliveryFee: 'Delivery Fee starting from 59 Br'
    },
    {
      id: 'mock-3',
      name: 'Tutu Noodles | Friendship',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
      category: 'Asian, Noodles',
      rating: '4.0',
      distance: '1KM',
      time: '43 min',
      avgPrice: 'Avg 881 Br per person',
      deliveryFee: 'Delivery Fee starting from 47 Br'
    },
    {
      id: 'mock-4',
      name: 'GANGNAM Korean Restaurant',
      imageUrl: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80',
      category: 'Korean Food',
      rating: '5.0',
      distance: '2.5KM',
      time: '52 min',
      avgPrice: 'Avg 950 Br per person',
      deliveryFee: 'Delivery Fee starting from 75 Br'
    }
  ];

  // Combined real & mock lists
  const displayRestaurants = restaurants.length > 0 
    ? restaurants.map(r => ({
        id: r.id,
        name: r.name,
        imageUrl: r.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        category: r.category || 'Restaurant',
        rating: '4.5',
        distance: '1.2KM',
        time: '25 min',
        avgPrice: 'Avg 600 Br per person',
        deliveryFee: 'Delivery Fee starting from 49 Br'
      }))
    : mockRestaurants;

  const filteredRestaurants = displayRestaurants.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Top Header Row with Back Button and Search Bar Inline */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, paddingVertical: 4 }}>
          <Ionicons name="chevron-back" size={28} color="#004AAD" />
        </TouchableOpacity>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20 }}>
          <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
          <TextInput
            style={{ flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '600', padding: 0 }}
            placeholder="Search your taste"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Banners Slider */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={[styles.bannersSlider, { marginTop: 15 }]}
        >
          <View style={[styles.bannerCard, { backgroundColor: '#004AAD' }]}>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>EPIC BURGER & PIZZA</Text>
              <View style={styles.bannerBadgeContainer}>
                <Text style={styles.bannerBadgeText}>30.0% OFF</Text>
              </View>
            </View>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80' }} 
              style={styles.bannerImage} 
            />
          </View>

          <View style={[styles.bannerCard, { backgroundColor: '#2563EB' }]}>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerBrand}>Fasting Specials</Text>
              <Text style={styles.bannerTitle}>Healthy & Delicious</Text>
              <View style={styles.bannerBadgeContainer}>
                <Text style={styles.bannerBadgeText}>FREE DELIVERY</Text>
              </View>
            </View>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=300&q=80' }} 
              style={styles.bannerImage} 
            />
          </View>
        </ScrollView>

        {/* Promo Dot Indicator */}
        <View style={styles.dotContainer}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Categories Grid (Horizontal Scroll) */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriesRow}
        >
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryItem}>
              <View style={[styles.categoryCircle, { backgroundColor: cat.color }]}>
                <Ionicons name={cat.icon as any} size={26} color="#004AAD" />
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Special Offers Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Special Offers</Text>
          <TouchableOpacity style={styles.filterOutlineBtn}>
            <Text style={styles.filterBtnText}>Filter</Text>
            <Ionicons name="funnel-outline" size={14} color="#004AAD" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={specialOffers}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.specialOffersRow}
          renderItem={({ item }) => (
            <View style={styles.specialCard}>
              <Image source={{ uri: item.image }} style={styles.specialImg} />
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{item.discount}</Text>
              </View>
              <View style={styles.specialInfo}>
                <Text style={styles.specialTitle}>{item.title}</Text>
                <Text style={styles.specialRest}>{item.restaurantName}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.specialPrice}>{item.price}</Text>
                  <Text style={styles.specialOriginal}>{item.originalPrice}</Text>
                </View>
              </View>
            </View>
          )}
        />

        {/* Nearby Restaurants Section */}
        <View style={[styles.sectionHeaderRow, { marginTop: 15 }]}>
          <Text style={styles.sectionHeading}>Available Restaurants</Text>
          <TouchableOpacity style={styles.filterOutlineBtn}>
            <Text style={styles.filterBtnText}>Filter</Text>
            <Ionicons name="funnel-outline" size={14} color="#004AAD" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.restaurantVerticalList}>
          {filteredRestaurants.map((rest) => (
            <TouchableOpacity 
              key={rest.id} 
              style={styles.restRowCard}
              onPress={() => {
                if (!rest.id.startsWith('mock-')) {
                  router.push({ pathname: '/restaurant/[id]' as any, params: { id: rest.id } });
                } else {
                  Alert.alert(rest.name, "Opening menu in app...");
                }
              }}
            >
              <Image source={{ uri: rest.imageUrl }} style={styles.restLogoImg} />
              <View style={styles.restRowInfo}>
                <View style={styles.restRowHeader}>
                  <Text style={styles.restRowName} numberOfLines={1}>{rest.name}</Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.ratingLabel}>{rest.rating}</Text>
                  </View>
                </View>

                {/* Metadata Pills */}
                <View style={styles.pillsRow}>
                  <View style={styles.pillBox}>
                    <Text style={styles.pillLabel}>Around {rest.distance}</Text>
                  </View>
                  <View style={styles.pillBox}>
                    <Text style={styles.pillLabel}>Around {rest.time}</Text>
                  </View>
                </View>

                <Text style={styles.restPriceDetails}>{rest.avgPrice}</Text>
                <Text style={styles.restPriceDetails}>{rest.deliveryFee}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Visual Padding */}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}
