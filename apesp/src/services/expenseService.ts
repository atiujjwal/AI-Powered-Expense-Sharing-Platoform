import { prisma } from "../lib/db";
import { Expense } from "../lib/types";
import { CreateExpenseDTO } from "../types/expense";

export const expenseService = {
  // Create expense
  async createExpense(
    userId: string,
    data: CreateExpenseDTO
  ): Promise<Expense> {
    return prisma.expense.create({
      data: {
        user_id: userId,
        ...data,
      },
    });
  },

  // Get all expenses for user
  async getUserExpenses(
    userId: string,
    filters?: {
      category?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<Expense[]> {
    return prisma.expense.findMany({
      where: {
        user_id: userId,
        ...(filters?.category && { category: filters.category }),
        ...(filters?.startDate && {
          date: { gte: filters.startDate },
        }),
        ...(filters?.endDate && {
          date: { lte: filters.endDate },
        }),
      },
      orderBy: { date: "desc" },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });
  },

  // Get expense by ID
  async getExpenseById(
    expenseId: string,
    userId: string
  ): Promise<Expense | null> {
    return prisma.expense.findFirst({
      where: { id: expenseId, user_id: userId },
    });
  },

  // Update expense
  async updateExpense(
    expenseId: string,
    userId: string,
    data: Partial<CreateExpenseDTO>
  ): Promise<Expense> {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, user_id: userId },
    });

    if (!expense) {
      throw new Error("Expense not found or user not authorized");
    }

    return prisma.expense.update({
      where: {
        id: expenseId,
      },
      data: { ...data },
    });
  },

  // Delete expense
  async deleteExpense(expenseId: string, userId: string): Promise<void> {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, user_id: userId },
    });

    if (!expense) {
      throw new Error("Expense not found or user not authorized");
    }

    await prisma.expense.delete({
      where: {
        id: expenseId,
      },
    });
  },

  // Get monthly summary
  async getMonthlyExpenses(userId: string, month: Date): Promise<Expense[]> {
    // <-- ADD THIS RETURN TYPE
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const expenses = await prisma.expense.findMany({
      // ... (where clause)
    });

    return expenses;
  },

  // Get expenses by category
  async getExpensesByCategory(userId: string, month: Date) {
    const expenses = await this.getMonthlyExpenses(userId, month);

    const byCategory = expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = 0;
      }
      acc[exp.category] += exp.amount;
      return acc;
    }, {} as Record<string, number>);

    return byCategory;
  },
};
