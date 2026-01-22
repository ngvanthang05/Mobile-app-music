import { publicApi, privateApi, BASE_URL } from "./baseApi";
import axios from "axios";

// ================= TYPES =================

export interface Song {
  id: string;
  title: string;
  artistName: string;
  albumName: string;
  coverUrl: string;
  duration: number;
  streamUrl: string;
  status: "PENDING" | "PUBLISHED" | "REJECTED";
  viewCount: number;
  isExplicit: boolean;
  genre: string[];
}

export interface LyricsResponse {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  plainLyrics: string;
  syncedLyrics: string;
}

export interface HistoryItem {
  id: string;
  userId: string;
  songId: string;
  playedAt: string;
  songDetails: Song;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  imageUrl: string;
}

// ================= PUBLIC =================

export const getTrendingSongs = (limit = 10) =>
  publicApi.get(`/songs/trending`, { params: { limit } });

export const searchPublicSongs = (query: string) =>
  publicApi.get(`/search`, { params: { q: query } });

export const getSongInfoAndIncrementView = (songId: string) =>
  publicApi.get(`/${songId}/info`);

export const getAllPublicSongs = () =>
  publicApi.get(`/songs/all`);

export const getAllCategories = () =>
  publicApi.get(`/categories`);

// ================= LYRICS =================

// Backend lyrics service (riêng API v1)
export const getLyrics = (
  track: string,
  artist: string,
  album?: string,
  duration?: number
) => {
  return axios.get<LyricsResponse>(`${BASE_URL}/api/v1/lyrics`, {
    params: {
      track,
      artist,
      duration: duration ? Math.floor(duration) : undefined
    },
    headers: {
      "ngrok-skip-browser-warning": "true"
    }
  });
};

// ================= HISTORY =================

export const recordSongPlay = (songId: string, userId: string) => {
  const token = sessionStorage.getItem("accessToken");

  return axios.post(
    `${BASE_URL}/api/history/${songId}`,
    {},
    {
      headers: {
        currentUserId: userId,
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true"
      }
    }
  );
};

export const getUserHistory = (userId: string) =>
  axios.get<HistoryItem[]>(`${BASE_URL}/api/history/me`, {
    headers: {
      currentUserId: userId,
      "ngrok-skip-browser-warning": "true"
    }
  });

export const clearUserHistory = (userId: string) =>
  axios.delete(`${BASE_URL}/api/history/me`, {
    headers: {
      currentUserId: userId,
      "ngrok-skip-browser-warning": "true"
    }
  });
