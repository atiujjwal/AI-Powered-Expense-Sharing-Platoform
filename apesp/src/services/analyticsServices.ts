import { z } from "zod";
import { Decimal } from "decimal.js";
import { prisma } from "../lib/db";

Decimal.set({ precision: 12 });

// Validate YYYY or YYYY-MM
const periodSchema = z.string().regex(/^\d{4}(-\d{2})?$/);

export interface AnalyticsSummary {
  period: string;
  total_spent: string;
  currency: string;
  spending_by_category: { category: string; amount: string }[];
}

export class AnalyticsService {
  /**
   * Fetches and aggregates spending summaries for a user.
   * This is the internal logic used by both the Analytics API and RAG.
   */
  static async getSpendingSummary(
    userId: string,
    period: string | null,
    category: string | null,
    group_id: string | null = null
  ): Promise<AnalyticsSummary> {
    const whereClause: any = { user_id: userId };

    if (period) {
      if (!periodSchema.safeParse(period).success) {
        throw new Error("Invalid period format. Use YYYY or YYYY-MM.");
      }
      whereClause.period = { startsWith: period };
    }
    if (group_id) {
      whereClause.group_id = group_id;
    }
    if (category) {
      whereClause.category = category;
    }

    // Read from the denormalized summary table
    const summaries = await prisma.expenseSummary.findMany({
      where: whereClause,
    });

    // Aggregate the results
    let total_spent = new Decimal(0);
    const categoryMap = new Map<string, Decimal>();

    for (const s of summaries) {
      total_spent = total_spent.add(s.total_spent);
      const current = categoryMap.get(s.category) || new Decimal(0);
      categoryMap.set(s.category, current.add(s.total_spent));
    }

    const spending_by_category = Array.from(categoryMap.entries()).map(
      ([cat, amount]) => ({
        category: cat,
        amount: amount.toFixed(2),
      })
    );

    const currency =
      (
        await prisma.user.findUnique({
          where: { id: userId },
          select: { currency: true },
        })
      )?.currency || "INR";

    return {
      period: period || "all",
      total_spent: total_spent.toFixed(2),
      currency: currency,
      spending_by_category: spending_by_category,
    };
  }
}
