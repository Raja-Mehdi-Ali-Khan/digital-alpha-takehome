"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
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
    const fetchBalanceData = async () => {
      await loadBalance();
    };
    void fetchBalanceData();
  }, []);

  useEffect(() => {
    const handler = () => loadBalance();
    window.addEventListener("balance-updated", handler);
    return () => window.removeEventListener("balance-updated", handler);
  }, []);

  const linkStyle = (active: boolean) => ({
    background: active ? "var(--color-surface-hover)" : "transparent",
    borderRadius: "var(--radius-sm)",
    color: active ? "var(--color-primary)" : "var(--color-text-muted)",
    fontWeight: active ? 600 : 400,
    padding: "0.55rem 0.75rem",
  });

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgb(255 255 255 / 0.84)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--color-border)", padding: "0.85rem 1rem" }}>
      <div className="app-header-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <Image src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=96&q=80" alt="" width={40} height={40} style={{ borderRadius: "0.65rem", objectFit: "cover" }} />
          <span>
            <strong style={{ display: "block", fontSize: "0.96rem", lineHeight: 1.1 }}>Digital Alpha</strong>
            <small style={{ color: "var(--color-text-muted)", fontSize: "0.68rem" }}>Personal finance</small>
          </span>
        </Link>
        <nav aria-label="Primary navigation" style={{ display: "flex", gap: "0.35rem", fontSize: "0.86rem" }}>
          <Link href="/" style={linkStyle(pathname === "/")}>Transactions</Link>
          <Link href="/rewards" style={linkStyle(pathname === "/rewards")}>Rewards</Link>
        </nav>
        <div className="balance-pill" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "0.45rem 0.75rem", fontSize: "0.9rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ color: "var(--color-accent)", fontSize: "1rem" }}>●</span>
          <span>{balance === null ? "…" : balance.toLocaleString("en-IN")} coins</span>
        </div>
      </div>
    </header>
  );
}
