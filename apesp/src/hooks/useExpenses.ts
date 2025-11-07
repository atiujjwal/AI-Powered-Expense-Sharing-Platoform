// Fetch expenses

'use client';

import { useCallback, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Expense } from '@/types';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(
    async (filters?: { category?: string; limit?: number }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/api/expenses', { params: filters });
        setExpenses(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createExpense = useCallback(async (data: any) => {
    try {
      const response = await api.post('/api/expenses', data);
      setExpenses((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateExpense = useCallback(async (id: string, data: any) => {
    try {
      const response = await api.patch(`/api/expenses/${id}`, data);
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === id ? response.data : exp))
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/expenses/${id}`);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchExpenses,
  };
};
