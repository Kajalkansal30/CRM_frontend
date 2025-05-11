import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Update this if the backend runs on a different host/port
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
