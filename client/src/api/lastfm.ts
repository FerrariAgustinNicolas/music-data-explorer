import type {
  ArtistOverviewResponse,
  ArtistSearchResult,
  AlbumSearchResult,
  AlbumOverviewResponse,
} from "../types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000/api";

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.error?.message || "Request failed";
    throw new Error(message);
  }
  return (await response.json()) as T;
};

export const searchArtists = async (
  query: string,
  signal?: AbortSignal
): Promise<ArtistSearchResult[]> => {
  const url = `${API_BASE}/search/artist?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { signal });
  return handleResponse(response);
};

export const searchAlbums = async (
  query: string,
  signal?: AbortSignal
): Promise<AlbumSearchResult[]> => {
  const url = `${API_BASE}/search/album?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { signal });
  return handleResponse(response);
};

export const fetchAlbumOverview = async (
  artist: string,
  album: string,
  signal?: AbortSignal
): Promise<AlbumOverviewResponse> => {
  const url = `${API_BASE}/album/overview?artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}`;
  const response = await fetch(url, { signal });
  return handleResponse(response);
};

export const fetchArtistOverview = async (
  name: string,
  signal?: AbortSignal
): Promise<ArtistOverviewResponse> => {
  const url = `${API_BASE}/artist/${encodeURIComponent(name)}/overview`;
  const response = await fetch(url, { signal });
  return handleResponse(response);
};
