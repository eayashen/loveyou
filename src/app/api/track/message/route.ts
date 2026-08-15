import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message } = body;

    if (!sessionId || !message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await db.trackedMessage.create({
      data: {
        sessionId,
        message: message.trim(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Message tracking error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
