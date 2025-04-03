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
    async signIn({ user, account, profile }) {
      console.log('=== SignIn Callback ===')
      console.log('User:', user)
      console.log('Account:', account)
      console.log('Profile:', profile)

      if (!user.email) {
        console.log('No email provided')
        return false
      }
      
      try {
        console.log('Attempting to upsert user:', user.email)
        const result = await prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            email: user.email,
            name: user.name,
            role: Role.DRIVER,
            points: 0,
            isBlocked: false
          }
        })
        console.log('Upsert result:', result)
        return true
      } catch (error) {
        console.error('SignIn error:', error)
        return false
      }
    },
    async session({ session }) {
      console.log('=== Session Callback ===')
      console.log('Session:', session)

      if (!session.user?.email) {
        console.log('No user email in session')
        return session
      }

      try {
        console.log('Fetching user from database:', session.user.email)
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            role: true,
            points: true,
            isBlocked: true
          }
        })
        console.log('Database user:', dbUser)

        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role as Role
          session.user.points = dbUser.points
          session.user.isBlocked = dbUser.isBlocked
        }

        return session
      } catch (error) {
        console.error('Session error:', error)
        return session
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
} 