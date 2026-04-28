import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PricePoint } from "../types";

export default function PriceChart({
  data,
  unit,
}: {
  data: PricePoint[];
  unit: string;
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#262626" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#a1a1a1", fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
            stroke="#3a3a3a"
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#a1a1a1", fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
            stroke="#3a3a3a"
            tickFormatter={(v) => `$${v}`}
            domain={["auto", "auto"]}
          />
          <Tooltip
            formatter={(value) => [`$${Number(value).toFixed(2)} ${unit}`, "Price"]}
            contentStyle={{
              borderRadius: 0,
              fontSize: 11,
              background: "#141414",
              border: "1px solid #3a3a3a",
              color: "#ededed",
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
            }}
            labelStyle={{ color: "#a1a1a1" }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#f97316"
            strokeWidth={1.75}
            dot={false}
            activeDot={{ r: 4, fill: "#f97316" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
