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




