import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Message } from "@/lib/models";

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
    const { sessionId, message, chapterId } = body;
    const clientInfo = getClientInfo(request);

    if (!sessionId || !message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await Message.create({
      sessionId,
      message: message.trim(),
      chapterId: chapterId ?? 6,
      sentAt: new Date(),
      ...clientInfo,
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
