import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  Dimensions, 
  Alert,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { getOrder } from '../services/orderService';

const { width, height } = Dimensions.get('window');

// Define Order Status values matching backend OrderStatus enum
const OrderStatus = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Received: 'Received',
  Prepared: 'Prepared',
  OutForDelivery: 'OutForDelivery',
  Delivered: 'Delivered',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Order Details
  const fetchOrderDetails = async () => {
    try {
      const data = await getOrder(orderId as string);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll for updates every 4 seconds
  useEffect(() => {
    if (!orderId) return;
    
    fetchOrderDetails();

    const interval = setInterval(() => {
      fetchOrderDetails();
    }, 4000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004AAD" />
        <Text style={styles.loadingText}>Loading tracking details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found.</Text>
          <TouchableOpacity style={styles.backButtonText} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.backButtonLabel}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatus = order.status;

  // Determine stage checkmarks
  const isConfirmed = [
    OrderStatus.Pending, 
    OrderStatus.Confirmed, 
    OrderStatus.Received, 
    OrderStatus.Prepared, 
    OrderStatus.OutForDelivery, 
    OrderStatus.Delivered, 
    OrderStatus.Completed
  ].includes(currentStatus);

  const isReceived = [
    OrderStatus.Received, 
    OrderStatus.Prepared, 
    OrderStatus.OutForDelivery, 
    OrderStatus.Delivered, 
    OrderStatus.Completed
  ].includes(currentStatus);

  const isPrepared = [
    OrderStatus.Prepared, 
    OrderStatus.OutForDelivery, 
    OrderStatus.Delivered, 
    OrderStatus.Completed
  ].includes(currentStatus);

  const isOutForDelivery = [
    OrderStatus.OutForDelivery, 
    OrderStatus.Delivered, 
    OrderStatus.Completed
  ].includes(currentStatus);

  const isDelivered = [
    OrderStatus.Delivered, 
    OrderStatus.Completed
  ].includes(currentStatus);

  const stages = [
    { label: 'Order Placed & Confirmed', checked: isConfirmed, desc: 'We have received your payment & order.' },
    { label: 'Restaurant Received Order', checked: isReceived, desc: 'The restaurant is accepting and reviewing your order.' },
    { label: 'Kitchen Preparing Food', checked: isPrepared, desc: 'Your food is fresh, hot, and currently being cooked.' },
    { label: 'Out for Delivery (Cyclist)', checked: isOutForDelivery, desc: 'A nearby cyclist has picked up your food and is on the way.' },
    { label: 'Food Delivered', checked: isDelivered, desc: 'Enjoy your food! Thank you for ordering with lake7.' }
  ];

  // Coordinates for the Map
  const pickupLat = order.delivery?.pickupLatitude || 9.0192;
  const pickupLng = order.delivery?.pickupLongitude || 38.7525;
  const dropoffLat = order.delivery?.dropoffLatitude || 9.0300;
  const dropoffLng = order.delivery?.dropoffLongitude || 38.7600;

  // Driver/Cyclist Info
  const driver = order.delivery?.driver;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
          <Ionicons name="home-outline" size={24} color="#004AAD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Food Delivery</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Map View */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: (pickupLat + dropoffLat) / 2,
              longitude: (pickupLng + dropoffLng) / 2,
              latitudeDelta: Math.abs(pickupLat - dropoffLat) * 2 || 0.05,
              longitudeDelta: Math.abs(pickupLng - dropoffLng) * 2 || 0.05,
            }}
          >
            {/* Restaurant Marker */}
            <Marker coordinate={{ latitude: pickupLat, longitude: pickupLng }} title="Restaurant">
              <View style={styles.restaurantMarker}>
                <Ionicons name="restaurant" size={16} color="white" />
              </View>
            </Marker>

            {/* Destination Marker */}
            <Marker coordinate={{ latitude: dropoffLat, longitude: dropoffLng }} title="Delivery Destination">
              <View style={styles.destinationMarker}>
                <Ionicons name="pin" size={16} color="white" />
              </View>
            </Marker>

            <Polyline
              coordinates={[
                { latitude: pickupLat, longitude: pickupLng },
                { latitude: dropoffLat, longitude: dropoffLng }
              ]}
              strokeWidth={3}
              strokeColor="#004AAD"
              lineDashPattern={[5, 5]}
            />
          </MapView>
        </View>

        {/* Cyclist Assignment Details */}
        {driver ? (
          <View style={styles.cyclistCard}>
            <View style={styles.cyclistHeader}>
              <View style={styles.cyclistAvatar}>
                <Ionicons name="bicycle" size={28} color="#004AAD" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.cyclistTitle}>Cyclist Assigned</Text>
                <Text style={styles.cyclistName}>{driver.name || 'Hawi Mekonnen'}</Text>
                <Text style={styles.cyclistSub}>Delivering on bicycle</Text>
              </View>
              <TouchableOpacity 
                style={styles.callButton}
                onPress={() => Alert.alert('Calling Cyclist', `Dialing ${driver.phoneNumber || '+251912345678'}`)}
              >
                <Ionicons name="call" size={20} color="#004AAD" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.searchingCard}>
            <ActivityIndicator size="small" color="#004AAD" style={{ marginRight: 10 }} />
            <Text style={styles.searchingText}>
              {currentStatus === OrderStatus.Prepared 
                ? 'Notifying nearby cyclists...' 
                : 'Waiting for restaurant preparation...'}
            </Text>
          </View>
        )}

        {/* Checkmarks Stages List */}
        <View style={styles.stagesCard}>
          <Text style={styles.stagesCardTitle}>Order Progress</Text>
          {stages.map((stage, idx) => (
            <View key={idx} style={styles.stageRow}>
              {/* Checkmark Container */}
              <View style={styles.checkmarkColumn}>
                <View style={[
                  styles.checkmarkCircle, 
                  stage.checked ? styles.checkedCircle : styles.uncheckedCircle
                ]}>
                  {stage.checked ? (
                    <Ionicons name="checkmark-sharp" size={16} color="white" />
                  ) : (
                    <Text style={styles.uncheckedText}>{idx + 1}</Text>
                  )}
                </View>
                {idx < stages.length - 1 && (
                  <View style={[
                    styles.verticalLine, 
                    stages[idx + 1].checked ? styles.checkedLine : styles.uncheckedLine
                  ]} />
                )}
              </View>

              {/* Text Info */}
              <View style={styles.stageTextContainer}>
                <Text style={[
                  styles.stageLabel, 
                  stage.checked ? styles.checkedLabel : styles.uncheckedLabel
                ]}>
                  {stage.label}
                </Text>
                <Text style={styles.stageDesc}>{stage.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.homeBtn}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.homeBtnText}>Back to Home Screen</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#004AAD',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
  },
  backButtonText: {
    backgroundColor: '#004AAD',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonLabel: {
    color: 'white',
    fontWeight: '600',
  },
  mapContainer: {
    width: width,
    height: 220,
  },
  map: {
    flex: 1,
  },
  restaurantMarker: {
    backgroundColor: '#004AAD',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  destinationMarker: {
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  cyclistCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cyclistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cyclistAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cyclistTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  cyclistName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cyclistSub: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  callButton: {
    backgroundColor: '#F0F9FF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  searchingText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
  },
  stagesCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stagesCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  checkmarkColumn: {
    alignItems: 'center',
    marginRight: 16,
    height: 60,
  },
  checkmarkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  checkedCircle: {
    backgroundColor: '#10B981',
  },
  uncheckedCircle: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  uncheckedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    marginTop: -2,
    marginBottom: -4,
  },
  checkedLine: {
    backgroundColor: '#10B981',
  },
  uncheckedLine: {
    backgroundColor: '#E2E8F0',
  },
  stageTextContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  stageLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  checkedLabel: {
    color: '#0F172A',
  },
  uncheckedLabel: {
    color: '#94A3B8',
  },
  stageDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  homeBtn: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 16,
    alignItems: 'center',
  },
  homeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  }
});
