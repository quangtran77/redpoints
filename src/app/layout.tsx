'use client'

import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js')
  }, [])

  return (
    <html lang="vi">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
} 