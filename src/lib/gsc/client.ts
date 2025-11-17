/**
 * Google Search Console API クライアント
 */

interface GSCSearchAnalyticsParams {
  siteUrl: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  dimensions?: ("query" | "page" | "country" | "device")[];
  rowLimit?: number;
  startRow?: number;
}

interface GSCSearchAnalyticsResponse {
  rows: Array<{
    keys: string[];
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

interface GSCSite {
  siteUrl: string;
  permissionLevel: string;
}

/**
 * Google Search Console API クライアント
 */
export class GSCClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * アクセストークンを更新
   */
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * 認証済みサイト一覧を取得
   */
  async listSites(): Promise<GSCSite[]> {
    const response = await fetch(
      "https://www.googleapis.com/webmasters/v3/sites",
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `GSC API Error: ${error.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return data.siteEntry || [];
  }

  /**
   * 検索アナリティクスデータを取得
   */
  async getSearchAnalytics(
    params: GSCSearchAnalyticsParams
  ): Promise<GSCSearchAnalyticsResponse> {
    const {
      siteUrl,
      startDate,
      endDate,
      dimensions = [],
      rowLimit = 1000,
      startRow = 0,
    } = params;

    const requestBody: any = {
      startDate,
      endDate,
      rowLimit,
      startRow,
    };

    if (dimensions.length > 0) {
      requestBody.dimensions = dimensions;
    }

    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
        siteUrl
      )}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `GSC API Error: ${error.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  }

  /**
   * 日別の検索アナリティクスデータを取得
   */
  async getDailySearchAnalytics(
    siteUrl: string,
    startDate: string,
    endDate: string
  ) {
    return this.getSearchAnalytics({
      siteUrl,
      startDate,
      endDate,
      dimensions: ["date"] as any, // 日付でグループ化
      rowLimit: 1000,
    });
  }

  /**
   * クエリ別の検索アナリティクスデータを取得
   */
  async getQuerySearchAnalytics(
    siteUrl: string,
    startDate: string,
    endDate: string,
    limit: number = 100
  ) {
    return this.getSearchAnalytics({
      siteUrl,
      startDate,
      endDate,
      dimensions: ["query"],
      rowLimit: limit,
    });
  }

  /**
   * ページ別の検索アナリティクスデータを取得
   */
  async getPageSearchAnalytics(
    siteUrl: string,
    startDate: string,
    endDate: string,
    limit: number = 100
  ) {
    return this.getSearchAnalytics({
      siteUrl,
      startDate,
      endDate,
      dimensions: ["page"],
      rowLimit: limit,
    });
  }

  /**
   * クエリ別の日別検索アナリティクスデータを取得（前週比計算用）
   */
  async getQueryDailySearchAnalytics(
    siteUrl: string,
    startDate: string,
    endDate: string,
    limit: number = 1000
  ) {
    return this.getSearchAnalytics({
      siteUrl,
      startDate,
      endDate,
      dimensions: ["date", "query"] as any,
      rowLimit: limit,
    });
  }

  /**
   * ページ別の日別検索アナリティクスデータを取得（前週比計算用）
   */
  async getPageDailySearchAnalytics(
    siteUrl: string,
    startDate: string,
    endDate: string,
    limit: number = 1000
  ) {
    return this.getSearchAnalytics({
      siteUrl,
      startDate,
      endDate,
      dimensions: ["date", "page"] as any,
      rowLimit: limit,
    });
  }

  /**
   * 国別の検索アナリティクスデータを取得
   */
  async getCountrySearchAnalytics(
    siteUrl: string,
    startDate: string,
    endDate: string
  ) {
    return this.getSearchAnalytics({
      siteUrl,
      startDate,
      endDate,
      dimensions: ["country"],
      rowLimit: 1000,
    });
  }

  /**
   * デバイス別の検索アナリティクスデータを取得
   */
  async getDeviceSearchAnalytics(
    siteUrl: string,
    startDate: string,
    endDate: string
  ) {
    return this.getSearchAnalytics({
      siteUrl,
      startDate,
      endDate,
      dimensions: ["device"],
      rowLimit: 1000,
    });
  }
}
