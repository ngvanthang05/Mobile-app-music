import { publicApi, privateApi, getAuthConfig } from "./baseApi";

export interface Artist {
  id: string;
  name: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  followerCount?: number;
  verified: boolean;
  bio?: string;
}

// ================= PUBLIC =================

export const getAllArtists = () =>
  publicApi.get("/artists");

export const getPublicArtistProfile = (id: string) =>
  publicApi.get(`/artists/${id}`);

export const getArtistsByGenre = (slug: string) =>
  publicApi.get(`/artists/genre/${slug}`);

export const searchArtists = (q: string) =>
  publicApi.get(`/artists/search`, { params: { q } });

export const getSongsByArtist = (artistId: string) =>
  publicApi.get(`/songs/artists/${artistId}`);

export const getAlbumsByArtist = (artistId: string) =>
  publicApi.get(`/albums/artists/${artistId}`);

// ================= PRIVATE =================

export const getCurrentArtistProfile = (userId: string) =>
  privateApi.get(`/artist/me`, getAuthConfig(userId));

export const updateArtistProfile = (userId: string, data: any) =>
  privateApi.put(`/artist/me`, data, getAuthConfig(userId));

export const createArtistByAdmin = (userId: string, artistName: string) =>
  privateApi.post(
    `/artist/admin/create`,
    null,
    {
      params: { userId, artistName },
      ...getAuthConfig()
    }
  );
