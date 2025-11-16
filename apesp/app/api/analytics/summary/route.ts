import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/db";
import { withAuth } from "@/src/middleware/auth";
import { errorResponse, successResponse } from "@/src/lib/response";

const trendsQuerySchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  granularity: z.enum(["DAILY", "MONTHLY", "YEARLY"]).optional(),
});

/**
 * GET /analytics/trends
 * Provides time-series data from a denormalized table.
 */
const getHandler = async (
  request: NextRequest,
  payload: { userId: string }
) => {
  try {
    const { userId } = payload;
    const { searchParams } = new URL(request.url);

    const query = {
      start_date: searchParams.get("start_date") || undefined,
      end_date: searchParams.get("end_date") || undefined,
      granularity: searchParams.get("granularity") || undefined,
    };

    // Validate query params
    const parseResult = trendsQuerySchema.safeParse(query);
    if (!parseResult.success) {
      return errorResponse(
        "Invalid query parameters",
        400,
        "BAD_REQUEST",
        parseResult.error.issues
      );
    }

    const { start_date, end_date, granularity } = parseResult.data;

    // Build where clause
    const whereClause: any = { user_id: userId };

    if (granularity) {
      whereClause.granularity = granularity;
    }

    if (start_date) {
      whereClause.date = { ...whereClause.date, gte: new Date(start_date) };
    }

    if (end_date) {
      whereClause.date = { ...whereClause.date, lte: new Date(end_date) };
    }

    // Read from denormalized trends table
    const trends = await prisma.expenseTrend.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
    });

    // Format response
    const formattedTrends = trends.map((t) => ({
      date: t.date.toISOString().split("T")[0], // YYYY-MM-DD
      amount: t.amount.toFixed(2),
    }));

    return successResponse("Analytics trends fetched successfully", {
      trends: formattedTrends,
    });
  } catch (error: any) {
    console.log("Error fetching analytics trends:", error);

    if (error.message.includes("token")) return errorResponse("Unauthorized");

    return errorResponse("Internal server error");
  }
};

export const GET = withAuth(getHandler);
