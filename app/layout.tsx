import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image Background Remover - Remove Background Online",
  description:
    "Remove image backgrounds automatically and download transparent PNGs online. Fast, simple, and no signup required.",
  keywords: [
    "image background remover",
    "remove background from image",
    "transparent PNG",
    "background remover online",
    "remove image background"
  ],
  openGraph: {
    title: "Image Background Remover",
    description:
      "Remove image backgrounds automatically and download transparent PNGs in seconds.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics gaId="G-H4JB8RP5PY" />
      </body>
    </html>
  );
}
