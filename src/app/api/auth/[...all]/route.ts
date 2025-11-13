import { auth } from "@/lib/auth/config";
import { toNextJsHandler } from "better-auth/next-js";

// Better-Authのハンドラーを取得
const handler = toNextJsHandler(auth);

// Next.js App Router用にエクスポート
export const GET = handler.GET;
export const POST = handler.POST;
