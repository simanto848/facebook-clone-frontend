import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const clientCookies = request.headers.get("cookie") || "";

    const response = await fetch(`${backendUrl}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": clientCookies,
        "User-Agent": request.headers.get("user-agent") || "",
        "X-Forwarded-For": request.headers.get("x-forwarded-for") || "",
      },
    });

    const data = await response.json();
    const responseNext = NextResponse.json(data, { status: response.status });

    if (response.ok && data.success) {
      // Forward the Set-Cookie headers (rotated refresh token) from the backend to the client
      const setCookies = response.headers.getSetCookie();
      if (setCookies.length > 0) {
        setCookies.forEach((cookieStr) => {
          responseNext.headers.append("Set-Cookie", cookieStr);
        });
      } else {
        const setCookieHeader = response.headers.get("set-cookie");
        if (setCookieHeader) {
          responseNext.headers.set("Set-Cookie", setCookieHeader);
        }
      }
    }

    return responseNext;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
