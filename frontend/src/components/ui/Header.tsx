"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchBalance } from "@/lib/api";

export function Header() {
  const [balance, setBalance] = useState<number | null>(null);
  const pathname = usePathname();

  const loadBalance = async () => {
    try {
      const data = await fetchBalance();
      setBalance(data.balance);
    } catch {
      setBalance(null);
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  // Expose a way for other components to refresh the balance
  useEffect(() => {
    const handler = () => loadBalance();
    window.addEventListener("balance-updated", handler);
    return () => window.removeEventListener("balance-updated", handler);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "0.75rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Digital Alpha</span>

        <nav style={{ display: "flex", gap: "1rem", fontSize: "0.9rem" }}>
          <Link
            href="/"
            style={{
              color: pathname === "/" ? "var(--color-primary)" : "var(--color-text-muted)",
              fontWeight: pathname === "/" ? 600 : 400,
            }}
          >
            Transactions
          </Link>
          <Link
            href="/rewards"
            style={{
              color: pathname === "/rewards" ? "var(--color-primary)" : "var(--color-text-muted)",
              fontWeight: pathname === "/rewards" ? 600 : 400,
            }}
          >
            Rewards
          </Link>
        </nav>
      </div>

      <div
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "999px",
          padding: "0.35rem 0.9rem",
          fontSize: "0.9rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <span>🪙</span>
        <span>
          {balance === null ? "…" : balance.toLocaleString("en-IN")} coins
        </span>
      </div>
    </header>
  );
}