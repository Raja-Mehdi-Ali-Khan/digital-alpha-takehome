"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { fetchCategorySpend } from "@/lib/api";
import { Card } from "@/components/ui/Card";

type Props = {
  onCategoryClick: (category: string) => void;
  activeCategory?: string;
};

const COLORS = [
  "#3b82f6", "#22c55e", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16",
];

export function CategoryChart({ onCategoryClick, activeCategory }: Props) {
  const [data, setData] = useState<{ category: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategorySpend()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
          Loading chart…
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ marginBottom: "1.5rem" }}>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>
        Spend by Category
      </h2>
      <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1rem" }}>
        Click a bar to filter the transactions table
      </p>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="category"
              width={110}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <Tooltip
                formatter={(value) => {
                    if (typeof value === "number") {
                    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
                    }
                    return value;
                }}
                contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                }}
            />
            <Bar
                dataKey="total"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(_: any, index: number) => {
                    const item = data[index];
                    if (item) {
                    onCategoryClick(item.category);
                    }
                }}
                >
                {data.map((entry, index) => (
                    <Cell
                    key={entry.category}
                    fill={
                        activeCategory === entry.category
                        ? "#60a5fa"
                        : COLORS[index % COLORS.length]
                    }
                    />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}   