import { NextRequest } from "next/server";
import { z } from "zod";
import { withAuth } from "@/src/middleware/auth";
import { badRequest, errorResponse, successResponse } from "@/src/lib/response";
import { NlpService } from "@/src/services/aiServices";
import { AnalyticsService } from "@/src/services/analyticsServices";

const querySchema = z.object({
  query: z.string().min(3, "Query is too short"),
});

/**
 * POST /ai/query
 * Handles natural language queries using RAG workflow.
 */
const postHandler = async (
  request: NextRequest,
  payload: { userId: string }
) => {
  try {
    const { userId } = payload;

    const body = await request.json();
    const parseResult = querySchema.safeParse(body);

    // 400: Invalid query
    if (!parseResult.success) {
      return badRequest("Invalid query");
    }

    const { query } = parseResult.data;

    // --- RAG WORKFLOW ---

    // Parse intent
    const intent = await NlpService.parseQueryIntent(query);

    if (intent.action === "unknown") {
      return successResponse("Unknown query type", {
        answer:
          "Sorry, I'm not sure how to help with that. Try asking about your spending.",
        data: null,
      });
    }

    // Retrieve structured analytics data
    const data = await AnalyticsService.getSpendingSummary(
      userId,
      intent.period,
      intent.category
    );

    // Generate final LLM response incorporating retrieved data
    const answer = await NlpService.generateRagResponse(query, data);

    // Return safe, accurate RAG output
    return successResponse("AI query processed successfully", {
      answer,
      data,
    });
  } catch (error: any) {
    console.log("Error processing AI query: ", error);
    if (error.message.includes("token")) return errorResponse("Unauthorized");
    return errorResponse("AI query failed");
  }
};

export const POST = withAuth(postHandler);
