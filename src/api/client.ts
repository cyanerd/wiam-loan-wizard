import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://dummyjson.com',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});
