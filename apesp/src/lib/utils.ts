import { type ClassValue } from "clsx";
import clsx from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatAmount(n: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(
    n
  );
}

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
