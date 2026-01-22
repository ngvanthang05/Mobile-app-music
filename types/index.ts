export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
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
  likedSongs: number[];
  songs: Song[];
  playlists: any[]; // Thêm dòng này
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setProgress: (progress: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (songId: number) => void;
  nextSong: () => void;
  prevSong: () => void;
  playSong: (song: Song) => void;
  createPlaylist: (name: string) => Promise<any>; // Thêm dòng này
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>; // Thêm dòng này
}