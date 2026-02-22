import type { Metadata, Viewport } from "next";
import "./globals.css";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "ReadWriting";

export const metadata: Metadata = {
  title: `${appName} — Upload your writing. Get your text.`,
  description:
    "Turn handwritten notes into digital text. Take a photo or upload a file — ReadWriting reads it for you.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
