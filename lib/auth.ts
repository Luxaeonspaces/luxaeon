import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { DEMO_FOUNDER, isDemoFounderLogin } from "./demoAuth";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("MISSING");
        }
        const username = credentials.username.toLowerCase().trim();
        let user = await prisma.user.findUnique({ where: { username } });

        if (isDemoFounderLogin(username, credentials.password)) {
          const demoHashOk = user
            ? await bcrypt.compare(DEMO_FOUNDER.password, user.passwordHash)
            : false;
          if (!user || !user.active || user.role !== DEMO_FOUNDER.role || !demoHashOk) {
            const passwordHash = await bcrypt.hash(DEMO_FOUNDER.password, 10);
            user = await prisma.user.upsert({
              where: { username: DEMO_FOUNDER.username },
              update: {
                passwordHash,
                fullName: DEMO_FOUNDER.fullName,
                role: DEMO_FOUNDER.role,
                department: DEMO_FOUNDER.department,
                active: true,
              },
              create: {
                username: DEMO_FOUNDER.username,
                fullName: DEMO_FOUNDER.fullName,
                passwordHash,
                role: DEMO_FOUNDER.role,
                department: DEMO_FOUNDER.department,
                active: true,
              },
            });
          }
        }

        if (!user) {
          // Deleted or never existed
          throw new Error("DELETED");
        }
        if (!user.active) {
          throw new Error("DISABLED");
        }

        const ok =
          isDemoFounderLogin(username, credentials.password) ||
          (await bcrypt.compare(credentials.password, user.passwordHash));
        if (!ok) {
          throw new Error("INVALID");
        }

        await prisma.auditLog.create({
          data: {
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            department: user.department,
            action: "Login",
            entityType: "user",
            entityId: user.id,
            details: "Successful login",
          },
        });

        return {
          id: user.id,
          name: user.fullName,
          email: user.username,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          department: user.department,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.id = u.id;
        token.username = u.username;
        token.fullName = u.fullName;
        token.role = u.role;
        token.department = u.department;
        token.active = true;
      }
      // Live check — block mid-session if disabled or deleted
      if (token.id) {
        try {
          const fresh = await prisma.user.findUnique({ where: { id: String(token.id) } });
          if (!fresh) {
            token.active = false;
            token.disabledReason = "DELETED";
            token.role = "Inactive";
          } else if (!fresh.active) {
            token.active = false;
            token.disabledReason = "DISABLED";
            token.role = "Inactive";
            token.fullName = fresh.fullName;
            token.username = fresh.username;
            token.department = fresh.department;
          } else {
            token.active = true;
            token.disabledReason = undefined;
            token.username = fresh.username;
            token.fullName = fresh.fullName;
            token.role = fresh.role;
            token.department = fresh.department;
          }
        } catch {
          /* ignore */
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).fullName = token.fullName;
        (session.user as any).role = token.role;
        (session.user as any).department = token.department;
        (session.user as any).active = token.active !== false;
        (session.user as any).disabledReason = token.disabledReason;
      }
      return session;
    },
  },
};
