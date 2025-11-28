import { prisma } from "@/src/lib/db";
import { APP_KNOWLEDGE_BASE } from "@/src/lib/appContext";
import { startOfMonth, subMonths, startOfWeek } from "date-fns";

export class DataRetrievalService {
  private static getDateFilter(range?: string) {
    const now = new Date();
    if (range === "LAST_MONTH")
      return { gte: startOfMonth(subMonths(now, 1)), lt: startOfMonth(now) };
    if (range === "THIS_MONTH") return { gte: startOfMonth(now) };
    if (range === "LAST_WEEK") return { gte: startOfWeek(now) };
    return undefined;
  }

  /**
   * Fetch Spending Stats
   */
  static async getSpending(userId: string, params: any) {
    const dateFilter = this.getDateFilter(params.date_range);

    // Aggregate payments made by this user
    const expenses = await prisma.expensePayer.findMany({
      where: {
        user_id: userId,
        expense: {
          date: dateFilter,
          category: params.category
            ? { contains: params.category, mode: "insensitive" }
            : undefined,
          status: "ACTIVE",
        },
      },
      include: {
        expense: { select: { category: true, description: true, date: true } },
      },
    });

    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      summary: `Total spending found: ${total}`,
      details: expenses.slice(0, 5), // Limit to top 5 for context window
      period: params.date_range,
    };
  }

  /**
   * Fetch Balances (Who owes me?)
   */
  static async getBalances(userId: string, params: any) {
    // 1. Find the friend ID if a name was mentioned
    let friendFilter = {};
    if (params.friend_name) {
      const friend = await prisma.user.findFirst({
        where: {
          name: { contains: params.friend_name, mode: "insensitive" },
          // Ensure they are actually friends (security check)
          OR: [
            { friendships_requested: { some: { addressee_id: userId } } },
            { friendships_addressee: { some: { requester_id: userId } } },
          ],
        },
        select: { id: true },
      });
      if (!friend)
        return { message: `Friend '${params.friend_name}' not found.` };

      friendFilter = {
        OR: [{ user_A_id: friend.id }, { user_B_id: friend.id }],
      };
    }

    const balances = await prisma.balance.findMany({
      where: {
        AND: [
          { OR: [{ user_A_id: userId }, { user_B_id: userId }] },
          friendFilter,
        ],
      },
      include: {
        user_a: { select: { name: true } },
        user_b: { select: { name: true } },
      },
    });

    return balances.map((b) => {
      const isUserA = b.user_A_id === userId;
      const otherPerson = isUserA ? b.user_b.name : b.user_a.name;
      const amount = Number(b.amount);

      // Balance logic: Positive means B owes A.
      // If I am A and amount is positive -> They owe me.
      // If I am A and amount is negative -> I owe them.
      let status = "";
      if (amount === 0) status = "Settled";
      else if (isUserA)
        status =
          amount > 0 ? `${otherPerson} owes you` : `You owe ${otherPerson}`;
      else
        status =
          amount < 0 ? `${otherPerson} owes you` : `You owe ${otherPerson}`; // Reversed for User B

      return { with: otherPerson, amount: Math.abs(amount), status };
    });
  }

  static getAppHelp() {
    return { content: APP_KNOWLEDGE_BASE };
  }
}
