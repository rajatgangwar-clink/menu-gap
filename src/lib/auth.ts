// Lightweight bearer-token cache for the demo.
//
// Strategy:
//   1. If NEXT_PUBLIC_API_TOKEN is set in env, use it directly (no login).
//   2. Otherwise login once with NEXT_PUBLIC_DEMO_EMAIL / NEXT_PUBLIC_DEMO_PASSWORD,
//      cache the token in memory + sessionStorage, and reuse it for subsequent calls.
//
// Tokens are kept in-memory (and mirrored to sessionStorage so a page reload doesn't
// trigger a fresh login). For a real auth flow, replace this with proper session management.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const STATIC_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "";

const STORAGE_KEY = "menu_gap_token";

let cachedToken: string | null = null;
let inflight: Promise<string> | null = null;

export async function getAuthToken(): Promise<string> {
  if (STATIC_TOKEN) return STATIC_TOKEN;
  if (cachedToken) return cachedToken;

  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedToken = stored;
      return stored;
    }
  }

  if (!inflight) inflight = login();
  try {
    const token = await inflight;
    cachedToken = token;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, token);
    }
    return token;
  } finally {
    inflight = null;
  }
}

export function clearAuthToken(): void {
  cachedToken = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

async function login(): Promise<string> {
  if (!API_BASE_URL) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  if (!DEMO_EMAIL || !DEMO_PASSWORD) {
    throw new Error("NEXT_PUBLIC_DEMO_EMAIL / NEXT_PUBLIC_DEMO_PASSWORD must be set");
  }

  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: { email: DEMO_EMAIL, password: DEMO_PASSWORD } }),
  });

  if (!res.ok) {
    throw new Error(`Login failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { token?: string };
  if (!data.token) {
    throw new Error("Login response did not include a token");
  }
  return data.token;
}
