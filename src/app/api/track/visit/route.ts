import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Visit } from "@/lib/models";

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
    const { sessionId, pageType, chapterId, chapterTitle, durationSeconds } = body;
    const clientInfo = getClientInfo(request);

    if (!sessionId || !pageType) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await Visit.create({
      sessionId,
      pageType,
      chapterId: chapterId ?? null,
      chapterTitle: chapterTitle || "",
      durationSeconds: durationSeconds ?? 0,
      visitedAt: new Date(),
      ...clientInfo,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Visit tracking error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
