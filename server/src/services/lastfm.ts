import axios from "axios";
import type {
  ArtistOverviewResponse,
  ArtistSearchResult,
  AlbumSearchResult,
  ArtistInfo,
  AlbumInfo,
  AlbumOverviewResponse,
  AlbumTrack,
  Tag,
  Track,
  SimilarArtist,
  OutliersInsight,
  Insights,
} from "../types";
import { AppError } from "../utils/errors";

const LASTFM_BASE_URL = "https://ws.audioscrobbler.com/2.0/";

const apiKey = process.env.LASTFM_API_KEY;
if (!apiKey) {
  console.warn("LASTFM_API_KEY is not set. Requests will fail.");
}

const client = axios.create({
  baseURL: LASTFM_BASE_URL,
  timeout: 10000,
});

const PLACEHOLDER_HASHES = [
  "2a96cbd8b46e442fc41c2b86b821562f", // common Last.fm placeholder
];

const normalizeImageUrl = (url: string): string => url.replace(/^http:/, "https:");

const isPlaceholderImage = (url: string): boolean =>
  PLACEHOLDER_HASHES.some((hash) => url.includes(hash)) || url.endsWith("/star.png");

const getImageUrl = (images: Array<{ "#text": string; size: string }>): string | null => {
  const preferred = ["mega", "extralarge", "large", "medium", "small"];
  for (const size of preferred) {
    const match = images.find((img) => img.size === size && img["#text"]);
    if (match?.["#text"]) {
      const normalized = normalizeImageUrl(match["#text"]);
      if (!isPlaceholderImage(normalized)) return normalized;
    }
  }
  return null;
};

const toNumber = (value: string | number | undefined): number => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizeDurationSeconds = (value: number): number => {
  if (!value) return 0;
  // Last.fm track.getInfo duration is in milliseconds.
  // If it looks too large for seconds, convert from ms.
  return value > 10_000 ? Math.round(value / 1000) : value;
};

const fetchArtistImage = async (artistName: string): Promise<string | null> => {
  const { data } = await client.get("/", {
    params: {
      method: "artist.getInfo",
      artist: artistName,
      api_key: apiKey,
      format: "json",
      autocorrect: 1,
    },
  });

  const info = data?.artist;
  if (!info?.image) return null;
  return getImageUrl(info.image) ?? null;
};

const fetchDeezerArtistImage = async (artistName: string): Promise<string | null> => {
  const { data } = await axios.get("https://api.deezer.com/search/artist", {
    params: {
      q: artistName,
      limit: 1,
    },
    timeout: 8000,
  });

  const artist = data?.data?.[0];
  if (!artist) return null;

  const url =
    artist?.picture_xl ||
    artist?.picture_big ||
    artist?.picture_medium ||
    artist?.picture ||
    null;

  return url ? normalizeImageUrl(url) : null;
};

export const searchArtist = async (query: string): Promise<ArtistSearchResult[]> => {
  if (!apiKey) throw new AppError("Missing Last.fm API key", 500, "CONFIG_ERROR");

  const { data } = await client.get("/", {
    params: {
      method: "artist.search",
      artist: query,
      api_key: apiKey,
      format: "json",
      limit: 10,
      autocorrect: 1,
    },
  });

  const list = data?.results?.artistmatches?.artist ?? [];
  const results: ArtistSearchResult[] = list
    .map((artist: any) => ({
      name: artist?.name ?? "",
      mbid: artist?.mbid ?? "",
      url: artist?.url ?? "",
      image: getImageUrl(artist?.image ?? []),
      listeners: toNumber(artist?.listeners),
      streamable: artist?.streamable,
    }))
    .sort((a: ArtistSearchResult, b: ArtistSearchResult) => b.listeners - a.listeners);

  const enrichTargets = results.filter((artist) => !artist.image).slice(0, 5);
  if (enrichTargets.length === 0) return results;

  const enrichedImages = await Promise.all(
    enrichTargets.map(async (artist) => {
      try {
        const lastfmImage = await fetchArtistImage(artist.name);
        if (lastfmImage) return { name: artist.name, image: lastfmImage };

        const deezerImage = await fetchDeezerArtistImage(artist.name);
        return { name: artist.name, image: deezerImage };
      } catch {
        return { name: artist.name, image: null };
      }
    })
  );

  const imageMap = new Map(enrichedImages.map((item) => [item.name, item.image]));
  return results.map((artist) => ({
    ...artist,
    image: artist.image ?? imageMap.get(artist.name) ?? null,
  }));
};

