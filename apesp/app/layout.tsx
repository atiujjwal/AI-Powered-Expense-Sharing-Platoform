import "./globals.css";
import type { Metadata } from "next";
import AuthProvider from "../src/providers/AuthProvider";

export const metadata: Metadata = {
  title: "pAIse",
  description: "AI-powered expense sharing and insights",
  icons: {
    icon: "/favicons/apple-touch-icon.png",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="custom-scrollbar">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
