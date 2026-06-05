import axios from 'axios';

const API_BASE = 'http://10.246.207.228:5260/api';

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
