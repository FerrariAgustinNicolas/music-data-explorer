import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArtistHeader from "../components/ArtistHeader";
import StatCards from "../components/StatCards";
import ErrorState from "../components/ErrorState";
import AlbumTrackDurationChart from "../components/AlbumTrackDurationChart";
import { fetchAlbumOverview } from "../api/lastfm";
import type { AlbumOverviewResponse } from "../types";

const AlbumPage = () => {
  const { artist, name } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = (location.state as { from?: { q: string; mode: "artist" | "album" } } | null)?.from;
  const [data, setData] = useState<AlbumOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async () => {
    if (!artist || !name) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const overview = await fetchAlbumOverview(artist, name, controller.signal);
      setData(overview);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message || "Failed to load album");
    } finally {
      setIsLoading(false);
    }
  }, [artist, name]);

  useEffect(() => {
    loadData();
    return () => controllerRef.current?.abort();
  }, [loadData]);

  const tracks = useMemo(() => data?.tracks ?? [], [data]);
  const formatDuration = useCallback((seconds?: number) => {
    if (!seconds || seconds <= 0) return "--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);
  const durationStats = useMemo(() => {
    if (!data) return null;
    const withDuration = data.tracks.filter((track) => track.duration && track.duration > 0);
    if (withDuration.length === 0) return null;
    const sorted = [...withDuration].sort((a, b) => a.duration - b.duration);
    return {
      shortest: sorted[0],
      longest: sorted[sorted.length - 1],
    };
  }, [data]);

  return (
    <div className="min-h-screen px-6 py-10">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Album overview</p>
          <h1 className="font-display text-3xl">Music Data Explorer</h1>
        </div>
        <button
          onClick={() => {
            if (fromState?.q) {
              navigate(`/?q=${encodeURIComponent(fromState.q)}&mode=${fromState.mode}`);
              return;
            }
            navigate("/");
          }}
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-glow"
        >
          Back to search
        </button>
      </header>

      <main className="max-w-6xl mx-auto flex flex-col gap-6">
        {(isLoading || (!data && !error)) && (
          <div className="glass rounded-2xl p-10 flex flex-col items-center gap-4">
            <div className="spinner" />
            <p className="text-sm text-slate-400">Loading album details...</p>
          </div>
        )}
        {error && !isLoading && <ErrorState message={error} onRetry={loadData} />}

        {!isLoading && data && (
          <>
            <ArtistHeader
              name={`${data.album.name} - ${data.album.artist}`}
              image={data.album.image}
              bioSummary={data.album.summary}
            />
            <StatCards listeners={data.album.stats.listeners} playcount={data.album.stats.playcount} />

            <section className="glass rounded-2xl p-6">
              <h2 className="font-display text-2xl mb-4">Top tags</h2>
              <div className="flex flex-wrap gap-2">
                {data.tags.slice(0, 8).map((tag) => (
                  <span key={tag.name} className="rounded-full bg-slate-800 px-3 py-1 text-sm">
                    {tag.name}
                  </span>
                ))}
              </div>
            </section>

            <section className="glass rounded-2xl p-6">
              <h2 className="font-display text-2xl mb-4">Tracks</h2>
              <div className="grid gap-3">
                {tracks.map((track) => (
                  <div key={track.name} className="flex items-center justify-between text-sm">
                    <span>
                      {track.rank}. {track.name}
                    </span>
                    <span className="text-slate-400">
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <AlbumTrackDurationChart tracks={tracks} />

            <section className="glass rounded-2xl p-6">
              <h2 className="font-display text-2xl mb-4">Longest vs shortest tracks</h2>
              {durationStats ? (
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Shortest: {durationStats.shortest.name}</span>
                    <span className="text-slate-400">
                      {formatDuration(durationStats.shortest.duration)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Longest: {durationStats.longest.name}</span>
                    <span className="text-slate-400">
                      {formatDuration(durationStats.longest.duration)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No duration data available for this album.</p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AlbumPage;
