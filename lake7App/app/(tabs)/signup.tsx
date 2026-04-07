import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

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
      const response = await axios.post('http://localhost:5260/api/auth/register', {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    textAlign: 'center',
    marginTop: 20,
    color: '#3b82f6',
    fontSize: 16,
  },
  backLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 24,
    color: '#3b82f6',
    marginRight: 8,
  },
  backText: {
    fontSize: 16,
    color: '#3b82f6',
  },
  successBox: {
    backgroundColor: '#ecfdf5',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#166534',
    textAlign: 'center',
    marginBottom: 16,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});