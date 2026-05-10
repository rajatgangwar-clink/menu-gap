import { NextResponse, type NextRequest } from "next/server";

// Routes that don't require authentication.
const PUBLIC_PATHS = new Set(["/login"]);

// Cookie name must stay in sync with TOKEN_COOKIE_NAME in src/lib/auth.ts.
const TOKEN_COOKIE = "menu_gap_token";

// Server-side route gate. Renamed from "middleware" → "proxy" in Next 16.
// Runs on every matched request before the page is served.
//
//   • No token + protected path → redirect to /login
//   • Has token + on /login     → redirect to /
//   • Otherwise                 → pass through
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const isPublic = PUBLIC_PATHS.has(pathname);

  if (!token && !isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  if (token && isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, static assets, and any file with an extension (.svg, .png, etc).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
