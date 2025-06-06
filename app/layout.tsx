import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "bootstrap/dist/css/bootstrap.min.css"
import { UserProvider } from "@auth0/nextjs-auth0"
import { TRPCProvider } from "./providers/trpc-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ChatGPT Mobile Clone",
  description: "A mobile-first ChatGPT clone built with Next.js",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </UserProvider>
      </body>
    </html>
  )
}
