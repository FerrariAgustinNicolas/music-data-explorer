import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import type { AlbumTrack } from "../types";

interface AlbumTrackDurationChartProps {
  tracks: AlbumTrack[];
}

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) return "--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const AlbumTrackDurationChart = ({ tracks }: AlbumTrackDurationChartProps) => {
  const data = tracks
    .filter((track) => track.duration && track.duration > 0)
    .map((track) => ({
      name: track.name,
      label: String(track.rank),
      durationMinutes: Number((track.duration / 60).toFixed(2)),
      durationSeconds: track.duration,
    }));

  if (data.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-2xl mb-4">Track duration spread</h2>
        <p className="text-sm text-slate-400">No duration data available for this album.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="font-display text-2xl mb-4">Track duration spread</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 24, right: 8 }}>
            <XAxis dataKey="label" hide />
            <YAxis
              tick={{ fill: "#94a3b8" }}
              tickFormatter={(value) => `${value}m`}
              width={50}
            />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #1f2937", color: "#f8fafc" }}
              labelStyle={{ color: "#f8fafc" }}
              itemStyle={{ color: "#f8fafc" }}
              formatter={(value: number) => [formatDuration(Math.round(value * 60)), "Duration"]}
              labelFormatter={(_, payload) => {
                const trackName = (payload as any)?.[0]?.payload?.name ?? "Track";
                return trackName;
              }}
            />
            <Bar dataKey="durationMinutes" fill="#22d3ee" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400 mt-2">Track length in minutes by track order.</p>
    </div>
  );
};

export default AlbumTrackDurationChart;
