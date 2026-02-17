import React from "react"
import type { Metadata, Viewport } from "next"
import { Noto_Sans_JP } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  weight: ["300", "400", "500", "700", "900"],
})

export const metadata: Metadata = {
  title: "TRI-KNOT | 三日坊主を打ち破る、3人連帯責任フィットネス",
  description:
    "3人1組でランニング・ジム通いを監視し合う、連帯責任型の運動習慣化プラットフォーム。仲間を裏切れない緊張感で、運動を続ける。",
}

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={notoSansJP.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
