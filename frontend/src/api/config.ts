// const API_BASE_URL = 'http://192.168.0.23:3002';
const API_BASE_URL = 'http://101.58.39.17:3002';

export const API_URLS = {
  base: API_BASE_URL,
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    registerJoin: `${API_BASE_URL}/api/auth/register/join`,
    registerNew: `${API_BASE_URL}/api/auth/register/new`,
  }
};

export const STATIC_URLS = {
  images: 'http://101.58.39.17:3002',
};

export default API_URLS; 