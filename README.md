# サーバーコンソール - 起動ファイル選択機能付き

遠隔サーバー管理Webアプリケーション（起動ファイル選択機能付き）

## 主要機能

### ✨ 新機能
- **起動ファイル選択機能**: サーバー起動時に使用するJAR/実行ファイルを選択
- **起動前検証**: 起動ファイルが未設定の場合は起動ボタンを無効化
- **ファイルタイプフィルタ**: .jar, .exe, .bat, .sh ファイルの自動識別

### 🔧 基本機能
- Discord OAuth2 認証（ログイン機能のみ）
- 3段階権限システム（Normal/Member/Admin）
- リアルタイムサーバー管理
- ファイルブラウザ
- コンソール操作

## セットアップ手順

### 1. 依存関係のインストール
`powershell
Set-Location -Path "server"
npm install
`

### 2. 環境変数の設定
`powershell
Copy-Item ".env.example" ".env"
# .env ファイルを編集して実際の値を設定
`

### 3. 開発サーバーの起動
`powershell
npm run dev
`

### 4. アクセス
ブラウザで http://localhost:3000 にアクセス

## 起動ファイル選択機能の使用方法

1. **設定タブ**でサーバーフォルダを追加
2. サーバー情報入力後、「ファイル選択」ボタンで起動ファイルを選択
3. 対応ファイル形式: .jar, .exe, .bat, .sh
4. **サーバータブ**で起動ボタンクリック時、設定された起動ファイルで実行

## Discord Bot 設定（簡略版）

通知機能は削除され、ログイン機能のみが残っています。

1. Discord Developer Portal でアプリケーション作成
2. OAuth2 設定:
   - Scopes: identify, mail
   - Redirect URI: https://server-console.f5.si/auth/discord/callback
3. Bot Token を取得（基本認証用）

## GitHub Pages + f5.si デプロイ

### 1. GitHub リポジトリ作成
`powershell
git init
git add .
git commit -m "Initial commit with startup file selection"
git remote add origin https://github.com/USERNAME/server-console.git
git push -u origin main
`

### 2. GitHub Pages 設定
- Settings > Pages > Custom domain: server-console.f5.si

### 3. DNS 設定
f5.si または類似サービスでCNAMEレコードを設定

## ディレクトリ構造

`
server-console/
├── client/                 # フロントエンド
│   ├── index.html         # メインHTML（起動ファイル選択UI含む）
│   ├── style.css          # スタイルシート
│   └── app.js             # JavaScript（起動ファイル機能付き）
├── server/                # バックエンド
│   ├── server.js          # メインサーバー
│   ├── package.json       # 依存関係
│   └── services/          # サービス層
│       ├── authService.js      # 認証サービス
│       ├── discordService.js   # Discord連携（簡略版）
│       └── serverManager.js    # サーバー管理（起動ファイル機能付き）
├── keys/                  # SSH鍵
└── config/               # 設定ファイル
`

## 変更点（前バージョンから）

### 🆕 追加機能
- 起動ファイル選択モーダル
- 起動ファイル検証システム
- 設定画面での起動ファイル管理
- 起動前チェック機能

### 🗑️ 削除機能
- Discord通知システム
- 権限リクエスト通知
- Discord Bot コマンド機能

### 🔧 修正機能
- 認証システムの簡略化
- エラーハンドリングの改善
- UI/UX の向上

## 本番環境デプロイ

`powershell
# PM2 を使用した本番デプロイ
npm install -g pm2
pm2 start server.js --name "server-console"
pm2 startup
pm2 save
`

## トラブルシューティング

### 起動ファイルが見つからない
1. サーバー設定で正しいフォルダパスが設定されているか確認
2. SSH接続が正常に動作しているか確認
3. 起動ファイルの拡張子が対応形式（.jar, .exe, .bat, .sh）か確認

### Discord認証エラー
1. Client ID/Secret が正しく設定されているか確認
2. Redirect URI が正確に設定されているか確認

## ライセンス

MIT License
