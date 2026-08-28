export type Category = {
  id: number;
  name: string;
};

export type Transaction = {
  id: string;
  timestamp: string;
  merchant: string;
  category: Category;
  amount: string;
  currency: string;
  status: string;
  payment_method: string;
};

export type TransactionListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: Transaction[];
};
