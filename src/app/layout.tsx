import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const telegraf = localFont({
  src: "./fonts/TelegrafRegular.otf",
  variable: "--font-telegraf",
});

export const metadata: Metadata = {
  title: "RateMyCitra",
  description: "Review and explore citra subjects",
};

// Enable/disable maintenance mode
const MAINTENANCE_MODE = false;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Providers>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} ${telegraf.variable} antialiased `}
          >
            {MAINTENANCE_MODE ? (
              <div className="text-center p-6 font-telegraf flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <h1 className="text-2xl font-bold">
                  🚧 Building in Progress 🚧
                </h1>
                <p className="mt-2 text-gray-600 max-w-md">
                  Due to concerns about maintaining a fair and constructive
                  review system, we have temporarily paused submissions while we
                  enhance our moderation process. Thank you for your patience as
                  we improve the platform!
                </p>
              </div>
            ) : (
              <>
                {children}
                <Analytics />
                <Toaster />
              </>
            )}
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  );
}
