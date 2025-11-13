/**
 * Coffee Analytics - TypeScript型定義
 * このファイルをプロジェクトのルートまたはsrc/types/に配置してください
 */

declare global {
  interface Window {
    ca?: {
      q?: Array<(...args: any[]) => void>;
      o?: Record<string, any>;
      track?: (eventType: string, eventName?: string, eventValue?: any) => void;
      trackEvent?: (name: string, value?: any) => void;
      init?: (options?: Record<string, any>) => void;
    };
  }
}

export {};

