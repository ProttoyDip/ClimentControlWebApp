import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

function notifyUnauthorizedSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("authUser");
  window.dispatchEvent(new CustomEvent("auth:unauthorized"));
}

export const api = axios.create({
  baseURL,
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      notifyUnauthorizedSession();
    }
    return Promise.reject(error);
  }
);
