import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const apiError = error.response?.data;

    if (status === 401) {
      localStorage.removeItem('access_token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const message =
      apiError?.message ||
      (status === 403
        ? 'Bạn không có quyền thực hiện thao tác này hoặc phiên đăng nhập đã hết hạn.'
        : 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');

    const normalizedError = new Error(message);
    normalizedError.status = status || apiError?.code || 500;
    normalizedError.details = apiError?.data || null;
    return Promise.reject(normalizedError);
  }
);

export default axiosClient;

