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
  const token = sessionStorage.getItem("accessToken");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
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
  const token = sessionStorage.getItem("accessToken");

  return {
    headers: {
      currentUserId: userId,
      isAdmin,
      Authorization: `Bearer ${token}`,
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
  const token = sessionStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
