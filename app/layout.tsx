import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Providers from "@/app/components/Providers";
import ToastFromParams from "@/app/components/ToastFromParams";
import FormSubmissionGuard from "@/app/components/FormSubmissionGuard";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://luxaeonspaces.com"),
  title: {
    default: "Luxaeon Spaces | Interior Design Studio",
    template: "%s | Luxaeon Spaces",
  },
  description:
    "Luxury interior design, project management, and architectural styling for residential and commercial spaces.",
  alternates: {
    canonical: "https://luxaeonspaces.com",
  },
  openGraph: {
    title: "Luxaeon Spaces",
    description:
      "Luxury interior design, concept development, project coordination, and tailored lifestyle spaces.",
    url: "https://luxaeonspaces.com",
    siteName: "Luxaeon Spaces",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxaeon Spaces",
    description:
      "Luxury interior design, project planning, and refined spaces for modern living.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plexSans.variable} font-sans antialiased`}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Suspense fallback={null}>
          <ToastFromParams />
        </Suspense>
        <FormSubmissionGuard />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}