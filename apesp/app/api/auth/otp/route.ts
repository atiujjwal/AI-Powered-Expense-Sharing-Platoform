import { badRequest, errorResponse, successResponse } from "@/src/lib/response";
import { NextRequest } from "next/server";
import { z } from "zod";

// Utility: Generate 6-digit random OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// --- Zod Schemas for validation
const sendOtpSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  type: z.string().min(2), // "register", "login", "forgot_password", etc.
});
const verifyOtpSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  type: z.string().min(2), // "register", "login", "forgot_password", etc.
  otp: z.string().length(6),
});

// --- GET = send OTP ---
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url!);
    const email = url.searchParams.get("email") ?? undefined;
    const phone = url.searchParams.get("phone") ?? undefined;
    const type = url.searchParams.get("type") || "";

    console.log("32: ", { email, phone, type });

    // Validate inputs via Zod
    // sendOtpSchema.parse({ email, phone, type });

    // Generate OTP & expiry (5 min)
    // const otp = generateOtp();
    // const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save to DB
    // await prisma.UserOtp.create({
    //   data: { email, phone, otp, type, expires_at: expiresAt },
    // });

    // TODO: Actually send the OTP (email, SMS, etc).
    // code to send otp to users

    return successResponse("OTP sent successfully", {
      message: "OTP sent",
      //   otp, // REMOVE in production!
      // expiresAt,
      otp: 1234,
      expiresAt: "2005-11-13",
    });
  } catch (error) {
    console.log("Error sending OTP: ", error);
    if (error instanceof z.ZodError)
      return badRequest("Invalid request", error.issues);
    return errorResponse("Internal server error");
  }
}

// --- POST = verify OTP ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone, type, otp } = verifyOtpSchema.parse(body);

    console.log("75: ", { email, phone, type, otp });

    // const where: any = {
    //   otp,
    //   type,
    //   used: false,
    //   expires_at: { gt: new Date() },
    // };
    // if (email) where.email = email;
    // if (phone) where.phone = phone;

    // // Find OTP entry
    // const otpRecord = await prisma.UserOtp.findFirst({ where });

    // if (!otpRecord)
    //   return NextResponse.json(
    //     { error: "Invalid or expired OTP" },
    //     { status: 400 }
    //   );

    // // Mark OTP as used to prevent reuse
    // await prisma.otp.update({
    //   where: { id: otpRecord.id },
    //   data: { used: true },
    // });

    return successResponse("OTP verified");
  } catch (error) {
    console.log("Error getting OTP: ", error);
    if (error instanceof z.ZodError)
      return badRequest("Invalid request", error.issues);
    return errorResponse("Internal server error");
  }
}
