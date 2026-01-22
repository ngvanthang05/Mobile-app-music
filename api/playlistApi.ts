import { playlistApi, getPlaylistAuthConfig } from "./baseApi";

// ================= TYPES =================

export interface PlaylistDto {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName?: string | null;
  publicPlaylist: boolean;
  type: "user" | "editorial" | "system";
  tracks: string[];
  coverImage?: string | null;
  songCount?: number;
  updatedAt?: string | null;
  songDetails?: any[];
}

export interface PlaylistRequest {
  name: string;
  description?: string;
  type: "user" | "editorial" | "system";
  isPublic?: boolean;
  tracks?: string[];
}

// ================= API FUNCTIONS =================

// CREATE PLAYLIST
export const createPlaylist = async (
  request: PlaylistRequest,
  currentUserId: string,
  isAdmin: boolean = false
): Promise<PlaylistDto> => {
  const res = await playlistApi.post("", request, getPlaylistAuthConfig(currentUserId, isAdmin));
  return res.data;
};

// UPDATE PLAYLIST
export const updatePlaylist = async (
  playlistId: string,
  request: PlaylistRequest,
  currentUserId: string,
  isAdmin: boolean = false
): Promise<PlaylistDto> => {
  const res = await playlistApi.put(`/${playlistId}`, request, getPlaylistAuthConfig(currentUserId, isAdmin));
  return res.data;
};

// DELETE PLAYLIST
export const deletePlaylist = async (
  playlistId: string,
  currentUserId: string,
  isAdmin: boolean = false
): Promise<void> => {
  await playlistApi.delete(`/${playlistId}`, getPlaylistAuthConfig(currentUserId, isAdmin));
};

// GET USER PLAYLISTS
export const getUserPlaylists = async (ownerId: string): Promise<PlaylistDto[]> => {
  const res = await playlistApi.get<PlaylistDto[]>(`/user/${ownerId}`);
  return res.data;
};

// GET PUBLIC PLAYLIST DETAILS
export const getPublicPlaylistDetails = async (playlistId: string): Promise<PlaylistDto> => {
  const res = await playlistApi.get<PlaylistDto>(`/public/${playlistId}`);
  return res.data;
};

// GET ALL PUBLIC PLAYLISTS
export const getPublicPlaylists = async (): Promise<PlaylistDto[]> => {
  const res = await playlistApi.get<PlaylistDto[]>(`/public`);
  return res.data;
};

// ADD TRACK TO PLAYLIST
export const addTrackToPlaylist = async (
  playlistId: string,
  trackId: string,
  currentUserId: string,
  isAdmin: boolean = false
): Promise<PlaylistDto> => {
  const res = await playlistApi.post(
    `/${playlistId}/tracks/${trackId}`,
    null,
    getPlaylistAuthConfig(currentUserId, isAdmin)
  );
  return res.data;
};

// REMOVE TRACK FROM PLAYLIST
export const removeTrackFromPlaylist = async (
  playlistId: string,
  trackId: string,
  currentUserId: string
): Promise<PlaylistDto> => {
  const res = await playlistApi.delete(
    `/${playlistId}/tracks/${trackId}`,
    getPlaylistAuthConfig(currentUserId)
  );
  return res.data;
};
