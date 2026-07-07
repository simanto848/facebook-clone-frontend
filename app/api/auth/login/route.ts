import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") || "",
        "X-Forwarded-For": request.headers.get("x-forwarded-for") || "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      const responseNext = NextResponse.json(data, { status: response.status });
      // Forward the Set-Cookie headers from the backend to the client
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
      return responseNext;
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
