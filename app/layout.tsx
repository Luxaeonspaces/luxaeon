import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Providers from "@/components/Providers";
import ToastFromParams from "@/components/ToastFromParams";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Luxaeon Spaces | Business OS",
  description: "Interior design business operating system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plexSans.variable} font-sans antialiased`}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Suspense fallback={null}>
          <ToastFromParams />
        </Suspense>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}