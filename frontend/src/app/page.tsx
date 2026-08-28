"use client";

import { useEffect, useState, useCallback } from "react";
import { Table } from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { fetchTransactions } from "@/lib/api";
import type { Transaction } from "@/lib/types";

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState<"timestamp" | "amount">("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Detail modal
  const [selected, setSelected] = useState<Transaction | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTransactions({
        page,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status || undefined,
        category: category || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setData(res.items);
      setTotal(res.total);
    } catch (err) {
      setError("Failed to load transactions. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, category, sortBy, sortOrder]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSort = (key: string) => {
    if (key === "timestamp" || key === "amount") {
      if (sortBy === key) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(key);
        setSortOrder("desc");
      }
      setPage(1);
    }
  };

  const columns = [
    {
      key: "timestamp",
      header: "Date",
      sortable: true,
      width: "160px",
      render: (row: Transaction) =>
        new Date(row.timestamp).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      key: "merchant",
      header: "Merchant",
      render: (row: Transaction) => row.merchant,
    },
    {
      key: "category",
      header: "Category",
      render: (row: Transaction) => row.category.name,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      width: "120px",
      render: (row: Transaction) =>
        "₹" + Number(row.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    },
    {
      key: "status",
      header: "Status",
      width: "110px",
      render: (row: Transaction) => {
        const color =
          row.status === "SUCCESS"
            ? "var(--color-success)"
            : row.status === "FAILED"
            ? "var(--color-danger)"
            : "var(--color-warning)";
        return (
          <span style={{ color, fontWeight: 500, fontSize: "var(--text-xs)" }}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: "payment_method",
      header: "Method",
      render: (row: Transaction) => row.payment_method,
    },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "var(--space-6)" }}>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-6)" }}>
        Transactions
      </h1>

      {/* Filters */}
      <Card style={{ marginBottom: "var(--space-6)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <label style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
              Search merchant
            </label>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Type to search…"
              style={{
                width: "100%",
                marginTop: "4px",
                padding: "0.5rem 0.75rem",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text)",
                fontSize: "var(--text-sm)",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              style={{
                width: "100%",
                marginTop: "4px",
                padding: "0.5rem 0.75rem",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text)",
                fontSize: "var(--text-sm)",
              }}
            >
              <option value="">All</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
              Category
            </label>
            <input
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. Food"
              style={{
                width: "100%",
                marginTop: "4px",
                padding: "0.5rem 0.75rem",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text)",
                fontSize: "var(--text-sm)",
              }}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        emptyMessage="No transactions match your filters"
        onRowClick={setSelected}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "var(--space-4)",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
        }}
      >
        <span>
          Showing {data.length} of {total.toLocaleString()} transactions
        </span>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span style={{ padding: "0.4rem 0.75rem" }}>
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Transaction Detail"
        footer={
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Close
          </Button>
        }
      >
        {selected && (
          <div style={{ display: "grid", gap: "var(--space-3)", fontSize: "var(--text-sm)" }}>
            <div><strong>ID:</strong> {selected.id}</div>
            <div><strong>Date:</strong> {new Date(selected.timestamp).toLocaleString("en-IN")}</div>
            <div><strong>Merchant:</strong> {selected.merchant}</div>
            <div><strong>Category:</strong> {selected.category.name}</div>
            <div>
              <strong>Amount:</strong>{" "}
              {"₹" + Number(selected.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div><strong>Status:</strong> {selected.status}</div>
            <div><strong>Payment Method:</strong> {selected.payment_method}</div>
            <div><strong>Currency:</strong> {selected.currency}</div>
          </div>
        )}
      </Modal>
    </div>
  );
} 