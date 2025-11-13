import { NextRequest, NextResponse } from "next/server";
import { requireAuthForAPI } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { sites, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { GSCClient } from "@/lib/gsc/client";

/**
 * GSC連携を開始
 * POST /api/connect/gsc
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    let session;
    try {
      session = await requireAuthForAPI();
    } catch (error) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { siteId, siteUrl } = body;

    if (!siteId || !siteUrl) {
      return NextResponse.json(
        { error: "siteId, siteUrl が必要です" },
        { status: 400 }
      );
    }

    // Better Authのアカウント情報からアクセストークンを取得
    const [userAccount] = await db
      .select()
      .from(account)
      .where(eq(account.userId, session.user.id))
      .limit(1);

    if (!userAccount || !userAccount.accessToken) {
      return NextResponse.json(
        { 
          error: "Googleアカウントの連携が見つかりません。再度ログインしてください。",
          requiresReauth: true 
        },
        { status: 401 }
      );
    }

    // スコープを確認（GSC API用のスコープが含まれているか）
    const requiredScope = "https://www.googleapis.com/auth/webmasters.readonly";
    const currentScopes = userAccount.scope || "";
    
    // スコープはカンマ区切りで保存されている（例: "openid,https://www.googleapis.com/auth/userinfo.profile,..."）
    // カンマ区切りで分割して確認
    const scopeArray = currentScopes
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    const hasRequiredScope = scopeArray.includes(requiredScope);

    // デバッグ情報をログに出力
    console.log("=== GSC連携デバッグ情報 ===");
    console.log("Current scopes (raw):", currentScopes);
    console.log("Current scopes (array):", scopeArray);
    console.log("Required scope:", requiredScope);
    console.log("Has required scope:", hasRequiredScope);
    console.log("Access token exists:", !!userAccount.accessToken);
    console.log("Access token length:", userAccount.accessToken?.length || 0);
    
    // スコープチェックは警告のみ（実際のAPI呼び出しで確認）
    if (!hasRequiredScope) {
      console.warn("⚠️ スコープが不足している可能性があります。GSC API呼び出しを試みます...");
    }

    // アクセストークンが期限切れの場合はリフレッシュ（簡易実装）
    // 本番環境では、Better Authのトークンリフレッシュ機能を使用することを推奨
    let accessToken = userAccount.accessToken;
    if (userAccount.accessTokenExpiresAt && new Date(userAccount.accessTokenExpiresAt) < new Date()) {
      // トークンが期限切れの場合、エラーを返す（実際にはリフレッシュトークンで更新する必要がある）
      return NextResponse.json(
        { 
          error: "アクセストークンの有効期限が切れています。再度ログインしてください。",
          requiresReauth: true 
        },
        { status: 401 }
      );
    }

    // サイトの所有権確認
    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: "サイトが見つかりません" }, { status: 404 });
    }

    if (site.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このサイトへのアクセス権限がありません" },
        { status: 403 }
      );
    }

    // GSC APIでサイトの検証
    const gscClient = new GSCClient(accessToken);
    let gscSites;
    try {
      console.log("GSC API呼び出しを開始...");
      gscSites = await gscClient.listSites();
      console.log("GSC API呼び出し成功。サイト数:", gscSites?.length || 0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      console.error("GSC APIエラー:", errorMessage);
      console.error("エラー詳細:", error);
      
      // スコープ不足のエラーを検出
      if (errorMessage.includes("insufficient authentication scopes") || 
          errorMessage.includes("insufficient authentication") ||
          errorMessage.includes("403")) {
        return NextResponse.json(
          { 
            error: "GSC APIにアクセスするための権限が不足しています。以下の手順を確認してください：\n1. GCPプロジェクトで「Google Search Console API」が有効化されているか\n2. OAuth同意画面で「https://www.googleapis.com/auth/webmasters.readonly」スコープが追加されているか\n3. 一度ログアウトしてから再度ログインしてください",
            requiresReauth: true,
            missingScope: "https://www.googleapis.com/auth/webmasters.readonly",
            currentScopes: currentScopes,
            debug: {
              errorMessage,
              hasAccessToken: !!userAccount.accessToken,
              scopeField: currentScopes,
            }
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          error: `GSC API認証エラー: ${errorMessage}`,
          requiresReauth: errorMessage.includes("unauthorized") || errorMessage.includes("Unauthorized") || errorMessage.includes("401"),
          debug: {
            errorMessage,
            currentScopes: currentScopes,
          }
        },
        { status: errorMessage.includes("403") ? 403 : 401 }
      );
    }

    // 指定されたサイトURLがGSCに存在するか確認
    // GSCでは、サイトURLは以下の形式で保存される可能性がある：
    // - https://example.com (URLプレフィックス)
    // - sc-domain:example.com (ドメインプロパティ)
    // - http://example.com (URLプレフィックス)
    
    // デバッグ情報を出力
    console.log("=== サイトURLマッチングデバッグ ===");
    console.log("入力されたsiteUrl:", siteUrl);
    console.log("GSCから取得したサイト一覧:", gscSites.map(s => s.siteUrl));
    
    // siteUrlを正規化（プロトコル、末尾のスラッシュ、www.プレフィックスを削除）
    const normalizedInputUrl = siteUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .replace(/^www\./, "") // www.プレフィックスを削除
      .toLowerCase();
    
    console.log("正規化された入力URL:", normalizedInputUrl);
    
    // ドメインを抽出する関数（www.を無視）
    const extractDomain = (url: string): string => {
      return url
        .replace(/^https?:\/\//, "")
        .replace(/^sc-domain:/, "")
        .replace(/\/$/, "")
        .replace(/^www\./, "") // www.プレフィックスを削除
        .toLowerCase();
    };
    
    const matchedSite = gscSites.find((s) => {
      const gscUrl = s.siteUrl;
      const gscDomain = extractDomain(gscUrl);
      const inputDomain = extractDomain(siteUrl);
      
      console.log(`比較中: "${gscUrl}" (domain: "${gscDomain}") vs "${siteUrl}" (domain: "${inputDomain}")`);
      
      // ドメインが一致するか確認（www.を無視）
      if (gscDomain === inputDomain) {
        console.log("✓ ドメイン一致でマッチ");
        return true;
      }
      
      // 完全一致（大文字小文字を区別しない）
      if (gscUrl.toLowerCase() === siteUrl.toLowerCase()) {
        console.log("✓ 完全一致でマッチ");
        return true;
      }
      
      // 正規化後のURLで比較
      const gscNormalized = extractDomain(gscUrl);
      if (gscNormalized === normalizedInputUrl) {
        console.log("✓ 正規化後でマッチ");
        return true;
      }
      
      console.log("✗ マッチしませんでした");
      return false;
    });

    if (!matchedSite) {
      console.error("=== マッチング失敗 ===");
      console.error("入力URL:", siteUrl);
      console.error("利用可能なGSCサイト:", gscSites.map(s => s.siteUrl));
      return NextResponse.json(
        { 
          error: "指定されたサイトがGoogle Search Consoleに登録されていません",
          debug: {
            inputUrl: siteUrl,
            availableSites: gscSites.map(s => s.siteUrl),
            normalizedInputUrl: normalizedInputUrl,
          }
        },
        { status: 404 }
      );
    }
    
    console.log("✓ マッチしたサイト:", matchedSite.siteUrl);

    // GSC設定を保存
    // アクセストークンはaccountテーブルに既に保存されているため、gscConfigには保存しない
    const gscConfig = {
      siteUrl: matchedSite.siteUrl,
      permissionLevel: matchedSite.permissionLevel,
      connectedAt: new Date().toISOString(),
    };

    await db
      .update(sites)
      .set({
        gscEnabled: true,
        gscConfig: gscConfig as any,
        updatedAt: new Date(),
      })
      .where(eq(sites.id, siteId));

    return NextResponse.json(
      {
        success: true,
        message: "GSC連携が完了しました",
        siteUrl: matchedSite.siteUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GSC連携エラー:", error);
    return NextResponse.json(
      { error: "内部サーバーエラー" },
      { status: 500 }
    );
  }
}

/**
 * GSC連携を解除
 * DELETE /api/connect/gsc
 */
export async function DELETE(request: NextRequest) {
  try {
    // 認証チェック
    let session;
    try {
      session = await requireAuthForAPI();
    } catch (error) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get("siteId");

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId が必要です" },
        { status: 400 }
      );
    }

    // サイトの所有権確認
    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: "サイトが見つかりません" }, { status: 404 });
    }

    if (site.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このサイトへのアクセス権限がありません" },
        { status: 403 }
      );
    }

    // GSC連携を無効化
    await db
      .update(sites)
      .set({
        gscEnabled: false,
        gscConfig: null,
        updatedAt: new Date(),
      })
      .where(eq(sites.id, siteId));

    return NextResponse.json(
      {
        success: true,
        message: "GSC連携を解除しました",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GSC連携解除エラー:", error);
    return NextResponse.json(
      { error: "内部サーバーエラー" },
      { status: 500 }
    );
  }
}

