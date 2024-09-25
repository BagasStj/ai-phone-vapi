import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "./not-found";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AI Voice Assistant",
  description: "Agatha AI Voice Assistant",
  icons: {
    icon: [
      { url: '/Agatha_Icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/Agatha_Icon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: { url: '/Agatha_Icon.png', sizes: '180x180', type: 'image/png' },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/Agatha_Icon.png" />
        <link rel="shortcut icon" type="image/png" sizes="16x16" href="/Agatha_Icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/Agatha_Icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
