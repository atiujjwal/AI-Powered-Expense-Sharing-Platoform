export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  currency: string;
};

export type Group = {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  members: Array<Pick<User, "id" | "name" | "avatarUrl">>;
  currency: string;
};

export type Expense = {
  id: string;
  groupId: string;
  date: string; // ISO
  merchant: string;
  description?: string;
  category: string;
  amount: number;
  paidBy: string; // userId
  split: "equal" | "exact" | "percentage" | "custom";
  attachments?: string[]; // receipt urls
  reactions?: Array<{ userId: string; emoji: string }>;
  comments?: Array<{
    id: string;
    userId: string;
    message: string;
    createdAt: string;
  }>;
  currency: string;
};

export type Balance = {
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
};

export type Settlement = {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  method: "UPI" | "PayPal" | "Venmo" | "Crypto" | "Bank";
  createdAt: string;
  status: "pending" | "completed" | "failed";
  receiptUrl?: string;
};

export type AnalyticsSummary = {
  totalSpent: number;
  totalBudget: number;
  remaining: number;
  percentageUsed: number;
  categories: Array<{
    category: string;
    amount: number;
    percentage: string;
    color: string;
  }>;
  recentExpenses: Array<
    Pick<Expense, "id" | "date" | "merchant" | "category" | "amount">
  >;
};
