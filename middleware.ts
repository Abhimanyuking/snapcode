import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://snapcode.dev",
  "https://snapcode.ai",
  "https://www.snapcode.dev",
  "https://www.snapcode.ai",
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const response = NextResponse.next();

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
