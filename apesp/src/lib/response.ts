// lib/response.ts
import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  code?: string;
}

/**
 * Success response handler
 * @param message - Success message
 * @param data - Optional response data
 * @param status - HTTP status code (default: 200)
 */
export function successResponse<T>(
  message: string,
  data?: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      ...(data && { data }),
    },
    { status }
  );
}

/**
 * Error response handler
 * @param error - Error message
 * @param status - HTTP status code (default: 500)
 * @param code - Optional error code for client handling
 * @param data - Optional additional error data
 */
export function errorResponse<T = any>(
  error: string,
  status: number = 500,
  code?: string,
  data?: T
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(code && { code }),
      ...(data && { data }),
    },
    { status }
  );
}

/**
 * Bad request response (400)
 */
export function badRequest<T = any>(
  error: string,
  data?: T
): NextResponse<ApiResponse<T>> {
  return errorResponse(error, 400, "BAD_REQUEST", data);
}

/**
 * Unauthorized response (401)
 */
export function unauthorized(
  error: string = "Unauthorized"
): NextResponse<ApiResponse> {
  return errorResponse(error, 401, "UNAUTHORIZED");
}

/**
 * Forbidden response (403)
 */
export function forbidden(
  error: string = "Access denied"
): NextResponse<ApiResponse> {
  return errorResponse(error, 403, "FORBIDDEN");
}

/**
 * Not found response (404)
 */
export function notFound(
  error: string = "Resource not found"
): NextResponse<ApiResponse> {
  return errorResponse(error, 404, "NOT_FOUND");
}

/**
 * Conflict response (409)
 */
export function conflict(error: string): NextResponse<ApiResponse> {
  return errorResponse(error, 409, "CONFLICT");
}

/**
 * Created response (201)
 */
export function created<T>(
  message: string,
  data: T
): NextResponse<ApiResponse<T>> {
  return successResponse(message, data, 201);
}

/**
 * No content response (204)
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}