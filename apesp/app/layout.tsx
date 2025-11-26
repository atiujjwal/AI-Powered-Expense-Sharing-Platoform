import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

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
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
