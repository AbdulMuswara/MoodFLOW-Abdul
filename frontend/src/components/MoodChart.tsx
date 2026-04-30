"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type MoodData = {
  dateLabel: string; // e.g. "Mon", "Apr 15"
  score: number;     // e.g. 1-5 or float
};

export default function MoodChart({ data }: { data: MoodData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full text-sm text-slate-500 dark:text-slate-400 min-h-[200px]">
        Not enough mood entries yet.
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
        <XAxis 
          dataKey="dateLabel" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: "#94a3b8" }} 
          dy={10} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: "#94a3b8" }} 
          domain={[1, 5]} 
          ticks={[1, 2, 3, 4, 5]} 
        />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(8px)",
          }}
          itemStyle={{ color: "#0f172a", fontWeight: "bold" }}
          labelStyle={{ color: "#64748b", margin: 0, padding: 0 }}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#8b5cf6"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorScore)"
          isAnimationActive={true}
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
    </div>
  );
}
