import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArtistHeader from "../components/ArtistHeader";
import StatCards from "../components/StatCards";
import TopTracksBarChart from "../components/TopTracksBarChart";
import TagDistributionChart from "../components/TagDistributionChart";
import ErrorState from "../components/ErrorState";
import { fetchArtistOverview } from "../api/lastfm";
import type { ArtistOverviewResponse } from "../types";

const ArtistPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = (location.state as { from?: { q: string; mode: "artist" | "album" } } | null)?.from;
  const [data, setData] = useState<ArtistOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [randomFact, setRandomFact] = useState<string[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async () => {
    if (!name) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const overview = await fetchArtistOverview(name, controller.signal);
      setData(overview);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message || "Failed to load artist");
    } finally {
      setIsLoading(false);
    }
  }, [name]);

  useEffect(() => {
    loadData();
    return () => controllerRef.current?.abort();
  }, [loadData]);

  const funFacts = data?.insights.funFacts ?? [];

  const handleRandomFact = () => {
    if (!funFacts.length) return;
    const shuffled = [...funFacts].sort(() => 0.5 - Math.random());
    const count = Math.min(3, Math.max(1, Math.floor(Math.random() * funFacts.length) + 1));
    setRandomFact(shuffled.slice(0, count));
  };

  const outliers = useMemo(() => data?.insights.outliers, [data]);
  const formatDuration = useCallback((seconds?: number) => {
    if (!seconds || seconds <= 0) return "--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const durationStats = useMemo(() => data?.insights.durationExtremes ?? null, [data]);

  return (
    <div className="min-h-screen px-6 py-10">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Artist overview</p>
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
        {isLoading && (
          <div className="glass rounded-2xl p-10 flex flex-col items-center gap-4">
            <div className="spinner" />
            <p className="text-sm text-slate-400">Loading artist insights...</p>
          </div>
        )}
        {error && !isLoading && <ErrorState message={error} onRetry={loadData} />}
        {!isLoading && !error && !data && (
          <div className="glass rounded-2xl p-10 flex flex-col items-center gap-4">
            <div className="spinner" />
            <p className="text-sm text-slate-400">Loading artist insights...</p>
          </div>
        )}

        {!isLoading && data && (
          <>
            <ArtistHeader name={data.artist.name} image={data.artist.image} bioSummary={data.artist.bioSummary} />
            <StatCards listeners={data.artist.stats.listeners} playcount={data.artist.stats.playcount} />

            <section className="glass rounded-2xl p-6">
              <h2 className="font-display text-2xl mb-4">Top tags</h2>
              <div className="flex flex-wrap gap-2">
                {data.topTags.slice(0, 8).map((tag) => (
                  <span key={tag.name} className="rounded-full bg-slate-800 px-3 py-1 text-sm">
                    {tag.name}
                  </span>
                ))}
              </div>
            </section>

            <section className="glass rounded-2xl p-6">
              <h2 className="font-display text-2xl mb-4">Top tracks</h2>
              <div className="grid gap-3">
                {data.topTracks.map((track) => (
                  <div key={track.name} className="flex items-center justify-between text-sm">
                    <span>{track.rank}. {track.name}</span>
                    <span className="text-slate-400">
                      Playcount {track.playcount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass rounded-2xl p-6">
              <h2 className="font-display text-2xl mb-4">Longest vs shortest tracks</h2>
              {durationStats?.shortest && durationStats?.longest ? (
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
                <p className="text-sm text-slate-400">No duration data available for this artist.</p>
              )}
            </section>

            <section className="card-grid">
              <TopTracksBarChart tracks={data.insights.popularitySpread} />
              <TagDistributionChart tags={data.insights.tagDistribution} />
            </section>

            <section className="card-grid">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display text-xl mb-4">Outliers / rare hits</h3>
                <p className="text-sm text-slate-400 mb-3">{outliers?.explanation}</p>
                {outliers && outliers.items.length > 0 ? (
                  <ul className="space-y-2">
                    {outliers.items.map((item) => (
                      <li key={item.name} className="flex items-center justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="text-glow">{item.metric}: {item.score.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400">No strong outliers detected.</p>
                )}
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="font-display text-xl mb-4">Trends</h3>
                <p className="text-sm text-slate-300">{data.insights.trend.message}</p>
              </div>
            </section>

            <section className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl">Random fact generator</h3>
                <button
                  onClick={handleRandomFact}
                  className="rounded-xl bg-glow text-ink font-semibold px-4 py-2"
                >
                  Generate random fact
                </button>
              </div>
              {randomFact.length > 0 ? (
                <ul className="space-y-2">
                  {randomFact.map((fact) => (
                    <li key={fact} className="text-sm text-slate-300">{fact}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">Click the button to generate data-driven facts.</p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default ArtistPage;
