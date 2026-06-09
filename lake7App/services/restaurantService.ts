import axios from 'axios';

const API_BASE = 'http://10.255.49.59:5260/api';
export const API_ORIGIN = API_BASE.replace(/\/api$/, '');

/** Turn a relative /uploads/... path or localhost URL into a loadable image URL. */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return `${API_ORIGIN}${parsed.pathname}`;
      }
    } catch {
      /* use url as-is */
    }
    return url;
  }
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return url;
}

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
