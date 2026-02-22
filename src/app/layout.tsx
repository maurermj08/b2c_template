import type { Metadata } from "next";
import "./globals.css";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "My App";

export const metadata: Metadata = {
  title: appName,
  description: `Welcome to ${appName}`,
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
