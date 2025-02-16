import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/db";
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { getAccountByUserId } from "./data/account";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  update,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id);

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return true;

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.id = token.id as string;
        session.user.email = token.email;
        session.user.role = token.role as string;
        session.user.employeeId = token.employeeId as string;
        session.user.isApprover = token.isApprover as boolean;
        session.user.isHR = token.isHR as boolean;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(
        existingUser.id
      );
      token.isOAuth = !!existingAccount;
      token.firstName = existingUser.firstName;
      token.lastName = existingUser.lastName;
      token.id = existingUser.id;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.employeeId = existingUser.employeeId;
      return token;
    }
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt",
    maxAge: 60 * 60,
    updateAge: 24 * 60 * 60,
   },
  ...authConfig,
});
