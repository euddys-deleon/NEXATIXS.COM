import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

// Only same-origin (the site itself) may read API responses. NEXT_PUBLIC_SITE_URL
// is the production origin; localhost is added for dev regardless of NODE_ENV
// since that env var isn't set in every local setup.
const ALLOWED_ORIGINS = [process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000"].filter(
  (value): value is string => Boolean(value),
);

function withCors(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    response.headers.set("Vary", "Origin");
  }
  return response;
}

export default async function proxy(request: NextRequest) {
  // API routes are not locale-prefixed and don't need the Supabase session
  // cookie refresh (each route reads its own auth) — handle CORS here,
  // centrally, instead of repeating it across every route.ts file.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      return withCors(request, new NextResponse(null, { status: 204 }));
    }
    return withCors(request, NextResponse.next());
  }

  const response = await intlMiddleware(request);
  return updateSession(request, response);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
