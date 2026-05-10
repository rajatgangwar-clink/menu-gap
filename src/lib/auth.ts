// Lightweight bearer-token cache for the demo.
//
// Strategy:
//   1. If NEXT_PUBLIC_API_TOKEN is set in env, use it directly (no login).
//   2. If user has logged in via LoginForm, use the stored token.
//   3. Otherwise login with NEXT_PUBLIC_DEMO_EMAIL / NEXT_PUBLIC_DEMO_PASSWORD,
//      cache the token in memory + sessionStorage, and reuse it for subsequent calls.
//
// Tokens are kept in-memory (and mirrored to sessionStorage so a page reload doesn't
// trigger a fresh login). For a real auth flow, replace this with proper session management.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const STATIC_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN ?? "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI3YjU5MjQ0NS1mZGRjLTQ0YjYtODVlZS00ZGI4MWIxYzEzODciLCJzdWIiOiIzMCIsInNjcCI6InVzZXIiLCJhdWQiOm51bGwsImlhdCI6MTc3ODQ1MTA2NywiZXhwIjoxNzc5MDU1ODY3fQ.xlK9TbrBlf";
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "";

const STORAGE_KEY = "menu_gap_token";
const AUTH_TOKEN_KEY = "auth_token";

let cachedToken: string | null = null;

export interface RestaurantProfile {
  id?: number | string;
  name: string;
}

let cachedRestaurant: RestaurantProfile | null = null;

export class AuthRequiredError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export async function getAuthToken(): Promise<string> {
  if (STATIC_TOKEN) return STATIC_TOKEN;
  if (cachedToken) return cachedToken;

  if (typeof window !== "undefined") {
    // Check for user-provided auth token first
    const userToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (userToken) {
      cachedToken = userToken;
      return userToken;
    }

    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedToken = stored;
      return stored;
    }
  }

  if (!inflight) inflight = loginWithDemoCredentials();
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
  cachedRestaurant = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    STATIC_TOKEN ||
    localStorage.getItem(AUTH_TOKEN_KEY) ||
    sessionStorage.getItem(STORAGE_KEY)
  );
}

async function loginWithDemoCredentials(): Promise<string> {
  if (!API_BASE_URL) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");

  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: { email, password } }),
  });

  if (res.status === 401) {
    throw new Error("Invalid email or password.");
  }
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as LoginResponse;
  if (!data.token) {
    throw new Error("Login response did not include a token.");
  }

  writeToken(data.token);
  const restaurant = extractRestaurant(data);
  if (restaurant) writeRestaurant(restaurant);
  return data.token;
}

// Defensive parse — accept several common response shapes for the restaurant
// metadata since the backend may evolve the field name.
interface LoginResponse {
  token?: string;
  restaurant?: { id?: number | string; name?: string };
  cafe?: { id?: number | string; name?: string };
  user?: {
    restaurant?: { id?: number | string; name?: string };
    cafe?: { id?: number | string; name?: string };
    restaurant_name?: string;
    cafe_name?: string;
    cafe_id?: number | string;
    restaurant_id?: number | string;
  };
}

function extractRestaurant(data: LoginResponse): RestaurantProfile | null {
  const candidates: Array<{ id?: number | string; name?: string } | undefined> = [
    data.restaurant,
    data.cafe,
    data.user?.restaurant,
    data.user?.cafe,
    data.user
      ? {
          name: data.user.restaurant_name ?? data.user.cafe_name,
          id: data.user.restaurant_id ?? data.user.cafe_id,
        }
      : undefined,
  ];
  for (const c of candidates) {
    if (c?.name) return { id: c.id, name: c.name };
  }
  return null;
}
