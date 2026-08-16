import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { FailedLogin } from "@/lib/models";

const SECRET_PASSWORD = "7DD1F911";

function getClientInfo(request: NextRequest) {
  return {
    userAgent: request.headers.get("user-agent") || undefined,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { password, sessionId } = body;
    const clientInfo = getClientInfo(request);

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Please enter the password" },
        { status: 400 }
      );
    }

    if (password.toLowerCase() === SECRET_PASSWORD.toLowerCase()) {
      return NextResponse.json({
        success: true,
        message: "Welcome, my love ❤",
      });
    }

    // Store failed login attempt
    await FailedLogin.create({
      sessionId: sessionId || "unknown",
      incorrectPassword: password,
      ...clientInfo,
    });

    return NextResponse.json(
      { success: false, message: "That's not quite right... try again?" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
