/**
 * Google OAuth トークンリフレッシュユーティリティ
 */

import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface TokenRefreshResponse {
  access_token: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
}

/**
 * Google OAuthアクセストークンをリフレッシュ
 */
export async function refreshGoogleAccessToken(
  userId: string
): Promise<string> {
  // アカウント情報を取得
  const [userAccount] = await db
    .select()
    .from(account)
    .where(eq(account.userId, userId))
    .limit(1);

  if (!userAccount || !userAccount.refreshToken) {
    throw new Error("リフレッシュトークンが見つかりません");
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth設定が不完全です");
  }

  // Google OAuthトークンリフレッシュエンドポイントを呼び出し
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: userAccount.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "不明なエラー" }));
    throw new Error(
      `トークンリフレッシュに失敗しました: ${error.error?.message || response.statusText}`
    );
  }

  const data: TokenRefreshResponse = await response.json();

  // 新しいアクセストークンと有効期限をDBに保存
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 3600));

  await db
    .update(account)
    .set({
      accessToken: data.access_token,
      accessTokenExpiresAt: expiresAt,
      updatedAt: new Date(),
      // スコープが返された場合は更新（通常は同じ）
      ...(data.scope && { scope: data.scope }),
    })
    .where(eq(account.id, userAccount.id));

  return data.access_token;
}

/**
 * 有効なアクセストークンを取得（期限切れの場合は自動リフレッシュ）
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const [userAccount] = await db
    .select()
    .from(account)
    .where(eq(account.userId, userId))
    .limit(1);

  if (!userAccount || !userAccount.accessToken) {
    throw new Error("アクセストークンが見つかりません");
  }

  // トークンが期限切れ、または5分以内に期限切れになる場合はリフレッシュ
  const now = new Date();
  const expiresAt = userAccount.accessTokenExpiresAt
    ? new Date(userAccount.accessTokenExpiresAt)
    : null;

  // 期限切れ、または5分以内に期限切れになる場合
  if (!expiresAt || expiresAt <= new Date(now.getTime() + 5 * 60 * 1000)) {
    if (!userAccount.refreshToken) {
      throw new Error("リフレッシュトークンが見つかりません。再度ログインしてください。");
    }
    console.log("アクセストークンをリフレッシュ中...");
    return await refreshGoogleAccessToken(userId);
  }

  return userAccount.accessToken;
}

