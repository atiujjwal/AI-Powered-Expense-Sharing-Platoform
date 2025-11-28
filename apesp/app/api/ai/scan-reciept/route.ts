import { NextRequest } from "next/server";
import { withAuth } from "@/src/middleware/auth";
import { badRequest, errorResponse, successResponse } from "@/src/lib/response";
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
    const file = formData.get("receipt") as File;
    console.log("18: ", file);
    

    if (!file) {
      return badRequest(
        "No file uploaded. Please attach a file named 'image'."
      );
    }

    if (!file.type.startsWith("image/")) {
      return badRequest("Invalid file type. Only images are allowed.");
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return badRequest(
        `File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`
      );
    }

    const imageBuffer = Buffer.from(await file.arrayBuffer());

    const draftExpense = await OcrService.scan(imageBuffer, file.type);

    return successResponse("Receipt scanned successfully", draftExpense);
  } catch (error: any) {
    console.error("[scan-receipt] OCR processing failed:", error);
    if (error.message.includes("API_KEY"))
      return errorResponse("AI Configuration Error");
    if (error.message.includes("token")) return errorResponse("Unauthorized");
    return errorResponse("OCR processing failed");
  }
};

export const POST = withAuth(postHandler);
