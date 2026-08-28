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
  LabelList,
} from "recharts";
import { fetchCategorySpend } from "@/lib/api";
import { Card } from "@/components/ui/Card";

type Props = {
  onCategoryClick: (category: string) => void;
  activeCategory?: string;
};

const COLORS = [
  "#087f73", "#e8ad57", "#4f8f86", "#c96d54",
  "#6f7fc4", "#3c9ba0", "#b56e9a", "#789c4c",
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
      <div className="section-heading">
        <div>
          <div className="page-kicker">Successful payments</div>
          <h2>Spend by category</h2>
        </div>
        <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>Click a bar to filter</span>
      </div>

      <div
        aria-label="Filter by category"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        {data.map((item, index) => {
          const isActive = activeCategory === item.category;
          return (
            <button
              key={item.category}
              type="button"
              aria-pressed={isActive}
              onClick={() => onCategoryClick(isActive ? "" : item.category)}
              style={{
                alignItems: "center",
                background: isActive ? "#e2f2ee" : "#f7faf9",
                border: `1px solid ${isActive ? "#087f73" : "#dce7e4"}`,
                borderRadius: "999px",
                color: "#31534d",
                cursor: "pointer",
                display: "inline-flex",
                font: "inherit",
                fontSize: "0.78rem",
                fontWeight: isActive ? 700 : 600,
                gap: "0.45rem",
                padding: "0.4rem 0.65rem",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  background: isActive ? "#087f73" : COLORS[index % COLORS.length],
                  borderRadius: "50%",
                  height: "0.5rem",
                  width: "0.5rem",
                }}
              />
              {item.category}
            </button>
          );
        })}
      </div>

      <div style={{ width: "100%", height: Math.max(260, data.length * 27) }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 8 }}>
            <XAxis
              type="number"
              tick={{ fill: "#c5d8d4", fontSize: 11 }}
              tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN", { notation: "compact" })}`}
              axisLine={{ stroke: "#526b72" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={125}
              tick={{ fill: "#dceee9", fontSize: 12, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
                formatter={(value) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                cursor={false}
                labelStyle={{ color: "#17332e", fontWeight: 700, marginBottom: "4px" }}
                itemStyle={{ color: "#087f73", fontWeight: 600 }}
                contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #c3d8d2",
                    borderRadius: "8px",
                    boxShadow: "0 12px 32px rgba(29, 67, 60, 0.16)",
                    color: "#17332e",
                    padding: "10px 12px",
                }}
            />
            <Bar
                dataKey="total"
                radius={[0, 4, 4, 0]}
              minPointSize={6}
                cursor="pointer"
                onClick={(_, index) => {
                  const item = data[Number(index)];
                    if (item) {
                    onCategoryClick(item.category);
                    }
                }}
                >
                <LabelList
                  dataKey="total"
                  position="right"
                  formatter={(value) => `₹${Number(value).toLocaleString("en-IN", { notation: "compact" })}`}
                  fill="#dceee9"
                  fontSize={11}
                  fontWeight={600}
                />
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