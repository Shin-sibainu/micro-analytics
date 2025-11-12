import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { index, uniqueIndex } from "drizzle-orm/sqlite-core";

// ユーザー管理
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .default(sql`(lower(hex(randomblob(16))))`),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  googleId: text("google_id").notNull().unique(),
  planType: text("plan_type").default("essential"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// サイト管理
export const sites = sqliteTable("sites", {
  id: text("id")
    .primaryKey()
    .default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(),
  name: text("name"),
  trackingId: text("tracking_id")
    .unique()
    .default(sql`(lower(hex(randomblob(8))))`),

  // 機能フラグ
  trackingEnabled: integer("tracking_enabled", { mode: "boolean" }).default(
    true
  ),
  gscEnabled: integer("gsc_enabled", { mode: "boolean" }).default(false),
  ga4ImportCompleted: integer("ga4_import_completed", {
    mode: "boolean",
  }).default(false),

  // Google連携情報（JSON形式で保存）
  gscConfig: text("gsc_config", { mode: "json" }),
  ga4Config: text("ga4_config", { mode: "json" }),

  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// イベントテーブル（パーティション対応）
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),

  // 基本情報
  eventType: text("event_type").notNull(), // pageview, event
  visitorHash: text("visitor_hash").notNull(),
  sessionHash: text("session_hash").notNull(),

  // ページ情報
  url: text("url"),
  path: text("path"),
  title: text("title"),
  referrer: text("referrer"),

  // デバイス情報
  deviceType: text("device_type"),
  screenSize: text("screen_size"),
  browser: text("browser"),
  os: text("os"),
  country: text("country"),

  // カスタムイベント
  eventName: text("event_name"),
  eventValue: text("event_value", { mode: "json" }),

  // タイムスタンプ（Unix時間）
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  date: text("date").generatedAlwaysAs(sql`date(timestamp, 'unixepoch')`),
  hour: integer("hour").generatedAlwaysAs(
    sql`cast(strftime('%H', timestamp, 'unixepoch') as integer)`
  ),
});

// GSCデータ（GSC連携時のみ）
export const gscData = sqliteTable("gsc_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),

  date: text("date").notNull(),
  query: text("query"),
  page: text("page"),
  country: text("country"),
  device: text("device"),

  clicks: integer("clicks"),
  impressions: integer("impressions"),
  ctr: real("ctr"),
  position: real("position"),

  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// AI分析結果
export const aiInsights = sqliteTable("ai_insights", {
  id: text("id")
    .primaryKey()
    .default(sql`(lower(hex(randomblob(16))))`),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),

  insightType: text("insight_type"), // daily, weekly, suggestion
  dataSources: text("data_sources"), // tracking, gsc, both

  content: text("content", { mode: "json" }).notNull(),

  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
});

// セッション管理（Better-Auth用）
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

// インデックス定義
export const eventsIndexes = {
  siteDate: index("idx_events_site_date").on(events.siteId, events.date),
  visitor: index("idx_events_visitor").on(events.siteId, events.visitorHash),
  path: index("idx_events_path").on(events.siteId, events.path),
};

export const gscDataIndexes = {
  siteDate: index("idx_gsc_site_date").on(gscData.siteId, gscData.date),
  unique: uniqueIndex("idx_gsc_unique").on(
    gscData.siteId,
    gscData.date,
    gscData.query,
    gscData.page
  ),
};

// 型エクスポート
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type GscData = typeof gscData.$inferSelect;
export type NewGscData = typeof gscData.$inferInsert;
export type AiInsight = typeof aiInsights.$inferSelect;
export type NewAiInsight = typeof aiInsights.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
