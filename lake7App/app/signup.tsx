import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { styles } from '@/styles/signup.styles';

export default function Signup() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const router = useRouter();

  const handleSignup = async () => {
    console.log('Starting signup process'); // Debug log
    console.log('Form values:', { fullname, email, password });

    // Basic validation
    if (!fullname || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    console.log('Sending request to backend'); // Debug log

    try {
      const response = await axios.post('http://192.168.137.237:5260/api/auth/register', {
        fullname: fullname,
        email: email,
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response received:', response.data); // Debug log

      // If successful
      setSignupSuccess(true);
      Alert.alert('Success', 'Account created successfully!');

    } catch (error: any) {
      console.error('Error details:', error); // More detailed error log

      const errorMessage = error.response?.data?.message 
        || error.response?.data 
        || 'Registration failed. Please try again.';

      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backLinkRow} onPress={() => router.push('/')}>
        
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Sign Up</Text>

      {signupSuccess ? (
        <View style={styles.successBox}>
          <Text style={styles.successTitle}>Sign up successful!</Text>
          <Text style={styles.successMessage}>Your account has been created.</Text>
          <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/')}>
            <Text style={styles.homeButtonText}>&lt; Return to home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullname}
            onChangeText={setFullname}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={() => {
              console.log('Signup button pressed');
              handleSignup();
            }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.loginLink}>Already have an account? Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
