import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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

const badUnicorn = localFont({
  src: "./fonts/BadUnicornDemoRegular-BVWx.ttf",
  variable: "--font-bad-unicorn",
});

export const metadata: Metadata = {
  title: "Mona",
  description: "Mona",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${badUnicorn.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
