'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
// import { Input } from '@/components/ui/Input';

const expenseSchema = z.object({
  amount: z.number().positive(),
  merchant: z.string().min(2),
  description: z.string().min(3),
  category: z.string(),
  date: z.string().datetime(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  isLoading?: boolean;
}

export const ExpenseForm = ({ onSubmit, isLoading = false }: ExpenseFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Amount</label>
        <Input type="number" step="0.01" {...register('amount')} />
        {errors.amount && <p className="text-danger text-sm">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Merchant</label>
        <Input {...register('merchant')} placeholder="e.g., Starbucks" />
        {errors.merchant && <p className="text-danger text-sm">{errors.merchant.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select {...register('category')} className="w-full border rounded px-3 py-2">
          <option value="">Select category</option>
          <option value="DINING">Dining</option>
          <option value="TRAVEL">Travel</option>
          <option value="SHOPPING">Shopping</option>
          <option value="GROCERIES">Groceries</option>
          <option value="UTILITIES">Utilities</option>
        </select>
        {errors.category && <p className="text-danger text-sm">{errors.category.message}</p>}
      </div>

      <Button type="submit" isLoading={isLoading}>
        Add Expense
      </Button>
    </form>
  );
};
