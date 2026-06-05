import axios from 'axios';
import { getToken } from '../src/utils/auth';

const API_BASE = 'http://10.246.207.228:5260/api';

export const getUserRides = async () => {
  const token = await getToken();
  const response = await axios.get(`${API_BASE}/ride/user`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