export const searchAlbum = async (query: string): Promise<AlbumSearchResult[]> => {
  if (!apiKey) throw new AppError("Missing Last.fm API key", 500, "CONFIG_ERROR");

  const { data } = await client.get("/", {
    params: {
      method: "album.search",
      album: query,
      api_key: apiKey,
      format: "json",
      limit: 10,
      autocorrect: 1,
    },
  });

  const list = data?.results?.albummatches?.album ?? [];
  return list.map((album: any) => ({
    name: album?.name ?? "",
    artist: album?.artist ?? "",
    mbid: album?.mbid ?? "",
    url: album?.url ?? "",
    image: getImageUrl(album?.image ?? []),
    playcount: toNumber(album?.playcount),
  }));
};

export const getAlbumOverview = async (artistName: string, albumName: string): Promise<AlbumOverviewResponse> => {
  if (!apiKey) throw new AppError("Missing Last.fm API key", 500, "CONFIG_ERROR");

  const { data } = await client.get("/", {
    params: {
      method: "album.getInfo",
      artist: artistName,
      album: albumName,
      api_key: apiKey,
      format: "json",
      autocorrect: 1,
    },
  });

  const info = data?.album;
  if (!info) throw new AppError("Album not found", 404, "NOT_FOUND");

  const albumImage = getImageUrl(info?.image ?? []) ?? (await fetchDeezerArtistImage(artistName));

  const album: AlbumInfo = {
    name: info?.name ?? albumName,
    artist: info?.artist ?? artistName,
    image: albumImage,
    summary: info?.wiki?.summary ? info.wiki.summary.replace(/<[^>]+>/g, "") : null,
    stats: {
      playcount: toNumber(info?.playcount),
      listeners: toNumber(info?.listeners),
    },
  };

  const tags: Tag[] = (info?.tags?.tag ?? []).map((tag: any) => ({
    name: tag?.name ?? "",
    count: toNumber(tag?.count),
  }));

  const tracks: AlbumTrack[] = (info?.tracks?.track ?? []).map((track: any, index: number) => ({
    name: track?.name ?? "",
    duration: toNumber(track?.duration),
    rank: toNumber(track?.["@attr"]?.rank ?? index + 1),
  }));

  return { album, tags, tracks };
};

const buildOutliers = (tracks: Track[]): OutliersInsight => {
  if (tracks.length < 3) {
    return {
      method: "ratio",
      threshold: 1.5,
      items: [],
      explanation: "Not enough data to compute outliers.",
    };
  }

  const values = tracks.map((track) => track.playcount);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);

  if (!std || Number.isNaN(std)) {
    const items = tracks
      .map((track) => ({
        name: track.name,
        score: track.listeners ? track.playcount / track.listeners : 0,
        metric: "playcount/listeners",
      }))
      .filter((item) => item.score > 1.5);

    return {
      method: "ratio",
      threshold: 1.5,
      items,
      explanation: "Using playcount/listeners ratio due to low variance in playcounts.",
    };
  }

  const items = tracks
    .map((track) => ({
      name: track.name,
      score: (track.playcount - mean) / std,
      metric: "z-score",
    }))
    .filter((item) => item.score > 1.5);

  return {
    method: "zscore",
    threshold: 1.5,
    items,
    explanation: "Tracks with z-score above 1.5 are unusually popular compared to the top tracks set.",
  };
};

const buildFunFacts = (
  topTags: Tag[],
  outliers: OutliersInsight,
  similarArtists: SimilarArtist[]
): string[] => {
  const facts: string[] = [];
  if (topTags[0]) {
    facts.push(`Top tag: ${topTags[0].name}`);
  }
  if (outliers.items[0]) {
    facts.push(`Outlier track: ${outliers.items[0].name}`);
  }
  if (similarArtists.length >= 3) {
    const names = similarArtists.slice(0, 3).map((artist) => artist.name).join(", ");
    facts.push(`Similar to: ${names}`);
  }
  return facts;
};

const buildTrendInsight = (similarArtists: SimilarArtist[]): Insights["trend"] => {
  if (!similarArtists.length) {
    return {
      type: "unavailable",
      message:
        "Last.fm does not provide per-artist time series without a user context. Showing alternative insights instead.",
    };
  }

  const avgMatch =
    similarArtists.reduce((sum, artist) => sum + artist.match, 0) / similarArtists.length;

  return {
    type: "alternative",
    message: `Average similarity match for related artists: ${avgMatch.toFixed(2)}.`,
    data: { averageMatch: Number(avgMatch.toFixed(2)) },
  };
};

