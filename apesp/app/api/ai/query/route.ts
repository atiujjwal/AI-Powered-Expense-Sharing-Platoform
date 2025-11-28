import { NextRequest } from "next/server";
import { z } from "zod";
import { withAuth } from "@/src/middleware/auth";
import { badRequest, errorResponse, successResponse } from "@/src/lib/response";
import { NlpService } from "@/src/services/aiServices";
import { DataRetrievalService } from "@/src/services/dataRetrievalService";

const querySchema = z.object({
  query: z.string().min(2, "Query is too short"),
});

const postHandler = async (
  request: NextRequest,
  payload: { userId: string }
) => {
  try {
    const { userId } = payload;
    const body = await request.json();
    const parseResult = querySchema.safeParse(body);

    if (!parseResult.success) return badRequest("Invalid query");
    const { query } = parseResult.data;

    // 1. INTENT RECOGNITION
    const intent = await NlpService.parseQueryIntent(query);
    console.log("Parsed Intent:", intent);

    let retrievedData;

    // 2. DATA RETRIEVAL (Switch on Intent)
    switch (intent.type) {
      case "GET_SPENDING":
      case "GET_TRANSACTIONS":
        retrievedData = await DataRetrievalService.getSpending(
          userId,
          intent.parameters
        );
        break;

      case "GET_BALANCE":
        retrievedData = await DataRetrievalService.getBalances(
          userId,
          intent.parameters
        );
        break;

      case "APP_HELP":
        retrievedData = DataRetrievalService.getAppHelp();
        break;

      case "UNKNOWN":
      default:
        retrievedData = {
          message:
            "I couldn't find specific data, but I am here to help with expenses and features.",
        };
        break;
    }

    // 3. GENERATION
    const finalAnswer = await NlpService.generateRagResponse(
      query,
      retrievedData
    );

    return successResponse("Query processed", {
      intent: intent.type,
      answer: finalAnswer,
      // We return the raw data too, in case Frontend wants to show a Chart/Table
      raw_data: retrievedData,
    });
  } catch (error: any) {
    console.error("AI Query Error:", error);
    if (error.message?.includes("token")) return errorResponse("Unauthorized");
    return errorResponse("Failed to process query");
  }
};

export const POST = withAuth(postHandler);
