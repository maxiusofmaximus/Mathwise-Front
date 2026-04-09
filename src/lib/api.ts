import axios from 'axios';

const defaultApiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

const api = axios.create({
  baseURL: defaultApiBaseUrl,
  withCredentials: true,
});

export default api;
