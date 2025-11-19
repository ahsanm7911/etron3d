import axios from "axios";
import { getAuthData } from './auth'

const api = axios.create({
    baseURL: 'http://localhost:8000/',
    timeout: 1000, 
    headers: {
        'Content-Type': 'application/json'
    }
})


// Add token to requests if available
api.interceptors.request.use(async (config) => {
  const { accessToken } = await getAuthData();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;
