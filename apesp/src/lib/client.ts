import { STORAGE_KEYS } from "./constants";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

export function getAuthUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthUser(user: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearAuthUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
}

export async function authorizedFetch(input: RequestInfo, init?: RequestInit) {
  const url = typeof input === "string" ? input : input.url;
  const token = getAuthToken();

  const headers = new Headers(init?.headers ?? {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  // JSON by default for body-based requests
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...init, headers });

  if (res.status === 204) return undefined;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(body?.message || res.statusText || "Request failed");
    // attach status to the error for caller to inspect
    // @ts-ignore
    err.status = res.status;
    throw err;
  }

  return body;
}
