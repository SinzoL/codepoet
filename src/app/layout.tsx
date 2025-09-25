import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodePoet",
  description: "用代码编织诗意，用技术书写人生。分享编程艺术、技术思考与数字生活的诗意空间。",
  icons: {
    icon: "/huitu-poem.png",
    shortcut: "/huitu-poem.png",
    apple: "/huitu-poem.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
