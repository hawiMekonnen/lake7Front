import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://192.168.137.218:5260/api';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderPayload {
    senderName: string;
    senderPhone: string;
    receiverName: string;
    receiverPhone: string;
    pickupAddress: string;
    dropoffAddress: string;
    pickupLatitude: number;
    pickupLongitude: number;
    dropoffLatitude: number;
    dropoffLongitude: number;
    itemDescription: string;
    estimatedWeight: number;
    estimatedPrice: number;
    paymentMethod: string;
    paymentAmount: number;
}


export const placeOrder = async (orderPayload: OrderPayload) => {
  const token = await SecureStore.getItemAsync('jwt');
  const response = await axios.post(`${API_BASE}/order/place-delivery`, orderPayload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getOrder = async (orderId: string) => {
  const token = await SecureStore.getItemAsync('jwt');
  const response = await axios.get(`${API_BASE}/order/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
