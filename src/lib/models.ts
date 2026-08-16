import mongoose, { Schema, Document } from "mongoose";

/* ------------------------------------------------------------------ */
/*  Visit Schema — tracks page/chapter visits & time spent             */
/* ------------------------------------------------------------------ */
export interface IVisit extends Document {
  sessionId: string;
  pageType: "login" | "chapter" | "message_page";
  chapterId: number | null;
  chapterTitle: string;
  durationSeconds: number;
  visitedAt: Date;
  userAgent?: string;
  ip?: string;
}

const VisitSchema = new Schema<IVisit>(
  {
    sessionId: { type: String, required: true, index: true },
    pageType: { type: String, required: true, enum: ["login", "chapter", "message_page"] },
    chapterId: { type: Number, default: null },
    chapterTitle: { type: String, default: "" },
    durationSeconds: { type: Number, default: 0 },
    visitedAt: { type: Date, default: Date.now },
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

export const Visit = mongoose.models.Visit || mongoose.model<IVisit>("Visit", VisitSchema);

/* ------------------------------------------------------------------ */
/*  Message Schema — stores messages from "Say something about me"     */
/* ------------------------------------------------------------------ */
export interface IMessage extends Document {
  sessionId: string;
  message: string;
  chapterId: number;
  sentAt: Date;
  userAgent?: string;
  ip?: string;
}

const MessageSchema = new Schema<IMessage>(
  {
    sessionId: { type: String, required: true, index: true },
    message: { type: String, required: true },
    chapterId: { type: Number, default: 6 },
    sentAt: { type: Date, default: Date.now },
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

export const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

/* ------------------------------------------------------------------ */
/*  FailedLogin Schema — stores incorrect password attempts             */
/* ------------------------------------------------------------------ */
export interface IFailedLogin extends Document {
  sessionId: string;
  incorrectPassword: string;
  attemptedAt: Date;
  userAgent?: string;
  ip?: string;
}

const FailedLoginSchema = new Schema<IFailedLogin>(
  {
    sessionId: { type: String, required: true, index: true },
    incorrectPassword: { type: String, required: true },
    attemptedAt: { type: Date, default: Date.now },
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

export const FailedLogin = mongoose.models.FailedLogin || mongoose.model<IFailedLogin>("FailedLogin", FailedLoginSchema);
