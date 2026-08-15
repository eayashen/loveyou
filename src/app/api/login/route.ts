import { NextRequest, NextResponse } from "next/server";

const SECRET_PASSWORD = "7DD1F911";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

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

    return NextResponse.json(
      { success: false, message: "That's not quite right... try again?" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
