import { NextRequest, NextResponse } from "next/server";
import { requireAuthForAPI } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { sites } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// サイト一覧取得
export async function GET() {
  try {
    const session = await requireAuthForAPI();
    const userId = session.user.id;

    const userSites = await db
      .select()
      .from(sites)
      .where(eq(sites.userId, userId));

    return NextResponse.json({ sites: userSites });
  } catch (error) {
    console.error("サイト一覧取得エラー:", error);
    return NextResponse.json(
      { error: "サイト一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// サイト登録
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthForAPI();
    const userId = session.user.id;

    const body = await request.json();
    const { domain, name } = body;

    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { error: "ドメインは必須です" },
        { status: 400 }
      );
    }

    // ドメインの正規化（プロトコルや末尾スラッシュを削除）
    const normalizedDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .toLowerCase()
      .trim();

    // 同じユーザーが既に同じドメインを登録しているか確認
    const existingSite = await db
      .select()
      .from(sites)
      .where(eq(sites.domain, normalizedDomain))
      .limit(1);

    if (existingSite.length > 0) {
      // 同じユーザーの場合は、既存のサイトを返す
      if (existingSite[0].userId === userId) {
        return NextResponse.json(
          { 
            site: existingSite[0],
            message: "このドメインは既に登録されています"
          },
          { status: 200 }
        );
      }
      // 別のユーザーが登録している場合はエラー
      return NextResponse.json(
        { error: "このドメインは既に他のユーザーによって登録されています" },
        { status: 400 }
      );
    }

    // サイトを登録
    const [newSite] = await db
      .insert(sites)
      .values({
        userId,
        domain: normalizedDomain,
        name: name || normalizedDomain,
        trackingEnabled: true,
      })
      .returning();

    return NextResponse.json({ site: newSite }, { status: 201 });
  } catch (error) {
    console.error("サイト登録エラー:", error);
    return NextResponse.json(
      { error: "サイトの登録に失敗しました" },
      { status: 500 }
    );
  }
}

