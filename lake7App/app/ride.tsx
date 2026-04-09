import React, { useState } from 'react';
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
import { styles } from '../styles/ride.styles';
import axios from 'axios';
import { getToken } from '@/src/utils/auth';

const API_BASE_URL = 'http://192.168.137.237:5260';   // Change to your IP when testing on phone

export default function RideScreen() {
  const [showPanel, setShowPanel] = useState(false);
  
  const [pickup, setPickup] = useState("Current Location");
  const [destination, setDestination] = useState("");

  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);   // For confirm ride

  // List of popular places in Addis Ababa
  const addisPlaces = [
    "Bole Airport", "Bole Medhanialem", "Meskel Square", "Piassa", "Merkato",
    "Arat Kilo", "Siddist Kilo", "CMC", "Hayahulet", "Megenagna", "Kazanchis",
    "Mexico Square", "Addis Ababa University", "National Museum", "Unity Park",
    "Entoto Mountain", "Gotera", "Sarbet", "Lideta", "Lebu", "Kera", "Olympia",
    "4 Kilo", "6 Kilo", "22 Mazoria", "Stadium", "Bole Atlas", "Old Airport"
  ];

  const handlePickupSearch = (text: string) => {
    setPickup(text);
    if (text.trim() === "") {
      setPickupSuggestions([]);
      return;
    }
    const filtered = addisPlaces
      .filter(place => place.toLowerCase().includes(text.toLowerCase()))
      .slice(0, 8);
    setPickupSuggestions(filtered);
  };

  const handleDestinationSearch = (text: string) => {
    setDestination(text);
    if (text.trim() === "") {
      setDestinationSuggestions([]);
      return;
    }
    const filtered = addisPlaces
      .filter(place => place.toLowerCase().includes(text.toLowerCase()))
      .slice(0, 8);
    setDestinationSuggestions(filtered);
  };

  const selectPickup = (place: string) => {
    setPickup(place);
    setPickupSuggestions([]);
  };

  const selectDestination = (place: string) => {
    setDestination(place);
    setDestinationSuggestions([]);
  };

  const confirmRide = async () => {
  if (!pickup || !destination) {
    Alert.alert("Missing Info", "Please select both pickup and destination");
    return;
  }

  setLoading(true);

  try {
    const token = await getToken();

    if (!token) {
      Alert.alert("Not Logged In", "Please login first");
      return;
    }

    const rideData = {
      userId: "d3f0a8b4-5c2f-4a1e-9f1a-123456789abc",     // Replace with real userId from auth later
      driverId: "a33a0986-32c4-485e-bc19-08de949ca2b2",   // This should be dynamic later
      pickupLocation: pickup,
      dropoffLocation: destination,
    };

    const response = await axios.post(
      `${API_BASE_URL}/api/ride/request`, 
      rideData,
      {
        headers: {
          Authorization: `Bearer ${token}`,     // ← This is the key part
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Ride request successful:', response.data);

    Alert.alert("Success!", "Your ride has been requested successfully!");

  } catch (error: any) {
    console.error('Ride request failed:', error);

    if (error.response?.status === 401) {
      Alert.alert("Session Expired", "Please login again");
    } else {
      Alert.alert("Failed", error.response?.data?.message || "Could not request ride");
    }
  } finally {
    setLoading(false);
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
            <Text style={styles.locationValue}>{pickup}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.destinationBox} onPress={() => setShowPanel(true)}>
          <Ionicons name="search" size={24} color="#6b7280" />
          <Text style={styles.destinationPlaceholder}>
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
              <Ionicons name="location" size={20} color="#2563eb" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search pickup location"
                value={pickup}
                onChangeText={handlePickupSearch}
              />
            </View>

            {pickupSuggestions.length > 0 && (
              <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
                {pickupSuggestions.map((place, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.suggestionItem} 
                    onPress={() => selectPickup(place)}
                  >
                    <Ionicons name="location-outline" size={20} color="#64748b" />
                    <Text style={styles.suggestionText}>{place}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Destination */}
            <Text style={styles.inputLabel}>Destination</Text>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search destination"
                value={destination}
                onChangeText={handleDestinationSearch}
              />
            </View>

            {destinationSuggestions.length > 0 && (
              <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
                {destinationSuggestions.map((place, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.suggestionItem} 
                    onPress={() => selectDestination(place)}
                  >
                    <Ionicons name="location-outline" size={20} color="#64748b" />
                    <Text style={styles.suggestionText}>{place}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Confirm Button */}
            <TouchableOpacity 
              style={[styles.confirmButton, loading && { opacity: 0.7 }]} 
              onPress={confirmRide}
              disabled={loading}
            >
              {loading ? (
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