// Bearer-token cache. The token is acquired via the /login endpoint
// (see loginWithCredentials) and mirrored to:
//   - sessionStorage   → fast client-side reads
//   - a cookie         → so Next.js Proxy (middleware) can gate routes server-side
//
// Both are kept in sync via writeToken / clearAuthToken.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
// Optional override — only honored if the env var is set. Empty / unset means
// the user must log in to get a token.
const STATIC_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export const TOKEN_COOKIE_NAME = "menu_gap_token";
const STORAGE_KEY = TOKEN_COOKIE_NAME;
const RESTAURANT_STORAGE_KEY = "menu_gap_restaurant";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours

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
    const stored = sessionStorage.getItem(STORAGE_KEY) ?? readCookie(TOKEN_COOKIE_NAME);
    if (stored) {
      cachedToken = stored;
      return stored;
    }
  }

  throw new AuthRequiredError("Not authenticated. Sign in first.");
}

export function isAuthenticated(): boolean {
  if (STATIC_TOKEN) return true;
  if (cachedToken) return true;
  if (typeof window === "undefined") return false;
  return !!(sessionStorage.getItem(STORAGE_KEY) || readCookie(TOKEN_COOKIE_NAME));
}

export function clearAuthToken(): void {
  cachedToken = null;
  cachedRestaurant = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(RESTAURANT_STORAGE_KEY);
    writeCookie(TOKEN_COOKIE_NAME, "", 0);
    notifyAuthChange();
  }
}

export function getRestaurant(): RestaurantProfile | null {
  if (cachedRestaurant) return cachedRestaurant;
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(RESTAURANT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as RestaurantProfile;
    cachedRestaurant = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function writeRestaurant(restaurant: RestaurantProfile | null) {
  cachedRestaurant = restaurant;
  if (typeof window === "undefined") return;
  if (restaurant) {
    sessionStorage.setItem(RESTAURANT_STORAGE_KEY, JSON.stringify(restaurant));
  } else {
    sessionStorage.removeItem(RESTAURANT_STORAGE_KEY);
  }
}

function writeToken(token: string) {
  cachedToken = token;
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, token);
    writeCookie(TOKEN_COOKIE_NAME, token, COOKIE_MAX_AGE_SECONDS);
    notifyAuthChange();
  }
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "path=/",
    `max-age=${maxAgeSeconds}`,
    "samesite=lax",
  ];
  if (isSecure) parts.push("secure");
  document.cookie = parts.join("; ");
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("menugap:auth-change"));
  }
}

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<string> {
  if (!API_BASE_URL) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");

  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: { email, password } }),
  });

  // 401 is unambiguous — bad credentials.
  if (res.status === 401) {
    throw new Error("Invalid email or password.");
  }

  // The Render backend quirkily returns HTTP 422 alongside a valid token on
  // success, so we parse the body regardless of status code and treat the
  // presence of a `token` as the source of truth.
  let data: LoginResponse | null = null;
  try {
    data = (await res.json()) as LoginResponse;
  } catch {
    // Body wasn't JSON — fall through to error handling.
  }

  if (data?.token) {
    writeToken(data.token);
    const restaurant = extractRestaurant(data);
    if (restaurant) writeRestaurant(restaurant);
    return data.token;
  }

  // No token + non-2xx → bubble up a useful error message if the server
  // provided one, otherwise the status line.
  if (!res.ok) {
    const serverMessage =
      data && typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : data && typeof (data as { message?: unknown }).message === "string"
          ? (data as { message: string }).message
          : null;
    throw new Error(serverMessage ?? `Login failed: ${res.status} ${res.statusText}`);
  }

  throw new Error("Login response did not include a token.");
}

// Defensive parse — accept several common response shapes for the restaurant
// metadata since the backend may evolve the field name.
interface LoginResponse {
  token?: string;
  restaurant?: { id?: number | string; name?: string };
  cafe?: { id?: number | string; name?: string };
  cafes?: Array<{ id?: number | string; name?: string }>;
  restaurants?: Array<{ id?: number | string; name?: string }>;
  user?: {
    restaurant?: { id?: number | string; name?: string };
    cafe?: { id?: number | string; name?: string };
    cafes?: Array<{ id?: number | string; name?: string }>;
    restaurants?: Array<{ id?: number | string; name?: string }>;
    restaurant_name?: string;
    cafe_name?: string;
    cafe_id?: number | string;
    restaurant_id?: number | string;
  };
}

function extractRestaurant(data: LoginResponse): RestaurantProfile | null {
  const candidates: Array<{ id?: number | string; name?: string } | undefined> = [
    data.cafes?.[0],
    data.restaurants?.[0],
    data.restaurant,
    data.cafe,
    data.user?.cafes?.[0],
    data.user?.restaurants?.[0],
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
