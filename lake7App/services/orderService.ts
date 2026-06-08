import axios from 'axios';
import { getToken } from '../src/utils/auth';

const API_BASE = 'http://10.255.49.59:5260/api';

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
  const token = await getToken();
  const response = await axios.post(`${API_BASE}/order/place-delivery`, orderPayload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getOrder = async (orderId: string) => {
  const token = await getToken();
  const response = await axios.get(`${API_BASE}/order/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getUserOrders = async () => {
  const token = await getToken();
  const response = await axios.get(`${API_BASE}/order/user`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

