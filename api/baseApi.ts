import axios from "axios";

/**
 * ================================
 * BACKEND URL CONFIG
 * ================================
 */

// 👉 Dùng khi deploy (Render)
export const BASE_URL = "https://backend-jfn4.onrender.com";

// 👉 Dùng khi chạy local
// export const BASE_URL = "http://192.168.101.136:8081";

/**
 * ================================
 * AXIOS INSTANCES
 * ================================
 */

export const publicApi = axios.create({
  baseURL: `${BASE_URL}/api/public`,
  headers: {
    "ngrok-skip-browser-warning": "true"
  }
});

export const privateApi = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "ngrok-skip-browser-warning": "true"
  }
});

/**
 * ================================
 * AUTH HEADER HELPER
 * ================================
 */

export const getAuthConfig = (userId?: string) => {
  // Note: sessionStorage doesn't exist in React Native
  // Using empty token for now - authentication is handled by currentUserId header
  const token = "";

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      currentUserId: userId || "",
      "ngrok-skip-browser-warning": "true"
    }
  };
};


// baseApi.ts

export const playlistApi = axios.create({
  baseURL: `${BASE_URL}/api/playlists`,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
  }
});

export const getPlaylistAuthConfig = (userId: string, isAdmin: boolean = false) => {
  // Note: sessionStorage doesn't exist in React Native
  // Using empty token for now - authentication is handled by currentUserId header
  const token = "";

  return {
    headers: {
      currentUserId: userId,
      isAdmin,
      Authorization: token ? `Bearer ${token}` : "",
      "ngrok-skip-browser-warning": "true"
    }
  };
};
// ================= LIVE API =================

// Backend Render
// export const LIVE_API_BASE = "https://backend-jfn4.onrender.com/api/live";

export const LIVE_API_BASE = `${BASE_URL}/api/live`;

export const liveClient = axios.create({
  baseURL: LIVE_API_BASE,
  headers: {
    "ngrok-skip-browser-warning": "true"
  }
});

// Auto attach token
liveClient.interceptors.request.use((config) => {
  // Note: sessionStorage doesn't exist in React Native
  // Using empty token for now - authentication is handled by currentUserId header
  const token = "";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
