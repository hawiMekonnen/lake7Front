import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, FlatList, Image } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.137.218:5260';

export default function MapScreen() {
  const params = useLocalSearchParams();

  let parsed: any = null;
  try {
    if (params.ride) {
      parsed = JSON.parse(params.ride as string);
    }
  } catch (error) {
    console.log("JSON parse error:", error);
  }

  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [distanceKm, setDistanceKm] = useState<number>(0);

  useEffect(() => {
    if (parsed) {
      fetchRoute();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchRoute = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/map/directions`, {
        params: {
          origin: `${parsed.pickupLatitude},${parsed.pickupLongitude}`,
          destination: `${parsed.dropLatitude},${parsed.dropLongitude}`,
        },
      });

      setRouteCoords(response.data);

      // ✅ Calculate distance using Haversine formula
      const dist = haversineDistance(
        parsed.pickupLatitude,
        parsed.pickupLongitude,
        parsed.dropLatitude,
        parsed.dropLongitude
      );
      setDistanceKm(dist);
    } catch (error) {
      console.log("Route error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Haversine formula to calculate distance in km
  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Vehicle categories with price multipliers + sample images
  const vehicleCategories = [
    { type: "Economy", multiplier: 1.0, image: require('../assets/images/car.png') },
    { type: "Basic", multiplier: 1.2, image: require('../assets/images/car.png') },
    { type: "Fast", multiplier: 1.5, image: require('../assets/images/car.png') },
    { type: "Delivery", multiplier: 2.0, image: require('../assets/images/car.png') },
  ];

  // Base price per km
  const baseRate = 50; // adjust as needed (ETB per km)

  if (!parsed) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No ride data available</Text>
      </View>
    );
  }

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Map covers half the screen */}
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: parsed.pickupLatitude,
            longitude: parsed.pickupLongitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={{
              latitude: parsed.pickupLatitude,
              longitude: parsed.pickupLongitude,
            }}
            title="Pickup"
          />

          <Marker
            coordinate={{
              latitude: parsed.dropLatitude,
              longitude: parsed.dropLongitude,
            }}
            title="Destination"
          />

          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={4}
              strokeColor="blue"
            />
          )}
        </MapView>
      </View>

      {/* Vehicle categories as cards */}
      <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, margin: 10 }}>
          Choose Vehicle Type
        </Text>
        <FlatList
          data={vehicleCategories}
          keyExtractor={(item) => item.type}
          numColumns={2} // ✅ show as grid
          renderItem={({ item }) => {
            const estimatedPrice = (distanceKm * baseRate * item.multiplier).toFixed(2);
            return (
              <View style={{
                flex: 1,
                margin: 8,
                backgroundColor: '#fff',
                borderRadius: 8,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                alignItems: 'center',
                padding: 10
              }}>
                <Image source={item.image} style={{ width: 100, height: 60, resizeMode: 'contain' }} />
                <Text style={{ fontWeight: 'bold', marginTop: 8 }}>{item.type}</Text>
                <Text>{distanceKm.toFixed(2)} km</Text>
                <Text style={{ fontWeight: 'bold', color: '#007AFF' }}>{estimatedPrice} ETB</Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}
