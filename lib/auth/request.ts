import type { NextRequest } from "next/server";

export const noStoreHeaders = { "Cache-Control": "private, no-store, max-age=0" } as const;

export function hasValidRequestOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (origin) return origin === request.nextUrl.origin;
  return request.headers.get("sec-fetch-site") === "same-origin";
}
