import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://192.168.137.218:5260/api'; // Using the IP from signup.tsx

export const signup = async (email: string, password: string, fullname: string, phoneNumber: string = '') => {
  const response = await axios.post(`${API_BASE}/auth/register`, {
    email,
    password,
    fullname,
    phoneNumber
  });
  
  // The backend might return a token or we might need to login. Let's assume it doesn't log us in automatically.
  return response.data;
};

export const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password
    });

    if (response.data && response.data.token) {
        await SecureStore.setItemAsync('jwt', response.data.token);
    }
    return response.data;
};

export const logout = async () => {
    await SecureStore.deleteItemAsync('jwt');
};
