import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

console.log('Environment variables:')
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET)
console.log('NEXTAUTH_SECRET length:', process.env.NEXTAUTH_SECRET?.length)
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID)
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET)

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
    async signIn({ user, account }) {
      try {
        if (!user.email) return false

        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true }
        })

        if (!dbUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              role: Role.DRIVER,
              points: 0,
              isBlocked: false
            },
            select: { id: true }
          })
        }

        return true
      } catch (error) {
        console.error('SignIn error:', error)
        return false
      }
    },
    async session({ session, token }) {
      try {
        if (!session.user?.email) return session

        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            role: true,
            points: true,
            isBlocked: true
          }
        })

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