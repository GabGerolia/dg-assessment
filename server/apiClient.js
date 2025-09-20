import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // You can add other headers like authorization token here
  },
});

// Define common API methods
const _get = (url, config = {}) => {
  return apiClient.get(url, config);
};

const _delete = (url, config = {}) => {
  return apiClient.delete(url, config);
};

const _put = (url, data = {}, config = {}) => {
  return apiClient.put(url, data, config);
};

const _post = (url, data = {}, config = {}) => {
  return apiClient.post(url, data, config);
};

// Export API methods
export { _get, _delete, _put, _post };