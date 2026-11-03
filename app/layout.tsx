import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Chiffrage ASR Nettoyage",
  description: "Application de chiffrage ASR",
  icons: {
    icon: "/ASR-logo.svg",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={cn("font-medium bg-[#F6F7FD]", poppins.className)}>
        {children}
      </body>
    </html>
  )
}
