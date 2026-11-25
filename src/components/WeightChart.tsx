"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmt } from "@/lib/format";

export type ChartPoint = {
  label: string;
  weight: number | null;
  avg: number | null;
  goal: number | null;
};

export function WeightChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.3} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} interval="preserveStartEnd" minTickGap={16} />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            domain={[(min: number) => Math.floor(min - 1), (max: number) => Math.ceil(max + 1)]}
            tickFormatter={(v: number) => fmt(v)}
            width={44}
          />
          <Tooltip
            formatter={(value) => (typeof value === "number" ? `${fmt(value, 2)} kg` : String(value))}
            contentStyle={{ borderRadius: 12, fontSize: 13 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="goal" name="Meta" stroke="#f59e0b" strokeDasharray="6 4" dot={false} strokeWidth={2} connectNulls />
          <Line type="monotone" dataKey="weight" name="Peso" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          <Line type="monotone" dataKey="avg" name="Média 7 dias" stroke="#059669" strokeWidth={3} dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
