import axios from 'axios';

const API_BASE = 'http://192.168.137.234:5260/api';

export const restaurantService = {
  getRestaurants: async () => {
    return axios.get(`${API_BASE}/restaurant`);
  },
  getRestaurantDetails: async (id: string) => {
    return axios.get(`${API_BASE}/restaurant/${id}`);
  },
  getMenu: async (restaurantId: string) => {
    return axios.get(`${API_BASE}/restaurant/${restaurantId}/menu`);
  }
};
