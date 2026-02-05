import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { Tag } from "../types";

interface TagDistributionChartProps {
  tags: Tag[];
}

const COLORS = ["#22d3ee", "#38bdf8", "#0ea5e9", "#06b6d4", "#67e8f9", "#7dd3fc"];

const TagDistributionChart = ({ tags }: TagDistributionChartProps) => {
  const data = tags.slice(0, 6).map((tag) => ({
    name: tag.name,
    value: tag.percent ?? 0,
  }));

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display text-xl mb-4">Tag / genre distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={90}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #1f2937", color: "#f8fafc" }}
              labelStyle={{ color: "#f8fafc" }}
              itemStyle={{ color: "#f8fafc" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400 mt-2">Top tags by relative count.</p>
    </div>
  );
};

export default TagDistributionChart;
