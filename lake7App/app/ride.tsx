// app/ride.tsx
import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '../src/utils/auth';
import { styles } from '@/styles/ride.styles';

const GOOGLE_API_KEY = Constants.expoConfig?.extra?.googleApiKey;
const API_BASE_URL = 'http://192.168.137.237:5260';

export default function RideScreen() {
  const [showPanel, setShowPanel] = useState(false);

  const [pickup, setPickup] = useState("Getting current location...");
  const [destination, setDestination] = useState("");

  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);

  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  // Get user's current location on mount
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required.');
          setPickup("Current Location");
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

        setPickup(address);
      } catch (error) {
        console.error('Location error:', error);
        setPickup("Current Location");
      } finally {
        setLocationLoading(false);
      }
    };

    getCurrentLocation();
  }, []);

  // Fetch Google Places Autocomplete
  const fetchSuggestions = async (text: string, type: 'pickup' | 'destination') => {
    if (text.length < 3) {
      if (type === 'pickup') setPickupSuggestions([]);
      else setDestinationSuggestions([]);
      return;
    }

    const setLoading = type === 'pickup' ? setLoadingPickup : setLoadingDestination;
    const setSuggestions = type === 'pickup' ? setPickupSuggestions : setDestinationSuggestions;

    setLoading(true);

    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        {
          params: {
            input: text,
            key: GOOGLE_API_KEY,
            types: 'geocode',
            language: 'en',
          },
        }
      );

      if (response.data.status === 'OK') {
        setSuggestions(response.data.predictions);
      } else {
        console.warn('Google API Error:', response.data.status);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Google Places error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const selectPlace = (place: any, type: 'pickup' | 'destination') => {
    if (type === 'pickup') {
      setPickup(place.description);
      setPickupSuggestions([]);
    } else {
      setDestination(place.description);
      setDestinationSuggestions([]);
    }
  };

  const confirmRide = async () => {
    if (!pickup || !destination) {
      Alert.alert("Missing Info", "Please select both pickup and destination");
      return;
    }

    setConfirmLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Not Logged In", "Please login first");
        return;
      }

      const rideData = {
        userId: "d3f0a8b4-5c2f-4a1e-9f1a-123456789abc",
        driverId: "a33a0986-32c4-485e-bc19-08de949ca2b2",
        pickupLocation: pickup,
        dropoffLocation: destination,
      };

      await axios.post(`${API_BASE_URL}/api/ride/request`, rideData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      Alert.alert("Success!", "Your ride request has been sent successfully!");
      setShowPanel(false);

    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) {
        Alert.alert("Session Expired", "Please login again");
      } else {
        Alert.alert("Failed", "Could not request ride. Please try again.");
      }
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
                  fetchSuggestions(text, 'pickup');
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
