import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import type { Track } from "../types";

interface TopTracksBarChartProps {
  tracks: Track[];
}

const formatCompact = (value: number) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const TopTracksBarChart = ({ tracks }: TopTracksBarChartProps) => {
  const data = tracks.map((track) => ({
    name: track.name,
    playcount: track.playcount,
    listeners: track.listeners,
  }));

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display text-xl mb-4">Track popularity spread</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 24, right: 8 }}>
            <XAxis dataKey="name" hide />
            <YAxis tick={{ fill: "#94a3b8" }} tickFormatter={formatCompact} width={50} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #1f2937", color: "#f8fafc" }}
              labelStyle={{ color: "#f8fafc" }}
              itemStyle={{ color: "#f8fafc" }}
              formatter={(value: number) => formatCompact(Number(value))}
            />
            <Bar dataKey="playcount" fill="#22d3ee" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400 mt-2">Playcount of top 10 tracks.</p>
    </div>
  );
};

export default TopTracksBarChart;
