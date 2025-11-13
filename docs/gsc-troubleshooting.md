# GSC 連携 トラブルシューティングガイド

## 重要な前提条件

### GCP プロジェクトの設定 vs ログインアカウント

**重要なポイント**:

- **GCP プロジェクトの設定**（API 有効化、OAuth 認証情報作成）は、**アプリ開発者が一度だけ**行います
- **ユーザーがログインする Google アカウントは、GCP プロジェクトの所有者である必要はありません**
- どの Google アカウントでもログインできます

**ただし**:

- GSC 連携を使用するには、ログインしたユーザーの Google アカウントが、**Google Search Console に登録されているサイトの所有者**である必要があります
- 例: `example.com`を GSC 連携する場合、その Google アカウントが`example.com`の GSC 所有者である必要があります

### 設定の流れ

1. **開発者（あなた）**: GCP プロジェクトを作成し、Search Console API を有効化、OAuth 認証情報を作成
2. **開発者（あなた）**: 作成した OAuth 認証情報（CLIENT_ID、CLIENT_SECRET）を`.env.local`に設定
3. **ユーザー**: どの Google アカウントでもログイン可能（GCP プロジェクトの所有者である必要はない）
4. **ユーザー**: GSC 連携を使用する場合、その Google アカウントが GSC にサイトを登録している必要がある

### どの GCP プロジェクトで設定するか？

**重要**: `.env.local`に設定されている`GOOGLE_CLIENT_ID`に対応する GCP プロジェクトで設定します。

確認方法：

1. `.env.local`ファイルを開く
2. `GOOGLE_CLIENT_ID`の値を確認（例: `803093806187-0vlugj29m31shaoqt1skg2fijndksvqc.apps.googleusercontent.com`）
3. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
4. プロジェクト一覧から、その CLIENT_ID を作成したプロジェクトを選択
5. そのプロジェクトで設定を行う

## スコープ設定について

### この設定は必要ですか？

**はい、GSC 連携機能を使用する場合は必要です。**

理由：

- GSC 連携機能は、Google Search Console API（`https://www.googleapis.com/webmasters/v3/sites`）にアクセスします
- この API にアクセスするには、GCP プロジェクトで「Google Search Console API」が有効化されている必要があります
- OAuth 同意画面でスコープを追加しないと、ユーザーがログイン時にそのスコープを承認できません

**GSC 連携機能を使わない場合は、この設定は不要です。**

### スコープ設定が必要な 2 箇所

#### 1. アプリ側（Better Auth の設定）✅ 既に設定済み

`src/lib/auth/config.ts`で既に設定されています：

```typescript
scopes: [
  "email",
  "profile",
  "https://www.googleapis.com/auth/webmasters.readonly", // GSC API用
],
```

**この設定は既に完了しています。変更する必要はありません。**

#### 2. GCP プロジェクト側（OAuth 同意画面）⚠️ これが必要

GCP プロジェクトの OAuth 同意画面でスコープを追加する必要があります。
**これが設定されていないと、403 エラーが発生します。**

**この設定は、GSC 連携機能を使用する場合にのみ必要です。**

## 403 エラー「insufficient authentication scopes」が発生する場合

### 原因

Google Search Console API にアクセスするための権限（スコープ）が不足しています。

**このエラーは、GCP プロジェクト側の設定が不足している場合に発生します。**
**アプリ側の設定は既に完了しているため、GCP プロジェクト側の設定を確認してください。**

### 解決手順

**注意**: 以下の手順は、**アプリ開発者（GCP プロジェクトの所有者）**が行います。ユーザーは行う必要はありません。

#### 1. GCP プロジェクトで Search Console API を有効化

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択（または新規作成）
3. 「API とサービス」→「ライブラリ」に移動
4. 「Google Search Console API」を検索
5. 「有効にする」をクリック

**重要**: この API が有効化されていないと、403 エラーが発生します。

#### 2. OAuth 同意画面でスコープを追加

1. 「API とサービス」→「OAuth 同意画面」に移動
2. 「データアクセス」タブ（または「スコープを追加または削除」ボタン）をクリック
3. 「スコープを追加または削除」をクリック
4. スコープ検索ボックスに `webmasters.readonly` と入力
5. `https://www.googleapis.com/auth/webmasters.readonly` を選択（チェックボックスにチェック）
6. 「更新」をクリック
7. **重要**: 変更を保存した後、OAuth 同意画面の「データアクセス」タブで、追加したスコープが「非機密のスコープ」または「機密性の高いスコープ」セクションに表示されていることを確認してください

#### 3. OAuth 2.0 認証情報の確認

1. 「API とサービス」→「認証情報」に移動
2. OAuth 2.0 クライアント ID を確認
3. 承認済みのリダイレクト URI に以下が含まれているか確認：
   - `http://localhost:3000/api/auth/callback/google`
   - 本番環境の URL（例: `https://yourdomain.com/api/auth/callback/google`）

#### 4. アカウントの再認証

**重要**: OAuth 同意画面でスコープを追加した後は、**完全にログアウトして再ログイン**する必要があります。

1. アプリからログアウト
2. **ブラウザの Cookie とキャッシュをクリア**（推奨）
   - Chrome: 設定 → プライバシーとセキュリティ → 閲覧履歴データの削除
   - または、シークレットモード/プライベートモードで再ログインを試す
3. 再度ログイン
4. **ログイン時の OAuth 同意画面で、`webmasters.readonly`スコープが表示されているか確認**
   - もし表示されていない場合は、GCP プロジェクト側の設定を再確認してください
5. GSC 連携を再度試す

**注意**: OAuth 同意画面でスコープを追加しても、既存のセッションには反映されません。必ずログアウト → 再ログインが必要です。

### デバッグ方法

#### サーバーログの確認

GSC 連携を試すと、サーバーログに以下のような情報が出力されます：

```
=== GSC連携デバッグ情報 ===
Current scopes (raw): ...
Current scopes (array): ...
Required scope: https://www.googleapis.com/auth/webmasters.readonly
Has required scope: true/false
```

#### ブラウザコンソールの確認

エラー発生時、ブラウザの開発者ツール（F12）のコンソールにデバッグ情報が表示されます。

### よくある問題

#### 問題 1: 「Search Console API」が有効化されていない

**症状**: 403 エラーが発生する

**解決方法**: 上記の手順 1 を実行

#### 問題 2: OAuth 同意画面でスコープが設定されていない

**症状**: ログイン時にスコープの承認画面が表示されない

**解決方法**: 上記の手順 2 を実行

#### 問題 3: 古いスコープでログインしている

**症状**: スコープが不足しているエラーが発生する

**解決方法**: 上記の手順 4 を実行（ログアウト → 再ログイン）

### 確認チェックリスト

- [ ] GCP プロジェクトで「Google Search Console API」が有効化されている
- [ ] OAuth 同意画面で`https://www.googleapis.com/auth/webmasters.readonly`スコープが追加されている
- [ ] OAuth 2.0 認証情報のリダイレクト URI が正しく設定されている
- [ ] 一度ログアウトしてから再度ログインした
- [ ] サーバーログでスコープが正しく取得されているか確認した
