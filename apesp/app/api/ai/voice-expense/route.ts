// app/api/ai/voice-expense/route.ts
import { NextRequest } from "next/server";
import { withAuth } from "@/src/middleware/auth";
import {
  badRequest,
  errorResponse,
  successResponse,
} from "@/src/lib/response";
import { jobQueue } from "@/src/lib/queue";
import { FileStorageService } from "@/src/services/aiServices";

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * POST /ai/voice-expense
 * Uploads an audio file and schedules async voice-expense processing.
 */
const postHandler = async (
  request: NextRequest,
  payload: { userId: string }
) => {
  try {
    const { userId } = payload;

    const formData = await request.formData();
    const file = formData.get("audio") as File;

    // 400: No file uploaded
    if (!file) {
      return badRequest(
        "No file uploaded. Please attach a file named 'audio'."
      );
    }

    // 400: Invalid file type
    if (!file.type.startsWith("audio/")) {
      return badRequest("Invalid file type. Only audio files are allowed.");
    }

    // 400: File too large
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return badRequest(
        `File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`
      );
    }

    // Upload the file to persistent storage (e.g., S3)
    const audioBuffer = Buffer.from(await file.arrayBuffer());
    const storagePath = await FileStorageService.upload(audioBuffer, file.name);

    // Enqueue the asynchronous job, passing the file's location
    const job = await jobQueue.add("process-voice-expense", {
      userId,
      storagePath,
      originalFilename: file.name,
    });

    return successResponse(
      "Voice processing started",
      {
        job_id: job.id,
        status: "PROCESSING",
      },
      202
    );
  } catch (error: any) {
    console.log("Error processing voice expense: ", error);
    if (error.message?.includes("token")) return errorResponse("Unauthorized");
    return errorResponse("Failed to start voice processing");
  }
};

export const POST = withAuth(postHandler);
