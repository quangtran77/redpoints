import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

// Log environment variables
console.log('=== Environment Variables ===')
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET)
console.log('NEXTAUTH_SECRET length:', process.env.NEXTAUTH_SECRET?.length)
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID)
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET)
console.log('DATABASE_URL:', process.env.DATABASE_URL)

// Test database connection
console.log('=== Testing Database Connection ===')
prisma.$connect()
  .then(() => {
    console.log('Database connection successful')
  })
  .catch((error) => {
    console.error('Database connection failed:', error)
  })

const ALLOWED_USERS = [
  'qtran1277@gmail.com',
  'quang2t@gmail.com',
  'thuythunghi@gmail.com'
]

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email || !ALLOWED_USERS.includes(user.email)) {
        return false
      }

      try {
        await prisma.$transaction([
          prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
              email: user.email,
              name: user.name || '',
              role: Role.DRIVER,
              points: 0,
              isBlocked: false
            }
          })
        ])
        return true
      } catch {
        return false
      }
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true, points: true, isBlocked: true }
          })
          
          if (user) {
            session.user.id = user.id
            session.user.role = user.role
            session.user.points = user.points
            session.user.isBlocked = user.isBlocked
          }
        } catch {}
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET,
} 