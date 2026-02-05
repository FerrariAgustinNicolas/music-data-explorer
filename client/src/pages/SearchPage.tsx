import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import ArtistSearchResults from "../components/ArtistSearchResults";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { searchArtists, searchAlbums } from "../api/lastfm";
import type { ArtistSearchResult, AlbumSearchResult } from "../types";

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = (searchParams.get("mode") === "album" ? "album" : "artist") as
    | "artist"
    | "album";
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<"artist" | "album">(initialMode);
  const [results, setResults] = useState<ArtistSearchResult[] | AlbumSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"center" | "top">("center");
  const [isHidingResults, setIsHidingResults] = useState(false);
  const [suppressLoading, setSuppressLoading] = useState(false);
  const [suppressButtonLoading, setSuppressButtonLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const lastSearchKeyRef = useRef<string>("");
  const lastParamsKeyRef = useRef<string>("");
  const switchingModeRef = useRef(false);
  const [seenSearches, setSeenSearches] = useState<Record<string, boolean>>({});

  const handleSearch = useCallback(
    async (
      overrideMode?: "artist" | "album",
      syncUrl = true,
      overrideQuery?: string,
      silent = false
    ) => {
    const trimmed = (overrideQuery ?? query).trim();
    if (!trimmed) {
      setError("Type a name to start searching.");
      setResults([]);
      if (syncUrl) {
        setSearchParams({ mode });
      }
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    if (!silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const activeMode = overrideMode ?? mode;
      lastSearchKeyRef.current = `${activeMode}|${trimmed}`;
      if (syncUrl) {
        setSearchParams({ q: trimmed, mode: activeMode });
      }
      const data =
        activeMode === "artist"
          ? await searchArtists(trimmed, controller.signal)
          : await searchAlbums(trimmed, controller.signal);
      setResults(data);
      setSeenSearches((prev) => ({ ...prev, [`${activeMode}|${trimmed}`]: true }));
      if (switchingModeRef.current) {
        setIsHidingResults(false);
        switchingModeRef.current = false;
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message || "Failed to search artists");
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
      setIsTransitioning(false);
    }
  },
  [query, mode, setSearchParams]
  );

  const transitionAndSearch = useCallback(
    (nextMode: "artist" | "album") => {
      setMode(nextMode);
      setError(null);
      setIsTransitioning(true);
      setIsHidingResults(true);
      switchingModeRef.current = true;
      setSuppressLoading(true);
      setSuppressButtonLoading(true);
      const trimmed = query.trim();
      const hasSeen = seenSearches[`${nextMode}|${trimmed}`];
      setSearchParams(trimmed ? { q: trimmed, mode: nextMode } : { mode: nextMode });

      const hasQuery = query.trim().length > 0;
      if (!hasQuery) {
        setResults([]);
        setIsTransitioning(false);
        setIsHidingResults(false);
        setLayoutMode("center");
        setSuppressLoading(false);
        setSuppressButtonLoading(false);
        switchingModeRef.current = false;
        return;
      }

      window.setTimeout(() => {
        setLayoutMode("top");
        handleSearch(nextMode, false, undefined, true);
        if (!hasSeen) {
          setSuppressLoading(false);
        }
      }, 250);
    },
    [handleSearch, query, setSearchParams, seenSearches]
  );

  useEffect(() => {
    const qParam = searchParams.get("q") ?? "";
    const modeParam = searchParams.get("mode");
    const nextMode = modeParam === "album" ? "album" : "artist";
    const nextKey = `${nextMode}|${qParam.trim()}`;

    if (lastParamsKeyRef.current === nextKey) return;
    lastParamsKeyRef.current = nextKey;

    if (nextMode !== mode) {
      setMode(nextMode);
    }
    if (qParam !== query) {
      // Only sync query from URL if it's actually different and not empty
      // This prevents overwriting user input during mode transitions
      if (qParam.trim() || !query.trim()) {
        setQuery(qParam);
      }
    }
    setError(null);

    if (qParam.trim()) {
      if (lastSearchKeyRef.current !== nextKey) {
        handleSearch(nextMode, false, qParam, true);
      }
    } else {
      setResults([]);
      lastSearchKeyRef.current = "";
    }
  }, [searchParams, handleSearch, query]);

  useEffect(() => {
    if (isLoading || isTransitioning) return;
    if (error || results.length > 0) {
      setLayoutMode("top");
      setSuppressLoading(false);
      setSuppressButtonLoading(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setLayoutMode("center");
      setSuppressLoading(false);
      setSuppressButtonLoading(false);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [isLoading, isTransitioning, error, results.length]);

  const shouldCenter = layoutMode === "center" && results.length === 0;

  const currentKey = `${mode}|${query.trim()}`;
  const shouldShowLoadingSkeleton =
    (isTransitioning && !seenSearches[currentKey]) ||
    (isHidingResults && !seenSearches[currentKey]) ||
    (isLoading && results.length === 0 && !isTransitioning && !suppressLoading);
  const shouldShowEmptyState =
    !isLoading &&
    !error &&
    results.length === 0 &&
    !shouldShowLoadingSkeleton &&
    !isTransitioning &&
    !isHidingResults;

  return (
    <div
      className={`min-h-screen px-6 py-10 transition-all duration-700 ease-in-out ${
        shouldCenter ? "content-center" : ""
      }`}
    >
      <header className="max-w-5xl mx-auto mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Music Data Explorer</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">Discover hidden patterns in music data</h1>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(["artist", "album"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                transitionAndSearch(tab);
              }}
              aria-pressed={mode === tab}
              className={`rounded-full px-4 py-2 text-sm border transition ${
                mode === tab
                  ? "bg-glow text-ink border-transparent"
                  : "border-slate-600 text-slate-300 hover:border-glow"
              }`}
            >
              {tab === "artist" ? "Artists" : "Albums"}
            </button>
          ))}
        </div>
        {isTransitioning && !suppressLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            Loading new results...
          </div>
        )}
        <SearchBar
          value={query}
          onChange={(value) => {
            setQuery(value);
            if (!value.trim()) {
              controllerRef.current?.abort();
              setResults([]);
              setError(null);
              setSearchParams({ mode });
            }
          }}
          onSubmit={handleSearch}
          isLoading={isLoading && !suppressButtonLoading}
        />
      </header>

      <main className="max-w-5xl mx-auto">
        {shouldShowLoadingSkeleton && <LoadingSkeleton lines={4} />}
        {error && !isLoading && <ErrorState message={error} />}
        {shouldShowEmptyState && (
          <EmptyState message="Search results will show up here. Try Radiohead, Duki, or Adele." />
        )}
        {!isLoading && !error && results.length > 0 && !isHidingResults && (
          <div
            className={`transition-all duration-500 ${
              isTransitioning || isHidingResults ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            }`}
            data-testid="results-list"
          >
            <ArtistSearchResults
              results={results}
              mode={mode}
              onSelectArtist={(name) =>
                navigate(`/artist/${encodeURIComponent(name)}`, {
                  state: { from: { q: query.trim(), mode } },
                })
              }
              onOpenAlbum={(artist, album) =>
                navigate(`/album/${encodeURIComponent(artist)}/${encodeURIComponent(album)}`, {
                  state: { from: { q: query.trim(), mode } },
                })
              }
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
