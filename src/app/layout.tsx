import type { Metadata } from "next";
import { Dancing_Script, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "For You, With All My Love ❤",
  description: "A love story written just for you.",
  icons: {
    icon: "/love-images/login-bg.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dancingScript.variable} ${playfairDisplay.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
