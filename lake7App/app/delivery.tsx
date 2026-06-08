// app/delivery.tsx
import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getToken } from '../src/utils/auth';
import { styles } from '@/styles/delivery.styles';
import { placeOrder, OrderPayload } from '../services/orderService';

const API_BASE_URL = 'http://10.255.49.59:5260';

export default function DeliveryScreen() {
  const [showPanel, setShowPanel] = useState(false);

  const [restaurant, setRestaurant] = useState("");
  const [destination, setDestination] = useState("Getting current location...");

  const [restaurantSuggestions, setRestaurantSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);

  const [loadingRestaurant, setLoadingRestaurant] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  // Default destination = current location
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required.');
          setDestination("Current Location");
          setLocationLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        let address = "Current Location";
        if (geocode && geocode.length > 0) {
          address = `${geocode[0].name || ''} ${geocode[0].street || ''}, ${geocode[0].city || 'Addis Ababa'}`.trim();
        }

        setDestination(address);
      } catch (error) {
        console.error('Location error:', error);
        setDestination("Current Location");
      } finally {
        setLocationLoading(false);
      }
    };

    getCurrentLocation();
  }, []);

  // Fetch suggestions from backend (Nominatim proxy)
  const fetchSuggestions = async (text: string, type: 'restaurant' | 'destination') => {
    if (text.length < 3) {
      if (type === 'restaurant') setRestaurantSuggestions([]);
      else setDestinationSuggestions([]);
      return;
    }

    const setLoading = type === 'restaurant' ? setLoadingRestaurant : setLoadingDestination;
    const setSuggestions = type === 'restaurant' ? setRestaurantSuggestions : setDestinationSuggestions;

    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/places/autocomplete`, {
        params: { input: text },
      });

      if (response.data.predictions) {
        setSuggestions(
          response.data.predictions.map((p: any) => ({
            description: p.display_name,
            lat: p.lat,
            lon: p.lon,
          }))
        );
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const selectPlace = (place: any, type: 'restaurant' | 'destination') => {
    if (type === 'restaurant') {
      setRestaurant(place.description);
      setRestaurantSuggestions([]);
    } else {
      setDestination(place.description);
      setDestinationSuggestions([]);
    }
  };

  const confirmDelivery = async () => {
    if (!restaurant || !destination) {
      Alert.alert("Missing Info", "Please select both restaurant and destination");
      return;
    }

    setConfirmLoading(true);

    try {
      const payload: OrderPayload = {
        senderName: restaurant, // Restaurant is the sender
        senderPhone: "0911000000", // Placeholder
        receiverName: "User", // Placeholder or get from context
        receiverPhone: "0911000001", // Placeholder
        pickupAddress: restaurant,
        dropoffAddress: destination,
        pickupLatitude: 9.03, // Addis Ababa default
        pickupLongitude: 38.74,
        dropoffLatitude: 9.03,
        dropoffLongitude: 38.74,
        itemDescription: "Food Order",
        estimatedWeight: 1,
        estimatedPrice: 150,
        paymentMethod: "Cash",
        paymentAmount: 150,
      };

      await placeOrder(payload);

      Alert.alert("Success!", "Your food delivery request has been sent successfully!");
      setShowPanel(false);

    } catch (error: any) {

      console.error(error);
      if (error.response?.status === 401) {
        Alert.alert("Session Expired", "Please login again");
      } else {
        Alert.alert("Failed", "Could not request delivery. Please try again.");
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/food.png')}
        style={styles.headerImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.title}>Order Food Delivery</Text>

        <TouchableOpacity style={styles.locationBox} onPress={() => setShowPanel(true)}>
          <Ionicons name="restaurant" size={24} color="#2563eb" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.label}>Restaurant</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {restaurant || "Choose restaurant"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.destinationBox} onPress={() => setShowPanel(true)}>
          <Ionicons name="location" size={24} color="#6b7280" />
          <Text style={styles.destinationPlaceholder} numberOfLines={1}>
            {locationLoading ? "Getting location..." : destination}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Panel */}
      {showPanel && (
        <>
          <TouchableOpacity style={styles.overlay} onPress={() => setShowPanel(false)} />

          <View style={styles.panel}>
            <View style={styles.dragHandle} />

            <Text style={styles.panelTitle}>Set Delivery Details</Text>

            {/* Restaurant */}
            <Text style={styles.inputLabel}>Restaurant</Text>
            <View style={styles.searchContainer}>
              <Ionicons name="restaurant" size={20} color="#2563eb" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search restaurant"
                value={restaurant}
                onChangeText={(text) => {
                  setRestaurant(text);
                  fetchSuggestions(text, 'restaurant');
                }}
              />
              {loadingRestaurant && <ActivityIndicator size="small" color="#2563eb" />}
            </View>

            {restaurantSuggestions.length > 0 && (
              <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
                {restaurantSuggestions.map((place, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => selectPlace(place, 'restaurant')}
                  >
                    <Ionicons name="restaurant-outline" size={20} color="#64748b" />
                    <Text style={styles.suggestionText} numberOfLines={2}>
                      {place.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Destination */}
            <Text style={styles.inputLabel}>Delivery Location</Text>
            <View style={styles.searchContainer}>
              <Ionicons name="location" size={20} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search delivery location"
                value={destination}
                onChangeText={(text) => {
                  setDestination(text);
                  fetchSuggestions(text, 'destination');
                }}
              />
              {loadingDestination && <ActivityIndicator size="small" color="#2563eb" />}
            </View>

            {destinationSuggestions.length > 0 && (
              <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
                {destinationSuggestions.map((place, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => selectPlace(place, 'destination')}
                  >
                    <Ionicons name="location-outline" size={20} color="#64748b" />
                    <Text style={styles.suggestionText} numberOfLines={2}>
                      {place.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity 
              style={[styles.confirmButton, confirmLoading && { opacity: 0.7 }]} 
              onPress={confirmDelivery}
              disabled={confirmLoading}
            >
              {confirmLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Restaurant</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
