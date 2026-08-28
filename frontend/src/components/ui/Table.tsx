"use client";

import React from "react";

type Column<T> = {
  key: string;
  header: string;
  width?: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
};

export function Table<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  error = null,
  emptyMessage = "No data found",
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
}: TableProps<T>) {
  if (error) {
    return (
      <div
        style={{
          padding: "var(--space-8)",
          textAlign: "center",
          color: "var(--color-danger)",
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        background: "var(--color-surface)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: "820px",
          tableLayout: "auto",
        }}
      >
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && onSort?.(col.key)}
                style={{
                  position: "sticky",
                  top: 0,
                  background: "var(--color-surface)",
                  padding: "0.9rem 1rem",
                  textAlign: "left",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  borderBottom: "1px solid var(--color-border)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  cursor: col.sortable ? "pointer" : "default",
                  whiteSpace: "nowrap",
                  width: col.width,
                  zIndex: 10,
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  {col.header}
                  {col.sortable && sortBy === col.key && (
                    <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: "var(--space-8)",
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                }}
              >
                Loading transactions…
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: "var(--space-8)",
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onRowClick?.(row);
                  }
                }}
                style={{
                  cursor: onRowClick ? "pointer" : "default",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--color-surface-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLElement).style.outline =
                    "2px solid var(--color-primary)";
                  (e.currentTarget as HTMLElement).style.outlineOffset = "-2px";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLElement).style.outline = "none";
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "var(--space-3) var(--space-4)",
                      fontSize: "var(--text-sm)",
                      borderBottom: "1px solid var(--color-border)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}