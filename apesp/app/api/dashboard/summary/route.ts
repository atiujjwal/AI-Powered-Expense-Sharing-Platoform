import { NextRequest } from "next/server";
import { z } from "zod";
import { Decimal } from "decimal.js";

import { prisma } from "@/src/lib/db";
import { withAuth } from "@/src/middleware/auth";
import { errorResponse, successResponse } from "@/src/lib/response";

const getHandler = async (
  request: NextRequest,
  payload: { userId: string }
) => {
  try {
    const { userId } = payload;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const upcomingDate = new Date();
    upcomingDate.setDate(now.getDate() + 30);

    // Calculate Total Balance
    const balances = await prisma.balance.findMany({
      where: {
        OR: [{ user_A_id: userId }, { user_B_id: userId }],
      },
    });

    const totalBalance = balances.reduce((acc, balance) => {
      if (balance.user_A_id === userId) {
        return acc.add(balance.amount);
      } else {
        return acc.sub(balance.amount);
      }
    }, new Decimal(0));

    // Monthly Expenses
    const monthlyExpenses = await prisma.expense.aggregate({
      where: {
        created_by_id: userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Upcoming Subscriptions
    const upcomingSubscriptions = await prisma.subscription.findMany({
      where: {
        user_id: userId,
        is_active: true,
        next_charge_date: {
          gte: now,
          lte: upcomingDate,
        },
      },
      orderBy: {
        next_charge_date: "asc",
      },
      take: 5,
    });

    // Recent Activity (Expenses)
    const recentExpenses = await prisma.expense.findMany({
      where: {
        OR: [
          { created_by_id: userId },
          { splits: { some: { user_id: userId } } },
        ],
      },
      include: {
        group: {
          select: {
            name: true,
          },
        },
        created_by: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
    });

    const summary = {
      total_balance: totalBalance.toNumber(),
      monthly_expenses: monthlyExpenses._sum.amount?.toNumber() || 0,
      upcoming_subscriptions: upcomingSubscriptions.map((sub) => ({
        id: sub.id,
        name: sub.name,
        amount: sub.amount.toNumber(),
        next_charge_date: sub.next_charge_date,
      })),
      recent_expenses: recentExpenses.map((exp) => ({
        id: exp.id,
        description: exp.description,
        amount: exp.amount.toNumber(),
        date: exp.date,
        group: exp.group?.name || null,
        created_by: exp.created_by.name,
      })),
    };

    return successResponse("Dashboard summary fetched successfully", summary);
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    if (error instanceof z.ZodError) {
      return errorResponse("Invalid input", 400, "BAD_REQUEST", error.issues);
    }
    return errorResponse("Internal server error");
  }
};

export const GET = withAuth(getHandler);