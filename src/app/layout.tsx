'use client'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './globals.css'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'
import Link from 'next/link'
import { SessionProvider } from 'next-auth/react'
import NavBar from '@/components/NavBar'

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
    <html lang="en">
      <head>
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
          rel="stylesheet"
          integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <NavBar />
          <main>
            {children}
          </main>
          <footer className="bg-light border-top py-4 mt-5">
            <div className="container">
              <div className="text-center text-muted">
                <p className="mb-0">© 2024 Red Points. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  )
} 