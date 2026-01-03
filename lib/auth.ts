import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        // Initialize Prisma here to avoid webpack issues
        const prisma = new PrismaClient()

        try {
          const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
            deletedAt: null,
          },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
            department: true,
          },
        })

        if (!user || !user.isActive) {
          throw new Error("Invalid credentials")
        }

        if (!user.password) {
          throw new Error("Please set up your password")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        // Get user roles and permissions
        const roles = user.userRoles.map((ur) => ur.role.name)
        const permissions = user.userRoles.flatMap((ur) =>
          ur.role.permissions.map((rp) => rp.permission.name)
        )

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            image: user.image,
            roles,
            permissions,
            departmentId: user.departmentId,
            departmentName: user.department?.name,
          }
        } finally {
          await prisma.$disconnect()
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.roles = user.roles
        token.permissions = user.permissions
        token.departmentId = user.departmentId
        token.departmentName = user.departmentName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.roles = token.roles as string[]
        session.user.permissions = token.permissions as string[]
        session.user.departmentId = token.departmentId as string | null
        session.user.departmentName = token.departmentName as string | undefined
      }
      return session
    },
  },
})
