import axios from '../api/axios';

const useFetch = () => {
  const fetchWithToken = async (url, method = 'GET', data = null) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'x-auth-token': token,
      },
    };

    try {
      if (method === 'GET') {
        const response = await axios.get(url, config);
        return response.data;
      } else if (method === 'POST') {
        const response = await axios.post(url, data, config);
        return response.data;
      } else if (method === 'PUT') {
        const response = await axios.put(url, data, config);
        return response.data;
      } else if (method === 'DELETE') {
        const response = await axios.delete(url, config);
        return response.data;
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  return { fetchWithToken };
};

export default useFetch;