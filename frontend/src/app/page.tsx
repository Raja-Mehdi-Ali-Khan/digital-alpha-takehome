"use client";

import { useEffect, useState, useCallback } from "react";
import { Table } from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CategoryChart } from "@/components/ui/CategoryChart";
import { fetchTransactions } from "@/lib/api";
import type { Transaction } from "@/lib/types";

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState<"timestamp" | "amount">("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selected, setSelected] = useState<Transaction | null>(null);

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
    } catch {
      setError("Failed to load transactions. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, category, sortBy, sortOrder]);

  useEffect(() => {
    const fetchData = async () => {
      await load();
    };

    void fetchData();
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
            ? "#22c55e"
            : row.status === "FAILED"
            ? "#ef4444"
            : "#f59e0b";
        return (
          <span style={{ color, fontWeight: 500, fontSize: "12px" }}>
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
    <div className="page-shell">
      <div style={{ marginBottom: "2rem" }}>
        <div className="page-kicker">Overview / Activity</div>
        <h1 className="page-title">Your spending, at a glance.</h1>
        <p className="page-subtitle">
          Review recent card activity, understand your spending patterns, and keep every payment on track.
        </p>
      </div>

      {/* Chart */}
      <CategoryChart
        activeCategory={category}
        onCategoryClick={(cat) => {
          setCategory(cat);
          setPage(1);
        }}
      />

      {/* Filters */}
      <Card style={{ marginBottom: "1.5rem" }}>
        <div className="section-heading">
          <div>
            <div className="page-kicker">Find a payment</div>
            <h2>Filter transactions</h2>
          </div>
          <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>Live results</span>
        </div>
        <div className="filter-grid">
          <div>
            <label className="field-label" htmlFor="merchant-search">Search merchant</label>
            <input
              id="merchant-search"
              className="field-control"
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
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#f1f5f9",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              className="field-control"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              style={{
                width: "100%",
                marginTop: "4px",
                padding: "0.5rem 0.75rem",
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#f1f5f9",
                fontSize: "14px",
              }}
            >
              <option value="">All</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="category-filter">Category</label>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "4px" }}>
              <input
                id="category-filter"
                className="field-control"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g. Food"
                style={{
                  flex: 1,
                  padding: "0.5rem 0.75rem",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  color: "#f1f5f9",
                  fontSize: "14px",
                }}
              />
              {category && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setCategory("");
                    setPage(1);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
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
        className="pagination-bar"
      >
        <span>
          Showing {data.length} of {total.toLocaleString()} transactions
        </span>
        <div className="pagination-actions" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span>
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
          <div style={{ display: "grid", gap: "0.75rem", fontSize: "14px" }}>
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