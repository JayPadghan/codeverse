import type { Metadata } from "next";
import {  Poppins } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],


})

export const metadata: Metadata = {
  title: "CodeVerse - Editor",
  description: "CodeVerse - Editor - Code Editor For VibeCoders is a free online code editor that lets you write, debug, and run your code in the browser. It is an open source editor that is easy to use and has a simple interface. It is also a great way to learn programming and get started with coding.",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
    <html lang="en" suppressHydrationWarning>
      <body
        className={` ${poppins.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster/>

        {children}
        </ThemeProvider>
      </body>
    </html>
    </SessionProvider>
  );
}
