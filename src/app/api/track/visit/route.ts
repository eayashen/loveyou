import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, pageType, chapterId, chapterTitle, durationSeconds } = body;

    if (!sessionId || !pageType) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await db.visit.create({
      data: {
        sessionId,
        pageType,
        chapterId: chapterId ?? null,
        chapterTitle: chapterTitle || "",
        durationSeconds: durationSeconds ?? 0,
      },
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
