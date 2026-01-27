export interface Song {
  id: string; // Changed from number to string to match backend UUID format
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  audioUrl?: string; // URL for audio streaming
  isLiked?: boolean;
  size: string;
  quality: string;
  lyrics?: { time: number; text: string }[];
}

export interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  likedSongs: string[]; // Changed from number[] to string[]
  songs: Song[];
  playlists: any[]; // Thêm dòng này
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setProgress: (progress: number) => void;
  seekTo: (progressPercent: number) => void; // Add seek function
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (songId: string) => void; // Changed from number to string
  nextSong: () => void;
  prevSong: () => void;
  playSong: (song: Song) => void;
  createPlaylist: (name: string) => Promise<any>; // Thêm dòng này
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>; // Thêm dòng này
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>; // New function
  deletePlaylist: (playlistId: string) => Promise<void>; // Delete playlist function
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}