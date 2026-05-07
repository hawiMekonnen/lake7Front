import React, { useState, useEffect, useCallback } from 'react';
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
import debounce from 'lodash.debounce';
import { getToken } from '../src/utils/auth';
import { styles } from '@/styles/ride.styles';
import { useRouter } from 'expo-router';
import { decode as atob } from 'base-64';

const API_BASE_URL = 'http://192.168.137.218:5260';

export default function RideScreen() {
  const router = useRouter();

  const [showPanel, setShowPanel] = useState(false);

  const [pickup, setPickup] = useState("Getting current location...");
  const [destination, setDestination] = useState("");

  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);

  const [selectedPickup, setSelectedPickup] = useState<any | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);

  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  // 📍 Get current location
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required.');
          setPickup("Current Location");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        let address = "Current Location";
        if (geocode.length > 0) {
          address = `${geocode[0].name || ''} ${geocode[0].street || ''}, ${geocode[0].city || 'Addis Ababa'}`;
        }

        setPickup(address);

        // ✅ Store coordinates
        setSelectedPickup({
          description: address,
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        });

      } catch (error) {
        console.log("Location error:", error);
        setPickup("Current Location");
      } finally {
        setLocationLoading(false);
      }
    };

    getCurrentLocation();
  }, []);

  // 🔍 Fetch suggestions
  const fetchSuggestions = async (text: string, type: 'pickup' | 'destination') => {
    if (text.length < 3) return;

    const setLoading = type === 'pickup' ? setLoadingPickup : setLoadingDestination;
    const setSuggestions = type === 'pickup' ? setPickupSuggestions : setDestinationSuggestions;

    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/places/autocomplete`, {
        params: { input: text },
      });

      const mapped = res.data.predictions.map((p: any) => ({
        description: p.display_name,
        lat: p.lat,
        lon: p.lon,
      }));

      setSuggestions(mapped);
    } catch (err) {
      console.log("Autocomplete error:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Debounce
  const fetchPickupDebounced = useCallback(debounce((text) => {
    fetchSuggestions(text, 'pickup');
  }, 400), []);

  const fetchDestinationDebounced = useCallback(debounce((text) => {
    fetchSuggestions(text, 'destination');
  }, 400), []);

  // ✅ Select place
  const selectPlace = (place: any, type: 'pickup' | 'destination') => {
    if (type === 'pickup') {
      setPickup(place.description);
      setPickupSuggestions([]);
      setSelectedPickup(place);
    } else {
      setDestination(place.description);
      setDestinationSuggestions([]);
      setSelectedDestination(place);
    }
  };

 // 🚗 Confirm Ride
const confirmRide = async () => {
  if (!selectedPickup || !selectedDestination) {
    Alert.alert("Invalid Location", "Please select locations from suggestions");
    return;
  }

  setConfirmLoading(true);

  try {
    const token = await getToken();
    console.log("TOKEN:", token);

    if (!token) {
      Alert.alert("Not Logged In", "Please login first");
      return;
    }

    // ✅ Extract userId from JWT token
    const getUserIdFromToken = (token: string) => {
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));

    console.log("DECODED PAYLOAD:", payload);

    // ✅ Support BOTH formats
    return (
      payload.sub ||
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
    );
  } catch (error) {
    console.log("Token decode error:", error);
    return null;
  }
};

    const userId = getUserIdFromToken(token);

    if (!userId) {
      Alert.alert("Error", "Invalid user session");
      return;
    }

    const rideData = {
      // userId: userId, 
      pickupLocation: pickup,
      pickupLatitude: parseFloat(selectedPickup.lat),
      pickupLongitude: parseFloat(selectedPickup.lon),
      dropoffLocation: destination,
      dropLatitude: parseFloat(selectedDestination.lat),
      dropLongitude: parseFloat(selectedDestination.lon),
    };

    console.log("SENDING DATA:", rideData);

    const response = await axios.post(`${API_BASE_URL}/api/ride/request`, rideData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const createdRide = response.data;

    Alert.alert("Success", "Ride requested successfully!");
    setShowPanel(false);

    // ✅ Navigate to MapScreen with Ride ID
    router.push({
      pathname: "/map",
      params: { 
        ride: JSON.stringify({
          ...rideData,
          id: createdRide.id,
          userId: userId
        }) 
      },
    });

  } catch (error: any) {
    console.log("ERROR:", error.response?.data || error.message);

    Alert.alert(
      "Error",
      error.response?.data || "Failed to request ride"
    );
  } finally {
    setConfirmLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/car.png')}
        style={styles.headerImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.title}>Book a Ride</Text>

        <TouchableOpacity style={styles.locationBox} onPress={() => setShowPanel(true)}>
          <Ionicons name="location" size={24} color="#2563eb" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.label}>Pickup</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {locationLoading ? "Getting location..." : pickup}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.destinationBox} onPress={() => setShowPanel(true)}>
          <Ionicons name="search" size={24} color="#6b7280" />
          <Text style={styles.destinationPlaceholder} numberOfLines={1}>
            {destination || "Where to?"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Panel */}
      {showPanel && (
        <>
          <TouchableOpacity style={styles.overlay} onPress={() => setShowPanel(false)} />

          <View style={styles.panel}>
            <View style={styles.dragHandle} />
            <Text style={styles.panelTitle}>Set Locations</Text>

            {/* Pickup */}
            <Text style={styles.inputLabel}>Pickup Location</Text>
            <View style={styles.searchContainer}>
              <Ionicons name="location" size={20} color="#2563eb" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search pickup location"
                value={pickup}
                onChangeText={(text) => {
                  setPickup(text);
                  fetchPickupDebounced(text); // ✅ Debounced
                }}
              />
              {loadingPickup && <ActivityIndicator size="small" color="#2563eb" />}
            </View>

            {pickupSuggestions.length > 0 && (
              <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
                {pickupSuggestions.map((place, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => selectPlace(place, 'pickup')}
                  >
                    <Ionicons name="location-outline" size={20} color="#64748b" />
                    <Text style={styles.suggestionText} numberOfLines={2}>
                      {place.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Destination */}
            <Text style={styles.inputLabel}>Destination</Text>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search destination"
                value={destination}
                onChangeText={(text) => {
                  setDestination(text);
                  fetchDestinationDebounced(text); // ✅ Debounced
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
              onPress={confirmRide}
              disabled={confirmLoading}
            >
              {confirmLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Ride</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
} 