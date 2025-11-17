import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is not set");
}

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export interface AnalyticsData {
  totalVisitors: number;
  totalPageviews: number;
  avgBounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{
    path: string;
    pageviews: number;
    bounceRate: number;
  }>;
  topSources: Array<{
    source: string;
    visitors: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  gscData?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    topQueries?: Array<{
      query: string;
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }>;
  };
}

export interface Insight {
  category: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionItems: string[];
}

export async function generateAIInsights(
  data: AnalyticsData
): Promise<Insight[]> {
  if (!genAI) {
    // APIキーが設定されていない場合は空配列を返す
    return [];
  }

  try {
    const prompt = `あなたはWebサイト分析の専門家です。以下のデータを分析して、改善すべきポイントを3つまで提案してください。

データ:
- 総訪問者数: ${data.totalVisitors}
- 総ページビュー: ${data.totalPageviews}
- 平均直帰率: ${data.avgBounceRate}%
- 平均セッション時間: ${data.avgSessionDuration}秒
${data.gscData ? `
- GSCデータ:
  - クリック数: ${data.gscData.clicks}
  - インプレッション: ${data.gscData.impressions}
  - CTR: ${data.gscData.ctr}%
  - 平均順位: ${data.gscData.position}
  ${data.gscData.topQueries ? `- 上位クエリ: ${data.gscData.topQueries.map(q => q.query).join(", ")}` : ""}
` : ""}
- 人気ページ:
${data.topPages.slice(0, 5).map((p, i) => `  ${i + 1}. ${p.path} (${p.pageviews}PV, 直帰率${p.bounceRate}%)`).join("\n")}
- 流入元:
${data.topSources.slice(0, 5).map((s, i) => `  ${i + 1}. ${s.source} (${s.visitors}訪問者)`).join("\n")}
- デバイス分布:
  - モバイル: ${data.deviceBreakdown.mobile}%
  - デスクトップ: ${data.deviceBreakdown.desktop}%
  - タブレット: ${data.deviceBreakdown.tablet}%

以下のJSON形式で回答してください（SEO改善に焦点を当てて）:
[
  {
    "category": "SEO",
    "priority": "high|medium|low",
    "title": "改善ポイントのタイトル",
    "description": "詳細な説明（なぜ重要か、何が問題か）",
    "actionItems": ["具体的なアクション1", "具体的なアクション2"]
  }
]

重要: JSONのみを返してください。説明文は不要です。`;

    // Gemini 2.5 Proを使用（最新版）
    // 利用できない場合は1.5-flashにフォールバック
    let result;
    let response;
    let text;
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      result = await model.generateContent(prompt);
      response = await result.response;
      text = response.text();
    } catch (e: any) {
      // 2.5-proが利用できない場合は1.5-flashを使用
      if (e?.status === 404 || e?.message?.includes("not found")) {
        console.log("Gemini 2.5 Pro not available, falling back to 1.5-flash");
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        result = await fallbackModel.generateContent(prompt);
        response = await result.response;
        text = response.text();
      } else {
        throw e;
      }
    }

    // JSONを抽出（```json で囲まれている場合がある）
    let jsonText = text.trim();
    if (jsonText.includes("```json")) {
      jsonText = jsonText.split("```json")[1].split("```")[0].trim();
    } else if (jsonText.includes("```")) {
      jsonText = jsonText.split("```")[1].split("```")[0].trim();
    }

    const insights = JSON.parse(jsonText) as Insight[];
    return insights.slice(0, 3); // 最大3件
  } catch (error) {
    console.error("Gemini API error:", error);
    return [];
  }
}

