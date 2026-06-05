import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { ServiceCard } from '../../components/serviceCard';
import { DiscountCard } from '../../components/discountCard';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/index.styles';
import { useAuth } from '@/src/context/AuthContext';

export default function HomeScreen() {
  const [isPressed, setIsPressed] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("your location");
  const [userLocation, setUserLocation] = useState({
    latitude: 9.0300,
    longitude: 38.7400,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const router = useRouter();
  const { isLoggedIn } = useAuth(); 

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setUserLocation(coords);

      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const addr = geocode[0];
        setCurrentAddress(`${addr.name || addr.street || 'Selected Location'}`);
      }
      
      setMapVisible(true);
    } catch (error) {
      console.log("Location error:", error);
      Alert.alert("Error", "Could not fetch your location.");
    } finally {
      setLocationLoading(false);
    }
  };

  const quickActionRoutes = {
    Package: '/package',
    Courier: '/courier',
    Carpool: '/carpool',
    Grocery: '/grocery',
  } as const;

  const handleQuickAction = (service: keyof typeof quickActionRoutes) => {
    router.push(quickActionRoutes[service]);
  };

  const handleSavedPlace = (place: string) => {
    Alert.alert("Saved Place", `${place} address has been set successfully.`);
  };
  const handleLoginPress = () => {
    if (isLoggedIn) {
      Alert.alert(
        "Already Logged In",
        "You are already logged in.\nGo to Profile to manage your account.",
        [{ text: "OK" }]
      );
    } else {
      router.push('/login');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>lake7</Text>
          <TouchableOpacity 
            style={styles.locationContainer}
            onPress={getCurrentLocation}
            activeOpacity={0.7}
            disabled={locationLoading}
          >
            <Ionicons name="location-sharp" size={14} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.locationText}>
              {locationLoading ? "locating..." : currentAddress}
            </Text>
            {locationLoading ? (
              <ActivityIndicator size="small" color="#64748B" style={{ marginLeft: 4 }} />
            ) : (
              <Ionicons name="chevron-down" size={14} color="#64748B" style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.headerActions}>
          {/* Login Button */}
          <TouchableOpacity
            style={{ 
              ...styles.loginButton, 
              backgroundColor: isPressed ? '#1E40AF' : 'white',
              borderColor: isPressed ? '#1E40AF' : '#E2E8F0'
            }}
            activeOpacity={0.8}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            onPress={handleLoginPress}
          >
            <Text style={{ 
              ...styles.loginText, 
              color: isPressed ? 'white' : '#1E40AF' 
            }}>
              login
            </Text>
          </TouchableOpacity>

          {/* Notification Icon */}
          <TouchableOpacity style={styles.iconContainer}>
            <Ionicons 
              name="notifications-outline" 
              size={24} 
              color="#1E293B" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={styles.quickActionItem} onPress={() => handleQuickAction("Package")}>
          <View style={styles.quickActionIconContainer}>
            <Ionicons name="cube-outline" size={24} color="#1E40AF" />
          </View>
          <Text style={styles.quickActionText}>Package</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem} onPress={() => handleQuickAction("Courier")}>
          <View style={styles.quickActionIconContainer}>
            <Ionicons name="bicycle-outline" size={24} color="#1E40AF" />
          </View>
          <Text style={styles.quickActionText}>Courier</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem} onPress={() => handleQuickAction("Carpool")}>
          <View style={styles.quickActionIconContainer}>
            <Ionicons name="car-outline" size={24} color="#1E40AF" />
          </View>
          <Text style={styles.quickActionText}>Carpool</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem} onPress={() => handleQuickAction("Grocery")}>
          <View style={styles.quickActionIconContainer}>
            <Ionicons name="cart-outline" size={24} color="#1E40AF" />
          </View>
          <Text style={styles.quickActionText}>Grocery</Text>
        </TouchableOpacity>
      </View>

      {/* Choose your service */}
      <Text style={styles.sectionTitle}>Choose your service</Text>

      <View style={styles.servicesContainer}>
        <ServiceCard
          title="RIDE"
          subtitle="Fast & Reliable"
          image={require('../../assets/images/car.png')}
          onPress={() => router.push('/ride')}
        />

        <ServiceCard
          title="DELIVERY"
          subtitle="Food & More"
          image={require('../../assets/images/food.png')}
          onPress={() => router.push('../restaurants')}
        />
      </View>

      {/* Discounts Section */}
      <Text style={styles.sectionTitle}>Featured Offers</Text>
      <DiscountCard />

      {/* Saved Places Section to fill space */}
      <Text style={styles.sectionTitle}>Saved Places</Text>
      <View style={{ paddingHorizontal: 20, marginBottom: 30, gap: 12 }}>
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 16 }}
          onPress={() => handleSavedPlace("Home")}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
            <Ionicons name="home-outline" size={20} color="#1E40AF" />
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B' }}>Home</Text>
            <Text style={{ fontSize: 14, color: '#64748B' }}>Add home address</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 16 }}
          onPress={() => handleSavedPlace("Work")}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
            <Ionicons name="briefcase-outline" size={20} color="#1E40AF" />
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B' }}>Work</Text>
            <Text style={{ fontSize: 14, color: '#64748B' }}>Add work address</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Map Modal */}
      <Modal
        visible={mapVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMapVisible(false)}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalContent}>
            <View style={styles.mapModalHeader}>
              <Text style={styles.mapModalTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setMapVisible(false)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={userLocation}
              >
                <Marker coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }} />
              </MapView>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
