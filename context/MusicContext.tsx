import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import axios from 'axios';
import { Song, MusicContextType } from '../types';
import { BASE_URL } from '../api/baseApi';
import { fixStreamUrl } from '../utils/audioUrl';
import * as PlaylistAPI from '../api/playlistApi';
import { Audio } from 'expo-av';

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
  const [likedSongs, setLikedSongs] = useState<string[]>([]);

  // Audio player ref
  const soundRef = useRef<Audio.Sound | null>(null);

  // Sửa lỗi: PlaylistAPI (viết hoa) theo đúng tên import ở trên
  const [playlists, setPlaylists] = useState<PlaylistAPI.PlaylistDto[]>([]);

  // Initialize audio mode for background playback
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          interruptionModeIOS: 2, // Do not mix with other apps
          interruptionModeAndroid: 1, // Duck other apps
        });
        console.log("✅ Audio mode configured for background playback");
      } catch (error) {
        console.error("❌ Failed to setup audio mode:", error);
      }
    };

    setupAudio();
    loadSongs();
    loadUserPlaylists();
  }, []);

  // Load & play audio when song changes
  useEffect(() => {
    if (!currentSong) return;

    const loadAndPlay = async () => {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }

        const url = fixStreamUrl(currentSong.audioUrl || '');
        console.log("🎵 Loading audio:", url);

        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true }
        );

        soundRef.current = sound;
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded && status.durationMillis) {
            const percent = (status.positionMillis / status.durationMillis) * 100;
            setProgress(percent);

            if (status.didJustFinish) {
              nextSong();
            }
          }
        });
      } catch (err) {
        console.log("❌ Error loading audio:", err);
      }
    };

    loadAndPlay();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [currentSong]);

  // Play / Pause control
  useEffect(() => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.playAsync();
    } else {
      soundRef.current.pauseAsync();
    }
  }, [isPlaying]);

  const loadSongs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/public/songs/all`);

      const mapped: Song[] = res.data.map((s: any, index: number) => {
        // Preserve original ID as string (UUID from backend)
        const songId = s.id ? String(s.id) : `song-${index}`;

        return {
          id: songId, // Keep as string to match backend
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
      console.log("🔄 Adding song to playlist:", { playlistId, songId });
      const updated = await PlaylistAPI.addTrackToPlaylist(playlistId, songId, USER_ID);
      setPlaylists(prev => prev.map(p => p.id === playlistId ? updated : p));
      alert("Added to playlist!");
    } catch (err: any) {
      console.log("❌ Lỗi thêm nhạc vào playlist:", err);
      console.log("📊 Error details:", err.response?.data);
      alert("Failed to add song to playlist. Please try again!");
    }
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    try {
      console.log("🔄 Removing song from playlist:", { playlistId, songId });
      const updated = await PlaylistAPI.removeTrackFromPlaylist(playlistId, songId, USER_ID);
      setPlaylists(prev => prev.map(p => p.id === playlistId ? updated : p));
      alert("Removed from playlist!");
    } catch (err: any) {
      console.log("❌ Lỗi xóa nhạc khỏi playlist:", err);
      console.log("📊 Error details:", err.response?.data);
      alert("Failed to remove song from playlist. Please try again!");
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    try {
      console.log("🗑️ Deleting playlist:", playlistId);
      await PlaylistAPI.deletePlaylist(playlistId, USER_ID);
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      alert("Deleted playlist!");
    } catch (err: any) {
      console.log("❌ Lỗi xóa playlist:", err);
      console.log("📊 Error details:", err.response?.data);
      alert("Failed to delete playlist. Please try again!");
    }
  };

  // =====================
  // PLAYER CONTROLS
  // =====================
  const toggleLike = (songId: string) => {
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

  // Seek function - allows seeking to a specific position in the song
  const seekTo = async (progressPercent: number) => {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded || !status.durationMillis) return;

      const position = (progressPercent / 100) * status.durationMillis;
      await soundRef.current.setPositionAsync(position);
      setProgress(progressPercent);
    } catch (err) {
      console.log("❌ Error seeking:", err);
    }
  };
  return (
    <MusicContext.Provider
      value={{
        currentSong, isPlaying, progress, isShuffle, repeatMode, likedSongs, songs, playlists,
        setCurrentSong, setIsPlaying, setProgress, toggleShuffle, toggleRepeat, toggleLike, seekTo,
        nextSong, prevSong, playSong, createPlaylist, addSongToPlaylist, removeSongFromPlaylist, deletePlaylist,
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