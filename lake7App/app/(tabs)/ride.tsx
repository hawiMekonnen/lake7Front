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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/ride.styles';

export default function RideScreen() {
  const [showPanel, setShowPanel] = useState(false);
  const [pickup] = useState("Current Location"); // Default - not editable
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]); // For fake search suggestions

  // Fake search simulation (you can later connect to Google Maps API)
  const handleDestinationSearch = (text: string) => {
    setDestination(text);

    if (text.length > 2) {
      // Simulate suggestions (replace with real Google Places API later)
      setSuggestions([
        `${text} - Central Park`,
        `${text} - Airport Terminal`,
        `${text} - Main Station`,
        `${text} - Shopping Mall`,
      ]);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (place: string) => {
    setDestination(place);
    setSuggestions([]);
  };

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <Image
        source={require('../../assets/images/car.png')}
        style={styles.headerImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.title}>Where are you going?</Text>

        {/* Pickup Location (Default - Non-editable) */}
        <View style={styles.locationBox}>
          <Ionicons name="location" size={24} color="#2563eb" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.label}>Pickup</Text>
            <Text style={styles.locationValue}>{pickup}</Text>
          </View>
        </View>

        {/* Destination Search Bar */}
        <TouchableOpacity 
          style={styles.destinationBox}
          onPress={() => setShowPanel(true)}
        >
          <Ionicons name="search" size={24} color="#6b7280" />
          <Text style={styles.destinationPlaceholder}>
            {destination ? destination : "Where to?"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sliding Panel */}
      {showPanel && (
        <>
          {/* Background Overlay */}
          <TouchableOpacity 
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setShowPanel(false)}
          />

          {/* Panel */}
          <View style={styles.panel}>
            <View style={styles.dragHandle} />

            <Text style={styles.panelTitle}>Where to?</Text>

            {/* Destination Input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search destination"
                value={destination}
                onChangeText={handleDestinationSearch}
                autoFocus
              />
            </View>

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <ScrollView style={styles.suggestionsList}>
                {suggestions.map((place, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(place)}
                  >
                    <Ionicons name="location-outline" size={20} color="#6b7280" />
                    <Text style={styles.suggestionText}>{place}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                if (destination) {
                  Alert.alert("Ride Requested", `Going to: ${destination}`);
                  setShowPanel(false);
                } else {
                  Alert.alert("Error", "Please enter a destination");
                }
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm Destination</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

