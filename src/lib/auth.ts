import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

const isDev = process.env.NODE_ENV !== "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    // 開発用：任意のメールアドレスでログイン可能
    ...(isDev
      ? [
          Credentials({
            name: "開発用ログイン",
            credentials: {
              email: { label: "メールアドレス", type: "email" },
              name: { label: "名前", type: "text" },
            },
            async authorize(credentials) {
              const email = credentials?.email as string;
              const name = (credentials?.name as string) || "テストユーザー";
              if (!email) return null;

              // ユーザーが存在しなければ作成
              let user = await db.user.findUnique({ where: { email } });
              if (!user) {
                user = await db.user.create({ data: { email, name } });
              }
              return { id: user.id, email: user.email, name: user.name };
            },
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
