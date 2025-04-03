import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/lib/prisma'
import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id
        session.user.role = user.role
        session.user.points = user.points
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
} 