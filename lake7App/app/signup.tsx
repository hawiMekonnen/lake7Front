import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
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

  const validateEmail = (email: string) => {
    return email.endsWith('@gmail.com');
  };

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    return regex.test(password);
  };

  const handleSignup = async () => {
    if (!fullname || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Email must be a valid Gmail address (e.g., user@gmail.com)');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        'Error',
        'Password must be at least 6 characters and include uppercase, lowercase, number, and symbol'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://192.168.137.218:5260/api/auth/register', {
        fullname,
        email,
        password,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      setSignupSuccess(true);
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
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
            onPress={handleSignup}
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
