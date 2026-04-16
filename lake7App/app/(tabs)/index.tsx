import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ServiceCard } from '../../components/serviceCard';
import { DiscountCard } from '../../components/discountCard';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/index.styles';
import { useAuth } from '@/src/context/AuthContext';

export default function HomeScreen() {
  const [isPressed, setIsPressed] = useState(false);
  const router = useRouter();
  const { isLoggedIn } = useAuth(); 

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
          <Text style={styles.locationText}>your location</Text>
        </View>

        {/* Login Button + Notification - Kept exactly as you wanted */}
        <TouchableOpacity
          style={{ 
            ...styles.loginButton, 
            backgroundColor: isPressed ? '#2563eb' : 'white' 
          }}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          onPress={handleLoginPress}           // ← Updated logic here
        >
          <Text style={{ 
            ...styles.loginText, 
            color: isPressed ? 'white' : '#2563eb' 
          }}>
            login
          </Text>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="notifications-outline" 
              size={28} 
              color={isPressed ? 'white' : '#000'} 
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Choose your service */}
      <Text style={styles.sectionTitle}>Choose your service</Text>

      <View style={styles.servicesContainer}>
        <TouchableOpacity style={styles.serviceTouchable}>
          <ServiceCard
            title="RIDE"
            image={require('../../assets/images/car.png')}
            onPress={() => router.push('/ride')}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.serviceTouchable}>
          <ServiceCard
            title="DELIVERY"
            image={require('../../assets/images/food.png')}
            onPress={() => router.push('/delivery')}
          />
        </TouchableOpacity>
      </View>

      {/* Discounts Section */}
      <Text style={styles.sectionTitle}>Discounts</Text>
      <DiscountCard />
    </ScrollView>
  );
}