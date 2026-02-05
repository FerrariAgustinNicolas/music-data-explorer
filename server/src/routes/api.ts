import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { searchArtist, searchAlbum, getArtistOverview, getAlbumOverview } from "../services/lastfm";
import { MemoryCache, buildCacheKey } from "../utils/cache";
import { AppError } from "../utils/errors";

const router = Router();
const cache = new MemoryCache();
const CACHE_TTL_MS = 10 * 60 * 1000;

router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

router.get(
  "/search/artist",
  asyncHandler(async (req, res) => {
    const query = req.query.q?.toString().trim() ?? "";
    if (!query) throw new AppError("Missing query parameter 'q'", 400, "VALIDATION_ERROR");

    const key = buildCacheKey("/search/artist", { q: query });
    const cached = cache.get(key);
    if (cached) {
      res.json(cached);
      return;
    }

    const results = await searchArtist(query);
    cache.set(key, results, CACHE_TTL_MS);
    res.json(results);
  })
);

router.get(
  "/search/album",
  asyncHandler(async (req, res) => {
    const query = req.query.q?.toString().trim() ?? "";
    if (!query) throw new AppError("Missing query parameter 'q'", 400, "VALIDATION_ERROR");

    const key = buildCacheKey("/search/album", { q: query });
    const cached = cache.get(key);
    if (cached) {
      res.json(cached);
      return;
    }

    const results = await searchAlbum(query);
    cache.set(key, results, CACHE_TTL_MS);
    res.json(results);
  })
);

router.get(
  "/artist/:name/overview",
  asyncHandler(async (req, res) => {
    const name = req.params.name?.toString().trim() ?? "";
    if (!name) throw new AppError("Missing artist name", 400, "VALIDATION_ERROR");

    const decodedName = decodeURIComponent(name);
    const key = buildCacheKey("/artist/overview", { name: decodedName });
    const cached = cache.get(key);
    if (cached) {
      res.json(cached);
      return;
    }

    const overview = await getArtistOverview(decodedName);
    cache.set(key, overview, CACHE_TTL_MS);
    res.json(overview);
  })
);


router.get(
  "/album/overview",
  asyncHandler(async (req, res) => {
    const artist = req.query.artist?.toString().trim() ?? "";
    const album = req.query.album?.toString().trim() ?? "";
    if (!artist || !album) {
      throw new AppError("Missing artist or album", 400, "VALIDATION_ERROR");
    }

    const key = buildCacheKey("/album/overview", { artist, album });
    const cached = cache.get(key);
    if (cached) {
      res.json(cached);
      return;
    }

    const overview = await getAlbumOverview(artist, album);
    cache.set(key, overview, CACHE_TTL_MS);
    res.json(overview);
  })
);

export default router;
