const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchTransactions(params: {
  page?: number;
  page_size?: number;
  category?: string;
  status?: string;
  search?: string;
  sort_by?: "timestamp" | "amount";
  sort_order?: "asc" | "desc";
}): Promise<import("./types").TransactionListResponse> {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));
  if (params.category) query.set("category", params.category);
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (params.sort_by) query.set("sort_by", params.sort_by);
  if (params.sort_order) query.set("sort_order", params.sort_order);

  const res = await fetch(`${API_BASE}/api/transactions?${query.toString()}`);
  
  if (!res.ok) {
    throw new Error("Failed to fetch transactions");
  }
  
  return res.json();
}