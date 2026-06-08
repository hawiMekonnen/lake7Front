import axios from 'axios';

const API_BASE = 'http://10.255.49.59:5260/api';

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
