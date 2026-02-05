export type ImageSize = "small" | "medium" | "large" | "extralarge" | "mega";

export interface ImageEntry {
  "#text": string;
  size: ImageSize;
}

export interface ArtistSearchResult {
  name: string;
  mbid: string;
  url: string;
  image: string | null;
  listeners: number;
  streamable?: string;
}

export interface AlbumSearchResult {
  name: string;
  artist: string;
  mbid: string;
  url: string;
  image: string | null;
  playcount?: number;
}

export interface AlbumInfo {
  name: string;
  artist: string;
  image: string | null;
  summary: string | null;
  stats: {
    playcount: number;
    listeners: number;
  };
}

export interface AlbumTrack {
  name: string;
  duration: number;
  rank: number;
}

export interface AlbumOverviewResponse {
  album: AlbumInfo;
  tags: Tag[];
  tracks: AlbumTrack[];
}

export interface ArtistStats {
  listeners: number;
  playcount: number;
}

export interface ArtistInfo {
  name: string;
  image: string | null;
  bioSummary: string | null;
  stats: ArtistStats;
}

export interface Tag {
  name: string;
  count: number;
  percent?: number;
}

export interface Track {
  name: string;
  playcount: number;
  listeners: number;
  url: string;
  rank: number;
  duration?: number;
}

export interface SimilarArtist {
  name: string;
  image: string | null;
  match: number;
  url: string;
}

export interface OutlierItem {
  name: string;
  score: number;
  metric: string;
}

export interface OutliersInsight {
  method: "zscore" | "ratio";
  threshold: number;
  items: OutlierItem[];
  explanation: string;
}

export interface DurationInsight {
  shortest: Track | null;
  longest: Track | null;
}

export interface TrendInsight {
  type: "alternative" | "unavailable";
  message: string;
  data?: Record<string, number>;
}

export interface Insights {
  popularitySpread: Track[];
  tagDistribution: Tag[];
  outliers: OutliersInsight;
  funFacts: string[];
  trend: TrendInsight;
  durationExtremes?: DurationInsight;
}

export interface ArtistOverviewResponse {
  artist: ArtistInfo;
  topTags: Tag[];
  topTracks: Track[];
  similarArtists: SimilarArtist[];
  insights: Insights;
}
