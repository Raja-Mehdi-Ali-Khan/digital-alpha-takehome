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
  filters?: {
    category?: string;
    status?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
    min_amount?: string;
    max_amount?: string;
  };
};

const COLORS = [
  "#087f73", "#e8ad57", "#4f8f86", "#c96d54",
  "#6f7fc4", "#3c9ba0", "#b56e9a", "#789c4c",
];

export function CategoryChart({ onCategoryClick, activeCategory, filters = {} }: Props) {
  const [data, setData] = useState<{ category: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const { category, status, search, start_date, end_date, min_amount, max_amount } = filters;

  useEffect(() => {
    fetchCategorySpend({ category, status, search, start_date, end_date, min_amount, max_amount })
      .then((nextData) => {
        setData(nextData);
        setLoading(false);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, status, search, start_date, end_date, min_amount, max_amount]);

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

      <div style={{ width: "100%", height: Math.max(260, data.length * 27) }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 8 }}>
            <XAxis
              type="number"
              tick={{ fill: "#607873", fontSize: 11 }}
              tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN", { notation: "compact" })}`}
              axisLine={{ stroke: "#b9ccc7" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={125}
              tick={{ fill: "#31534d", fontSize: 12, fontWeight: 600 }}
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
                  fill="#31534d"
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