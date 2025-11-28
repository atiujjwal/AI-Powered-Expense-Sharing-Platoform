import { prisma } from "@/src/lib/db";
import { badRequest, errorResponse, successResponse } from "@/src/lib/response";
import { sendEmailOtp } from "@/src/services/otpServices";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    sendOtpSchema.parse({ email, phone, type });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.userOtp.create({
      data: { email, phone, otp, type, expires_at: expiresAt },
    });

    if (email) {
      await sendEmailOtp(email, otp);
    } else if (phone) {
      // TODO: implement phone otp
      console.log(`[SMS MOCK] To: ${phone}, OTP: ${otp}`);
    }

    return successResponse("OTP sent successfully", {
      message: "OTP sent",
      otp, // REMOVE in production!
      expiresAt,
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

    const where: any = {
      otp,
      type,
      used: false,
      expires_at: { gt: new Date() },
    };
    if (email) where.email = email;
    if (phone) where.phone = phone;

    const otpRecord = await prisma.userOtp.findFirst({
      where: {
        email,
        otp,
        type,
        used: false,
        expires_at: { gt: new Date() },
      },
    });

    if (!otpRecord)
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
      
    await prisma.userOtp.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    return successResponse("OTP verified");
  } catch (error) {
    console.log("Error getting OTP: ", error);
    if (error instanceof z.ZodError)
      return badRequest("Invalid request", error.issues);
    return errorResponse("Internal server error");
  }
}
