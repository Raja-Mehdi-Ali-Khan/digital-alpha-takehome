"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchMonthlySpend } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import type { MonthlySpend } from "@/lib/types";

export function MonthlyTrendChart() {
  const [data, setData] = useState<MonthlySpend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchMonthlySpend()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card style={{ marginBottom: "1.5rem" }}>
      <div className="section-heading">
        <div>
          <div className="page-kicker">Successful payments</div>
          <h2>Monthly spending trend</h2>
        </div>
        <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>Across your history</span>
      </div>
      {loading ? (
        <div style={{ color: "var(--color-text-muted)", padding: "3rem 1rem", textAlign: "center" }}>Loading trend...</div>
      ) : error ? (
        <div style={{ color: "var(--color-danger)", padding: "3rem 1rem", textAlign: "center" }}>Trend unavailable</div>
      ) : data.length === 0 ? (
        <div style={{ color: "var(--color-text-muted)", padding: "3rem 1rem", textAlign: "center" }}>No monthly spending data</div>
      ) : (
        <div style={{ height: 260, width: "100%" }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 18, left: 8, bottom: 8 }}>
              <CartesianGrid stroke="#526b72" strokeDasharray="3 3" opacity={0.25} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#c5d8d4", fontSize: 11 }}
                tickFormatter={(value) => new Date(`${value}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
                axisLine={{ stroke: "#526b72" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#c5d8d4", fontSize: 11 }}
                tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN", { notation: "compact" })}`}
                axisLine={false}
                tickLine={false}
                width={58}
              />
              <Tooltip
                labelFormatter={(value) => new Date(`${value}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                formatter={(value) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                cursor={{ stroke: "#c5d8d4", strokeDasharray: "3 3" }}
                labelStyle={{ color: "#17332e", fontWeight: 700 }}
                itemStyle={{ color: "#087f73", fontWeight: 600 }}
                contentStyle={{ background: "#ffffff", border: "1px solid #c3d8d2", borderRadius: "8px", color: "#17332e", padding: "10px 12px" }}
              />
              <Line type="monotone" dataKey="total" name="Spend" stroke="#e8ad57" strokeWidth={3} dot={{ fill: "#087f73", r: 4, strokeWidth: 2, stroke: "#ffffff" }} activeDot={{ r: 6, fill: "#087f73" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
