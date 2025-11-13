import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { users, sessions, account, verification } from "../db/schema";

// 環境変数の確認
if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn("⚠️ GOOGLE_CLIENT_ID is not set");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️ GOOGLE_CLIENT_SECRET is not set");
}
if (!process.env.BETTER_AUTH_SECRET) {
  console.warn("⚠️ BETTER_AUTH_SECRET is not set");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: users,
      session: sessions,
      account: account,
      verification: verification,
    },
  }),
  emailAndPassword: {
    enabled: false, // Google OAuthのみ使用
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      scope: [
        "openid", // ← これも必要!
        "email",
        "profile",
        "https://www.googleapis.com/auth/webmasters.readonly", // GSC API用
      ],
      accessType: "offline", // ← 追加!
      prompt: "consent",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30日
    updateAge: 60 * 60 * 24, // 1日ごとに更新
  },
  callbacks: {
    // OAuthコールバック後のリダイレクト先を設定
    // 新規登録の場合は/dashboard/sites/newに、既存ユーザーの場合は/dashboardにリダイレクト
    async afterSignIn({ user, isNewUser }: { user: any; isNewUser: boolean }) {
      if (isNewUser) {
        return "/dashboard/sites/new";
      }
      return "/dashboard";
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "dummy-secret-for-development",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

export type Session = typeof auth.$Infer.Session;
