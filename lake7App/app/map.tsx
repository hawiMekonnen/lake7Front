import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { getToken } from '../src/utils/auth';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = 'http://192.168.137.234:5260';
const { width } = Dimensions.get('window');

export default function MapScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  let parsed: any = null;
  try {
    if (params.pickupLocation) {
      parsed = {
        pickupLocation: params.pickupLocation as string,
        pickupLatitude: parseFloat(params.pickupLatitude as string),
        pickupLongitude: parseFloat(params.pickupLongitude as string),
        dropoffLocation: params.dropoffLocation as string,
        dropLatitude: parseFloat(params.dropLatitude as string),
        dropLongitude: parseFloat(params.dropLongitude as string),
        userId: params.userId as string,
      };
    } else if (params.ride) {
      parsed = JSON.parse(params.ride as string);
    }
  } catch (error) {
    console.log("JSON parse error:", error);
  }

  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<'idle' | 'pending' | 'accepted'>('idle');
  const [acceptedRideData, setAcceptedRideData] = useState<any>(null);
  const [requestingRide, setRequestingRide] = useState(false);

  useEffect(() => {
    if (parsed) {
      fetchRoute();
      connectHub();
    } else {
      setLoading(false);
    }
  }, []);

  const connectHub = async () => {
    if (!parsed.userId) return;
    
    try {
      const token = await getToken();
      const connection = new HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/userHub`, {
          accessTokenFactory: () => token || "",
        })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      connection.on('RideAccepted', (rideData) => {
        console.log('Ride Accepted:', rideData);
        setRideStatus('accepted');
        setAcceptedRideData(rideData);
        Alert.alert("Ride Accepted!", "A driver is on the way to pick you up.");
      });

      await connection.start();
      await connection.invoke('RegisterUser', parsed.userId);
      console.log('User SignalR connected');
    } catch (err) {
      console.error('SignalR error:', err);
    }
  };

  const fetchRoute = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/map/directions`, {
        params: {
          origin: `${parsed.pickupLatitude},${parsed.pickupLongitude}`,
          destination: `${parsed.dropLatitude},${parsed.dropLongitude}`,
        },
      });
      setRouteCoords(response.data);
      const dist = haversineDistance(
        parsed.pickupLatitude, parsed.pickupLongitude,
        parsed.dropLatitude, parsed.dropLongitude
      );
      setDistanceKm(dist);
    } catch (error) {
      console.log("Route error:", error);
    } finally {
      setLoading(false);
    }
  };

  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const requestRide = async () => {
    if (!selectedVehicle) {
      Alert.alert("Error", "Please select a vehicle type first");
      return;
    }

    setRequestingRide(true);

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Not Logged In", "Please login first");
        return;
      }

      const rideData = {
        pickupLocation: parsed.pickupLocation,
        pickupLatitude: parsed.pickupLatitude,
        pickupLongitude: parsed.pickupLongitude,
        dropoffLocation: parsed.dropoffLocation,
        dropLatitude: parsed.dropLatitude,
        dropLongitude: parsed.dropLongitude,
        vehicleType: selectedVehicle,
      };

      console.log("SENDING RIDE REQUEST:", rideData);

      const response = await axios.post(`${API_BASE_URL}/api/ride/request`, rideData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("RIDE REQUEST SUCCESS:", response.data);
      setRideStatus('pending'); // Transitions to pending searching screen!
      Alert.alert("Ride Requested", `Searching for nearby ${selectedVehicle} drivers...`);

    } catch (error: any) {
      console.error("Ride request failure:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data || "Failed to request ride");
    } finally {
      setRequestingRide(false);
    }
  };

  const vehicleCategories = [
    { type: "Economy", multiplier: 1.0, icon: "car-outline" },
    { type: "Classic", multiplier: 1.2, icon: "car-sport-outline" },
    { type: "Premium", multiplier: 1.8, icon: "shield-checkmark-outline" },
    { type: "Delivery", multiplier: 1.5, icon: "cube-outline" },
  ];

  const baseRate = 50;

  if (!parsed) return <View style={styles.center}><Text>No data</Text></View>;
  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#004AAD" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: parsed.pickupLatitude,
            longitude: parsed.pickupLongitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={{ latitude: parsed.pickupLatitude, longitude: parsed.pickupLongitude }} title="Pickup">
            <View style={[styles.marker, { backgroundColor: '#10b981' }]} />
          </Marker>
          <Marker coordinate={{ latitude: parsed.dropLatitude, longitude: parsed.dropLongitude }} title="Destination">
            <View style={[styles.marker, { backgroundColor: '#ef4444' }]} />
          </Marker>
          {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#004AAD" />}
        </MapView>
        
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.panel}>
        {rideStatus === 'idle' ? (
          <>
            <Text style={styles.panelTitle}>Select Vehicle</Text>
            <FlatList
              data={vehicleCategories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.type}
              renderItem={({ item }) => {
                const price = (distanceKm * baseRate * item.multiplier).toFixed(0);
                const isSelected = selectedVehicle === item.type;
                return (
                  <TouchableOpacity 
                    style={[styles.vehicleCard, isSelected && styles.selectedCard]}
                    onPress={() => setSelectedVehicle(item.type)}
                  >
                    <Ionicons name={item.icon as any} size={32} color={isSelected ? "#fff" : "#004AAD"} />
                    <Text style={[styles.vehicleType, isSelected && styles.selectedText]}>{item.type}</Text>
                    <Text style={[styles.vehiclePrice, isSelected && styles.selectedText]}>{price} ETB</Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.listContent}
            />
            <TouchableOpacity 
              style={[styles.confirmButton, (!selectedVehicle || requestingRide) && styles.disabledButton]}
              disabled={!selectedVehicle || requestingRide}
              onPress={requestRide}
            >
              {requestingRide ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmText}>Request {selectedVehicle || "Ride"}</Text>
              )}
            </TouchableOpacity>
          </>
        ) : rideStatus === 'pending' ? (
          <View style={styles.acceptedContainer}>
            <ActivityIndicator size="large" color="#004AAD" style={{ marginBottom: 15 }} />
            <Text style={styles.acceptedTitle}>Searching for Drivers...</Text>
            <Text style={styles.acceptedSub}>Finding a nearby {selectedVehicle} driver for you.</Text>
            <View style={[styles.driverInfo, { borderLeftColor: '#004AAD', backgroundColor: '#f0f9ff' }]}>
              <Text style={styles.driverLabel}>Pickup: <Text style={{fontWeight: '400'}}>{parsed.pickupLocation}</Text></Text>
              <Text style={styles.driverLabel}>Destination: <Text style={{fontWeight: '400'}}>{parsed.dropoffLocation}</Text></Text>
            </View>
          </View>
        ) : (
          <View style={styles.acceptedContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <Image 
                source={{ uri: acceptedRideData?.driverProfilePicture 
                  ? (acceptedRideData.driverProfilePicture.startsWith('data:') 
                      ? acceptedRideData.driverProfilePicture 
                      : `data:image/jpeg;base64,${acceptedRideData.driverProfilePicture}`)
                  : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' 
                }} 
                style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#e2e8f0', marginRight: 15 }} 
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#1e293b' }} numberOfLines={1}>
                  {acceptedRideData?.driverName || "Hawi Mekonnen"}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#004AAD', marginTop: 2 }}>
                  Status: Arriving
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => Alert.alert("Calling Driver", `Dialing ${acceptedRideData?.driverPhoneNumber || '+251 911 00 22 33'}`)}
                style={{ backgroundColor: '#F0F9FF', padding: 12, borderRadius: 20 }}
              >
                <Ionicons name="call" size={20} color="#004AAD" />
              </TouchableOpacity>
            </View>

            <View style={[styles.driverInfo, { marginTop: 0 }]}>
              <Text style={styles.driverLabel}>Phone: <Text style={{fontWeight: '500', color: '#475569'}}>{acceptedRideData?.driverPhoneNumber || "+251 911 00 22 33"}</Text></Text>
              <Text style={styles.driverLabel}>Destination: <Text style={{fontWeight: '400'}}>{parsed.dropoffLocation}</Text></Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapContainer: { height: '55%', width: '100%' },
  map: { flex: 1 },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: '#fff', padding: 10, borderRadius: 12, elevation: 5 },
  panel: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 20 },
  panelTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 20 },
  listContent: { paddingRight: 20 },
  vehicleCard: { width: 110, height: 130, backgroundColor: '#f8fafc', borderRadius: 20, padding: 15, marginRight: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  selectedCard: { backgroundColor: '#004AAD', borderColor: '#004AAD' },
  vehicleType: { fontSize: 14, fontWeight: '700', color: '#64748b', marginTop: 10 },
  vehiclePrice: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginTop: 4 },
  selectedText: { color: '#fff' },
  confirmButton: { backgroundColor: '#004AAD', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 24 },
  disabledButton: { backgroundColor: '#94a3b8' },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  marker: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  acceptedContainer: { alignItems: 'center', paddingVertical: 10 },
  successBadge: { marginBottom: 15 },
  acceptedTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
  acceptedSub: { fontSize: 16, color: '#64748b', marginTop: 5 },
  driverInfo: { marginTop: 20, width: '100%', padding: 15, backgroundColor: '#f0f9ff', borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#004AAD' },
  driverLabel: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 5 }
});
