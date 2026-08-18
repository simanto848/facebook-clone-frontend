import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppLayoutWrapper from "@/components/layout/AppLayoutWrapper";
import { AuthProvider } from "@/providers/AuthProvider";
import { AuthGuard } from "@/components/providers/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Your World",
  description: "Social network application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-[#0b0f19] text-white min-h-screen">
        <AuthProvider>
          <AuthGuard>
            <AppLayoutWrapper>{children}</AppLayoutWrapper>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
