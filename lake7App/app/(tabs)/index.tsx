// app/(tabs)/index.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { ServiceCard } from '../../components/serviceCard';
import { DiscountCard } from '../../components/discountCard';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/index.styles';

export default function HomeScreen() {
  const [isPressed, setIsPressed] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoginLoading(true);
    try {
      const response = await axios.post('http://localhost:5260/api/auth/login', {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Login success:', response.data);
      setLoginSuccess(true);
      Alert.alert('Success', 'Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      Alert.alert('Login failed', errorMessage.toString());
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <><ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>lake7</Text>
          <Text style={styles.locationText}>your location</Text>
        </View>
        <TouchableOpacity
          style={{ ...styles.loginButton, backgroundColor: isPressed ? '#2563eb' : 'white' }}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ ...styles.loginText, color: isPressed ? 'white' : '#2563eb' }}>login</Text>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications-outline" size={28} color={isPressed ? 'white' : '#000'} />
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
            onPress={() => router.push('/ride')} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.serviceTouchable}>
          <ServiceCard
            title="DELIVERY"
            image={require('../../assets/images/food.png')}
            onPress={() => { } } />
        </TouchableOpacity>
      </View>

      {/* Discounts Section */}
      <Text style={styles.sectionTitle}>Discounts</Text>
      <DiscountCard />

      {/* You can add more sections here later */}
    </ScrollView><Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.modalBackButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBackText}>&lt; Back</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>Login</Text>
            {loginSuccess ? (
              <View style={styles.loginSuccessBox}>
                <Text style={styles.loginSuccessTitle}>Login successful!</Text>
                <Text style={styles.loginSuccessMessage}>You are now logged in.</Text>
                <TouchableOpacity
                  style={styles.loginSuccessButton}
                  onPress={() => {
                    setModalVisible(false);
                    setLoginSuccess(false);
                    router.push('/');
                  }}
                >
                  <Text style={styles.loginSuccessButtonText}>&lt; Return to home</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry />
                <TouchableOpacity style={[styles.signupButton, loginLoading && styles.buttonDisabled]} onPress={handleLogin} disabled={loginLoading}>
                  <Text style={styles.signupText}>{loginLoading ? 'Logging in...' : 'Login'}</Text>
                </TouchableOpacity>
                <View style={styles.modalFooter}>
                  <TouchableOpacity onPress={() => { setModalVisible(false); router.push('/signup'); }}>
                    <Text style={styles.modalLinkText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal></>
  );
}

