import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import { Song, MusicContextType } from '../types';
import { BASE_URL } from '../api/baseApi';
import { fixStreamUrl } from '../utils/audioUrl';
import * as PlaylistAPI from '../api/playlistApi';

const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Giả định ID người dùng (Trong thực tế nên lấy từ AuthContext)
const USER_ID = "user_test_123";

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [likedSongs, setLikedSongs] = useState<number[]>([]);

  // Sửa lỗi: PlaylistAPI (viết hoa) theo đúng tên import ở trên
  const [playlists, setPlaylists] = useState<PlaylistAPI.PlaylistDto[]>([]);

  useEffect(() => {
    loadSongs();
    loadUserPlaylists();
  }, []);

  const loadSongs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/public/songs/all`);

      const mapped: Song[] = res.data.map((s: any, index: number) => {
        // Ép kiểu ID một cách an toàn
        const safeId = s.id ? Number(s.id) : index;

        return {
          id: isNaN(safeId) ? index : safeId, // Nếu vẫn là NaN thì dùng index
          title: s.title || "Unknown Title",
          artist: s.artistName || "Unknown Artist",
          cover: s.coverUrl || "https://via.placeholder.com/150",
          album: s.albumName || "Single",
          duration: formatDuration(s.duration),
          audioUrl: fixStreamUrl(s.streamUrl || s.fileUrl),
        };
      });

      setSongs(mapped);
    } catch (err) {
      console.log("❌ Lỗi load bài hát:", err);
    }
  };
  const formatDuration = (seconds: number) => {
    if (!seconds) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // =====================
  // PLAYLIST CONTROLS (Đã sửa lỗi userId)
  // =====================
  const loadUserPlaylists = async () => {
    try {
      const data = await PlaylistAPI.getUserPlaylists(USER_ID);
      setPlaylists(data);
    } catch (err) {
      console.log("❌ Lỗi load playlist:", err);
    }
  };

  const createPlaylist = async (name: string) => {
    try {
      const newPlaylist = await PlaylistAPI.createPlaylist(
        { name, type: "user", isPublic: true, tracks: [] },
        USER_ID
      );
      setPlaylists(prev => [...prev, newPlaylist]);
      return newPlaylist;
    } catch (err) {
      console.log("❌ Lỗi tạo playlist:", err);
    }
  };

  const addSongToPlaylist = async (playlistId: string, songId: string) => {
    try {
      const updated = await PlaylistAPI.addTrackToPlaylist(playlistId, songId, USER_ID);
      setPlaylists(prev => prev.map(p => p.id === playlistId ? updated : p));
      alert("Đã thêm vào playlist!");
    } catch (err) {
      console.log("❌ Lỗi thêm nhạc vào playlist:", err);
    }
  };

  // =====================
  // PLAYER CONTROLS
  // =====================
  const toggleLike = (songId: number) => {
    setLikedSongs(prev =>
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId]
    );
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);
  };

  const nextSong = () => {
    if (!currentSong || songs.length === 0) return;
    const index = songs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (index + 1) % songs.length;
    playSong(songs[nextIndex]);
  };

  const prevSong = () => {
    if (!currentSong || songs.length === 0) return;
    const index = songs.findIndex(s => s.id === currentSong.id);
    const prevIndex = index === 0 ? songs.length - 1 : index - 1;
    playSong(songs[prevIndex]);
  };
  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => {
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(next);
  };
  return (
    <MusicContext.Provider
      value={{
        currentSong, isPlaying, progress, isShuffle, repeatMode, likedSongs, songs, playlists,
        setCurrentSong, setIsPlaying, setProgress, toggleShuffle, toggleRepeat, toggleLike,
        nextSong, prevSong, playSong, createPlaylist, addSongToPlaylist,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within MusicProvider');
  return context;
};