export const getArtistOverview = async (artistName: string): Promise<ArtistOverviewResponse> => {
  if (!apiKey) throw new AppError("Missing Last.fm API key", 500, "CONFIG_ERROR");

  const [infoRes, tagsRes, tracksRes, similarRes] = await Promise.all([
    client.get("/", {
      params: {
        method: "artist.getInfo",
        artist: artistName,
        api_key: apiKey,
        format: "json",
      },
    }),
    client.get("/", {
      params: {
        method: "artist.getTopTags",
        artist: artistName,
        api_key: apiKey,
        format: "json",
      },
    }),
    client.get("/", {
      params: {
        method: "artist.getTopTracks",
        artist: artistName,
        api_key: apiKey,
        format: "json",
        limit: 100,
      },
    }),
    client.get("/", {
      params: {
        method: "artist.getSimilar",
        artist: artistName,
        api_key: apiKey,
        format: "json",
        limit: 6,
      },
    }),
  ]);

  const info = infoRes.data?.artist;
  if (!info) throw new AppError("Artist not found", 404, "NOT_FOUND");

  let artistImage = getImageUrl(info?.image ?? []);
  if (!artistImage) {
    try {
      artistImage = await fetchDeezerArtistImage(artistName);
    } catch {
      artistImage = null;
    }
  }

  const artist: ArtistInfo = {
    name: info?.name ?? artistName,
    image: artistImage,
    bioSummary: info?.bio?.summary ? info.bio.summary.replace(/<[^>]+>/g, "") : null,
    stats: {
      listeners: toNumber(info?.stats?.listeners),
      playcount: toNumber(info?.stats?.playcount),
    },
  };

  const topTags: Tag[] = (tagsRes.data?.toptags?.tag ?? []).map((tag: any) => ({
    name: tag?.name ?? "",
    count: toNumber(tag?.count),
  }));

  const totalTagCount = topTags.reduce((sum, tag) => sum + tag.count, 0) || 1;
  const tagDistribution = topTags.map((tag) => ({
    ...tag,
    percent: Number(((tag.count / totalTagCount) * 100).toFixed(2)),
  }));

  const allTopTracks: Track[] = (tracksRes.data?.toptracks?.track ?? [])
    .map((track: any, index: number) => ({
      name: track?.name ?? "",
      playcount: toNumber(track?.playcount),
      listeners: toNumber(track?.listeners),
      url: track?.url ?? "",
      rank: toNumber(track?.["@attr"]?.rank ?? index + 1),
    }))
    .sort((a: Track, b: Track) => b.playcount - a.playcount)
    .map((track: Track, index: number) => ({ ...track, rank: index + 1 }));

  const durationTargets = allTopTracks.slice(0, 50);
  const durationResults = await Promise.all(
    durationTargets.map(async (track) => {
      try {
        const { data } = await client.get("/", {
          params: {
            method: "track.getInfo",
            artist: artistName,
            track: track.name,
            api_key: apiKey,
            format: "json",
            autocorrect: 1,
          },
        });
        const durationRaw = toNumber(data?.track?.duration);
        const duration = normalizeDurationSeconds(durationRaw);
        return duration > 0 ? duration : undefined;
      } catch {
        return undefined;
      }
    })
  );

  const allTopTracksWithDuration = allTopTracks.map((track, index) => ({
    ...track,
    duration: index < durationTargets.length ? durationResults[index] : undefined,
  }));

  const topTracks = allTopTracksWithDuration.slice(0, 10);

  const durationCandidates = allTopTracksWithDuration.filter(
    (track) => track.duration && track.duration > 0
  );
  const durationSorted = [...durationCandidates].sort(
    (a, b) => (a.duration ?? 0) - (b.duration ?? 0)
  );
  const durationExtremes =
    durationSorted.length > 0
      ? {
          shortest: durationSorted[0],
          longest: durationSorted[durationSorted.length - 1],
        }
      : { shortest: null, longest: null };

  const similarArtists: SimilarArtist[] = (similarRes.data?.similarartists?.artist ?? []).map((artist: any) => ({
    name: artist?.name ?? "",
    image: getImageUrl(artist?.image ?? []),
    match: Number(Number(artist?.match ?? 0).toFixed(2)),
    url: artist?.url ?? "",
  }));

  const outliers = buildOutliers(topTracks);
  const funFacts = buildFunFacts(topTags, outliers, similarArtists);
  const trend = buildTrendInsight(similarArtists);

  return {
    artist,
    topTags,
    topTracks,
    similarArtists,
    insights: {
      popularitySpread: topTracks,
      tagDistribution,
      outliers,
      funFacts,
      trend,
      durationExtremes,
    },
  };
};
