import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Luxaeon Spaces | Business OS",
  description: "Interior design business operating system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dm.variable} ${outfit.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
