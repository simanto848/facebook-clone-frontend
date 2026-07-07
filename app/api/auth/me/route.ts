import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const clientCookies = request.headers.get("cookie") || "";

    const refreshRes = await fetch(`${backendUrl}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": clientCookies,
        "User-Agent": request.headers.get("user-agent") || "",
        "X-Forwarded-For": request.headers.get("x-forwarded-for") || "",
      },
    });

    if (!refreshRes.ok) {
      return NextResponse.json(
        { success: false, message: "Session expired" },
        { status: 401 }
      );
    }

    const refreshData = await refreshRes.json();
    const accessToken = refreshData.data?.accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Token refresh failed" },
        { status: 401 }
      );
    }

    const userRes = await fetch(`${backendUrl}/users/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!userRes.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch user profile" },
        { status: 401 }
      );
    }

    const userData = await userRes.json();

    const responseNext = NextResponse.json({
      success: true,
      data: {
        user: userData.data,
        accessToken,
      }
    });

    const setCookies = refreshRes.headers.getSetCookie();
    if (setCookies.length > 0) {
      setCookies.forEach((cookieStr) => {
        responseNext.headers.append("Set-Cookie", cookieStr);
      });
    } else {
      const setCookieHeader = refreshRes.headers.get("set-cookie");
      if (setCookieHeader) {
        responseNext.headers.set("Set-Cookie", setCookieHeader);
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
