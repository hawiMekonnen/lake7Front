import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator, 
  StyleSheet, 
  Alert, 
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../src/context/CartContext';
import { useAuth } from '../src/context/AuthContext';
import { placeOrder } from '../services/orderService';
import * as Location from 'expo-location';
import axios from 'axios';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://10.255.49.59:5260';

export default function CheckoutScreen() {
  const router = useRouter();
  const { 
    cartItems, 
    restaurantName, 
    restaurantAddress, 
    restaurantLatitude, 
    restaurantLongitude, 
    getCartTotal, 
    updateQuantity, 
    clearCart 
  } = useCart();
  const { user } = useAuth();

  // Form States
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0); // e.g., 30 for 30%
  const [deliveryLocation, setDeliveryLocation] = useState('Detecting current location...');
  const [deliveryLatitude, setDeliveryLatitude] = useState(9.0300);
  const [deliveryLongitude, setDeliveryLongitude] = useState(38.7600);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Modal & Payment States
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('Cash'); // Cash, Telebirr, CBE Birr
  const [loading, setLoading] = useState(false);

  // Fetch current location on mount
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required.');
          setDeliveryLocation('Ring Road, Bole, Addis Ababa, Ethiopia');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setDeliveryLatitude(location.coords.latitude);
        setDeliveryLongitude(location.coords.longitude);
        
        const geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (geocode && geocode.length > 0) {
          const address = `${geocode[0].name || ''} ${geocode[0].street || ''}, ${geocode[0].city || 'Addis Ababa'}`.trim();
          setDeliveryLocation(address || 'Ring Road, Bole, Addis Ababa, Ethiopia');
        } else {
          setDeliveryLocation('Ring Road, Bole, Addis Ababa, Ethiopia');
        }
      } catch (err) {
        console.error('Error fetching default location:', err);
        setDeliveryLocation('Ring Road, Bole, Addis Ababa, Ethiopia');
      }
    };
    fetchLocation();
  }, []);

  const handleSearchPlaces = async (text: string) => {
    setDeliveryLocation(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/places/autocomplete`, {
        params: { input: text }
      });
      if (res.data.predictions) {
        setSuggestions(res.data.predictions.map((p: any) => ({
          description: p.display_name,
          lat: p.lat,
          lon: p.lon
        })));
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Error autocomplete places:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSuggestion = (item: any) => {
    setDeliveryLocation(item.description);
    setDeliveryLatitude(parseFloat(item.lat));
    setDeliveryLongitude(parseFloat(item.lon));
    setSuggestions([]);
  };

  // Constants for fees
  const subtotal = getCartTotal();
  const discount = subtotal * (discountPercent / 100);
  const extras = 0;
  const serviceCharge = subtotal > 0 ? 23.90 : 0;
  const deliveryFee = subtotal > 0 ? 59.00 : 0;
  const totalAmount = subtotal - discount + extras + serviceCharge + deliveryFee;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'LAKE30') {
      setDiscountPercent(30);
      Alert.alert('Promo Applied!', 'You have received a 30% discount.');
    } else {
      Alert.alert('Invalid Code', 'Please enter a valid promo code. Try "LAKE30".');
    }
  };

  const handleConfirmOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart is empty', 'Please add some items to your cart first.');
      return;
    }
    setPaymentModalVisible(true);
  };

  const submitOrder = async () => {
    setPaymentModalVisible(false);
    setLoading(true);

    try {
      // Build DTO matching PlaceDeliveryOrderDto on backend
      const orderPayload = {
        senderName: restaurantName || 'Restaurant',
        senderPhone: '0911002233', // Default or restaurant phone if available
        receiverName: user?.name || 'Customer',
        receiverPhone: user?.email || '0911445566', // Fallback or phone if available
        pickupAddress: restaurantAddress || 'Restaurant Location',
        dropoffAddress: deliveryLocation,
        pickupLatitude: restaurantLatitude || 9.0192,
        pickupLongitude: restaurantLongitude || 38.7525,
        dropoffLatitude: deliveryLatitude,
        dropoffLongitude: deliveryLongitude,
        itemDescription: JSON.stringify({
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        }),
        estimatedWeight: 1.0,
        estimatedPrice: totalAmount,
        paymentMethod: selectedPayment,
        paymentAmount: totalAmount,
      };

      console.log('Placing delivery order:', orderPayload);
      const res = await placeOrder(orderPayload);
      console.log('Order confirmation response:', res);
      
      // Clear local cart
      clearCart();

      Alert.alert('Order Confirmed', 'Your order has been placed successfully!', [
        {
          text: 'Track Order',
          onPress: () => {
             router.replace({
              pathname: '/order-tracking' as any,
              params: { orderId: res.id }
             });
          }
        }
      ]);
    } catch (error: any) {
      console.error('Error placing order:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data || 'Failed to confirm order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#004AAD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#004AAD" />
          <Text style={styles.loadingText}>Processing your order...</Text>
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Products List */}
          <Text style={styles.sectionTitle}>Products</Text>
          <View style={styles.productsCard}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.productRow}>
                <Image 
                  source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80' }} 
                  style={styles.productImage} 
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productQtyPrice}>
                    {item.quantity} X {item.price.toFixed(2)} Br
                  </Text>
                </View>
                {/* Quantity Controls */}
                <View style={styles.qtyControls}>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyButton}>
                    <Ionicons name="remove" size={16} color="#004AAD" />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyButton}>
                    <Ionicons name="add" size={16} color="#004AAD" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Promo Code */}
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.promoContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter Promo Code"
              placeholderTextColor="#94A3B8"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyPromo}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.promoHint}>Use code "LAKE30" to get 30% OFF!</Text>

          {/* Deliver To */}
          <Text style={styles.sectionTitle}>Deliver To</Text>
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryHeader}>
              <Ionicons name="location" size={24} color="#004AAD" style={styles.flagIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationTitle}>Delivery Location</Text>
                <TextInput
                  style={styles.locationInput}
                  value={deliveryLocation}
                  onChangeText={handleSearchPlaces}
                  placeholder="Enter delivery address..."
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
            
            {searchLoading && (
              <ActivityIndicator size="small" color="#004AAD" style={{ marginTop: 10 }} />
            )}

            {suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(item)}
                  >
                    <Ionicons name="location-sharp" size={16} color="#64748B" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={styles.suggestionText}>{item.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Subtotal Breakdowns */}
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Subtotal</Text>
              <Text style={styles.breakdownValue}>{subtotal.toFixed(2)} Br</Text>
            </View>
            {discount > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Discount</Text>
                <Text style={[styles.breakdownValue, { color: '#EF4444' }]}>(-) {discount.toFixed(2)} Br</Text>
              </View>
            )}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Extras</Text>
              <Text style={styles.breakdownValue}>(+) {extras.toFixed(2)} Br</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Service Charge</Text>
              <Text style={styles.breakdownValue}>(+) {serviceCharge.toFixed(2)} Br</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Delivery Fee</Text>
              <Text style={styles.breakdownValue}>(+) {deliveryFee.toFixed(2)} Br</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{totalAmount.toFixed(2)} Br</Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
            <Text style={styles.confirmButtonText}>Confirm Order</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Payment Options Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Payment Option</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {/* Payment Options */}
            {[
              { id: 'Cash', name: 'Cash on Delivery', icon: 'cash-outline', color: '#10B981' },
              { id: 'Telebirr', name: 'Telebirr', icon: 'phone-portrait-outline', color: '#004AAD' },
              { id: 'CBEBirr', name: 'CBE Birr', icon: 'card-outline', color: '#7C3AED' },
              { id: 'Wallet', name: 'lake7 Wallet', icon: 'wallet-outline', color: '#F59E0B' },
            ].map((payment) => {
              const isSelected = selectedPayment === payment.id;
              return (
                <TouchableOpacity 
                  key={payment.id} 
                  style={[styles.paymentOptionRow, isSelected && styles.selectedPaymentOption]}
                  onPress={() => setSelectedPayment(payment.id)}
                >
                  <View style={[styles.paymentIconContainer, { backgroundColor: payment.color + '1A' }]}>
                    <Ionicons name={payment.icon as any} size={24} color={payment.color} />
                  </View>
                  <Text style={styles.paymentName}>{payment.name}</Text>
                  <View style={styles.radioButton}>
                    {isSelected && <View style={styles.radioButtonSelected} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.payButton} onPress={submitOrder}>
              <Text style={styles.payButtonText}>Confirm & Place Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#004AAD',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 20,
    marginBottom: 10,
  },
  productsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  productQtyPrice: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qtyButton: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    paddingHorizontal: 8,
  },
  promoContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  promoInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  applyButton: {
    backgroundColor: '#004AAD',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  promoHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  deliveryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flagIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  locationInput: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    padding: 0,
    fontWeight: '500',
  },
  suggestionsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  suggestionText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
    fontWeight: '500',
  },
  breakdownCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004AAD', // Premium blue
  },
  confirmButton: {
    backgroundColor: '#004AAD',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#004AAD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  paymentOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 6,
  },
  selectedPaymentOption: {
    borderColor: '#004AAD',
    backgroundColor: '#F0F9FF',
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 16,
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#004AAD',
  },
  payButton: {
    backgroundColor: '#004AAD',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  }
});
