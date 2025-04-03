import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Toaster } from 'react-hot-toast'
import NavBar from '@/components/NavBar'
import Providers from '@/components/Providers'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Red Points',
  description: 'Hệ thống báo cáo điểm đen giao thông',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="vi">
      <head>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" />
      </head>
      <body className={inter.className}>
        <Providers session={session}>
          <NavBar />
          <Toaster position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  )
} 