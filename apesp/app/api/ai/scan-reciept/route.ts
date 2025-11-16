// app/api/ai/scan-receipt/route.ts
import { NextRequest } from "next/server";
import { withAuth } from "@/src/middleware/auth";
import {
  badRequest,
  errorResponse,
  successResponse,
} from "@/src/lib/response";
import { OcrService } from "@/src/services/aiServices";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const postHandler = async (
  request: NextRequest,
  payload: { userId: string }
) => {
  try {
    const { userId } = payload;

    const formData = await request.formData();
    const file = formData.get("image") as File;

    // 400: No file uploaded
    if (!file) {
      return badRequest(
        "No file uploaded. Please attach a file named 'image'."
      );
    }

    // 400: Invalid file type
    if (!file.type.startsWith("image/")) {
      return badRequest("Invalid file type. Only images are allowed.");
    }

    // 400: File too large
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return badRequest(
        `File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`
      );
    }

    // Convert file to buffer
    const imageBuffer = Buffer.from(await file.arrayBuffer());

    // Call the external AI OCR service
    const draftExpense = await OcrService.scan(imageBuffer);

    return successResponse("Receipt scanned successfully", draftExpense);
  } catch (error: any) {
    console.error("[scan-receipt] OCR processing failed:", error);
    if (error.message.includes("token")) return errorResponse("Unauthorized");
    return errorResponse("OCR processing failed");
  }
};

export const POST = withAuth(postHandler);
