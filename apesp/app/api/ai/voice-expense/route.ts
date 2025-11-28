import { NextRequest } from "next/server";
import { withAuth } from "@/src/middleware/auth";
import { badRequest, errorResponse, successResponse } from "@/src/lib/response";
import { FileStorageService } from "@/src/services/storageService";
import {
  VoiceAiService,
  VoiceExpenseFormDataSchema,
} from "@/src/services/aiServices";
import { prisma } from "@/src/lib/db";

// Before the user hits "Record," display these tips to ensure high accuracy. The AI needs Who, What, How Much, and With Whom.
// "Tips for a perfect Voice Expense:"
// Start with the Context: Say if it's for a Group (e.g., "Trip Group") or a Friend (e.g., "Rahul").
// Say the Amount & Item: Clearly state the cost and what it was for.
// Mention the Split: If it's not equal, specify (e.g., "I paid, but Rahul owes 500").
// Mention Who Paid: If you didn't pay, say who did.
// Example Script: "I paid 2000 rupees for Dinner with Rahul. Split it equally." "Added 500 to the Goa Trip group for snacks. I paid."

const postHandler = async (
  request: NextRequest,
  payload: { userId: string }
) => {
  try {
    const { userId } = payload;
    const formData = await request.formData();

    const contextValue = formData.get("context");
    if (typeof contextValue !== "string") {
      return badRequest("Invalid JSON for context");
    }

    let parsedContext: unknown;
    try {
      parsedContext = JSON.parse(contextValue);
    } catch (err) {
      console.error("Failed to parse context JSON:", err);
      return badRequest("Invalid JSON for context");
    }

    // Get audio (assuming it should be a File from the form)
    const rawAudio = formData.get("audio");
    if (!(rawAudio instanceof File)) {
      return badRequest("Audio file is required");
    }

    const rawData = {
      audio: rawAudio,
      context: contextValue,
    };

    const validation = VoiceExpenseFormDataSchema.safeParse(rawData);

    if (!validation.success) {
      const errorMessage = validation.error.issues;
      return errorResponse(
        "Invalid input data",
        400,
        "BAD_REQUEST",
        errorMessage
      );
    }

    const { audio, context } = validation.data;

    console.log("65: ", audio, context);
    

    const user = await prisma.user.findUnique({
      where: { id: userId, is_deleted: false },
    });

    if (!user) return errorResponse("User not found", 404);

    const fullContext = {
      ...context,
      current_user_id: userId,
      current_user_name: user.name,
    };

    console.log("44: ", fullContext);

    const buffer = Buffer.from(await audio.arrayBuffer());
    const filePath = await FileStorageService.upload(buffer, audio.name);

    const draftExpense = await VoiceAiService.processVoiceExpense(
      filePath,
      audio.type,
      fullContext
    );

    await FileStorageService.delete(filePath);

    return successResponse("Expense draft created", draftExpense);
  } catch (error: any) {
    console.error("Voice API Error:", error);
    if (error.message?.includes("token")) return errorResponse("Unauthorized");
    return errorResponse("Internal server error");
  }
};

export const POST = withAuth(postHandler);
