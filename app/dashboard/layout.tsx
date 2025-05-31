import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/app/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CODEFLIX - 온라인 강의 플랫폼",
  description: "Next.js로 만든 E-Learning 프로젝트",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className="dark">
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        <FloatingContactButtonWrapper />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'
import  FloatingContactButtonWrapper  from "@/components/chat/floating-contact-button-wrapper"