import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const targetUrl = new URL(`/verify-email?token=${token}`, request.url);
  return NextResponse.redirect(targetUrl);
}
