import { redirect } from "next/navigation";
import { auth } from "./config";
import { headers } from "next/headers";
import { db } from "../db";
import { sites } from "../db/schema";
import { eq } from "drizzle-orm";

/**
 * 認証ガード: 未認証ユーザーをログインページにリダイレクト
 * @returns 認証済みセッション
 */
export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

/**
 * サイト所有権確認: ユーザーが指定されたサイトにアクセス権限があるか確認
 * @param siteId サイトID
 * @param userId ユーザーID
 * @returns サイト情報（存在する場合）
 * @throws サイトが存在しない、またはアクセス権限がない場合にエラー
 */
export async function requireSiteAccess(siteId: string, userId: string) {
  const [site] = await db
    .select()
    .from(sites)
    .where(eq(sites.id, siteId))
    .limit(1);

  if (!site) {
    redirect("/dashboard");
  }

  if (site.userId !== userId) {
    redirect("/dashboard");
  }

  return site;
}

/**
 * 認証ガード + サイト所有権確認の組み合わせ
 * @param siteId サイトID
 * @returns セッションとサイト情報
 */
export async function requireAuthAndSiteAccess(siteId: string) {
  const session = await requireAuth();
  const site = await requireSiteAccess(siteId, session.user.id);

  return { session, site };
}

/**
 * オプショナル認証: 認証されていない場合はnullを返す（リダイレクトしない）
 * @returns セッション（認証されていない場合はnull）
 */
export async function getOptionalAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

/**
 * APIルート用認証チェック: 未認証の場合はエラーをthrow（リダイレクトしない）
 * @returns 認証済みセッション
 * @throws 未認証の場合
 */
export async function requireAuthForAPI() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("認証が必要です");
  }

  return session;
}

