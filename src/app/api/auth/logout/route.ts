import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    
    // 現在のセッションを取得
    const session = await auth.api.getSession({
      headers: headersList,
    });

    // セッションが存在する場合、データベースから削除
    // Better Authのセッション構造に応じてセッションIDを取得
    if (session?.user?.id) {
      // ユーザーIDでセッションを検索して削除
      await db
        .delete(sessions)
        .where(eq(sessions.userId, session.user.id));
    }

    // 成功レスポンスを返す
    const response = NextResponse.json(
      { success: true, message: "ログアウトしました" },
      { status: 200 }
    );
    
    // セッションCookieをクリア
    // Better AuthのCookie名を確認して削除
    const cookieName = "better-auth.session_token";
    response.cookies.set(cookieName, "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    
    return response;
  } catch (error) {
    console.error("ログアウトエラー:", error);
    // エラーが発生してもCookieをクリアして成功レスポンスを返す
    const response = NextResponse.json(
      { success: true, message: "ログアウトしました" },
      { status: 200 }
    );
    
    // セッションCookieをクリア
    const cookieName = "better-auth.session_token";
    response.cookies.set(cookieName, "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    
    return response;
  }
}

