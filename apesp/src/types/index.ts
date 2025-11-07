// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  currency: string;
  timezone: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Expense types
export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  merchant: string;
  description: string;
  category: string;
  date: Date;
  payment_method: string;
  source_type: string;
  receipt_url?: string;
  notes?: string;
  is_recurring: boolean;
  recurring_freq?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateExpenseDTO {
  amount: number;
  merchant: string;
  description: string;
  category: string;
  date: Date;
  payment_method?: string;
  notes?: string;
}

// Budget types
export interface Budget {
  id: string;
  user_id: string;
  month: string;
  category: string;
  budget_amount: number;
  alert_threshold: number;
  created_at: Date;
}

// Dashboard types
export interface DashboardSummary {
  total_spent: number;
  total_budget: number;
  remaining: number;
  percentage_used: number;
  categories: CategoryBreakdown[];
  recent_expenses: Expense[];
  avg_daily_spend: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
