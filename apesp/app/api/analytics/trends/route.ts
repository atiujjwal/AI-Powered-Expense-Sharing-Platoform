// app/api/analytics/summary/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { Decimal } from "decimal.js";

Decimal.set({ precision: 12 });

import { prisma } from "@/src/lib/db";
import { withAuth } from "@/src/middleware/auth";

import { errorResponse, successResponse } from "@/src/lib/response";

// Validate YYYY or YYYY-MM
const periodSchema = z.string().regex(/^\d{4}(-\d{2})?$/);

/**
 * GET /analytics/summary
 * Provides a high-level spending summary from a denormalized table.
 */
const getHandler = async (
  request: NextRequest,
  payload: { userId: string }
) => {
  try {
    const { userId } = payload;
    const { searchParams } = new URL(request.url);

    const period = searchParams.get("period");
    const group_id = searchParams.get("group_id");
    const category = searchParams.get("category");

    const whereClause: any = { user_id: userId };

    if (period) {
      const parseResult = periodSchema.safeParse(period);
      if (!parseResult.success) {
        return errorResponse(
          "Invalid period format. Use YYYY or YYYY-MM.",
          400,
          "BAD_REQUEST"
        );
      }
      whereClause.period = { startsWith: period };
    }

    if (group_id) {
      whereClause.group_id = group_id;
    }

    if (category) {
      whereClause.category = category;
    }

    // Read from summary table
    const summaries = await prisma.expenseSummary.findMany({
      where: whereClause,
    });

    // Aggregate results
    let total_spent = new Decimal(0);
    const categoryMap = new Map<string, Decimal>();

    for (const s of summaries) {
      total_spent = total_spent.add(s.total_spent);
      const current = categoryMap.get(s.category) || new Decimal(0);
      categoryMap.set(s.category, current.add(s.total_spent));
    }

    const spending_by_category = Array.from(categoryMap.entries()).map(
      ([category, amount]) => ({
        category,
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

    return successResponse("Analytics summary fetched successfully", {
      period: period || "all",
      total_spent: total_spent.toFixed(2),
      currency,
      spending_by_category,
    });
  } catch (error: any) {
    console.log("Error fetching analytics summary:", error);
    if (error.message.includes("token")) return errorResponse("Unauthorized");
    return errorResponse("Internal server error");
  }
};

export const GET = withAuth(getHandler);
