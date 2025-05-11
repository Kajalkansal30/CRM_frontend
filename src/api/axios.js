import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://crmbackend-eight.vercel.app/api', // Updated to deployed backend URL
  timeout: 10000,
});

// Add a request interceptor to include token in headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
