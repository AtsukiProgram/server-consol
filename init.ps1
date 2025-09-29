Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  サーバーコンソール - 初期化"
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Node.js の確認
Write-Host "Node.js バージョン確認中..." -ForegroundColor Yellow
try {
     = node --version
    Write-Host "✅ Node.js: " -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js がインストールされていません" -ForegroundColor Red
    Write-Host "   https://nodejs.org からダウンロードしてください" -ForegroundColor Yellow
    exit 1
}

# npm の確認
try {
     = npm --version
    Write-Host "✅ npm: v" -ForegroundColor Green
} catch {
    Write-Host "❌ npm が利用できません" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "依存関係をインストール中..." -ForegroundColor Yellow

# サーバーディレクトリに移動して依存関係をインストール
Set-Location -Path "server"

try {
    npm install
    Write-Host "✅ 依存関係のインストールが完了しました" -ForegroundColor Green
} catch {
    Write-Host "❌ 依存関係のインストールに失敗しました" -ForegroundColor Red
    exit 1
}

# .env ファイルの作成
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env ファイルを作成しました" -ForegroundColor Green
    Write-Host "⚠️  .env ファイルを編集して実際の設定値を入力してください" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  .env ファイルは既に存在します" -ForegroundColor Blue
}

# keys ディレクトリの作成
 = "../keys"
if (-not (Test-Path )) {
    New-Item -Path  -ItemType Directory -Force
    Write-Host "✅ SSH鍵用ディレクトリを作成しました: keys/" -ForegroundColor Green
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  初期化完了！"
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "次の手順:" -ForegroundColor Yellow
Write-Host "1. server\.env ファイルを編集" -ForegroundColor White
Write-Host "2. SSH鍵を keys\ フォルダに配置" -ForegroundColor White
Write-Host "3. 開発サーバーを起動: npm run dev" -ForegroundColor White
Write-Host "4. ブラウザでアクセス: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🚀 サーバーを起動するには:" -ForegroundColor Green
Write-Host "   npm run dev     (開発モード)" -ForegroundColor Cyan
Write-Host "   npm start       (本番モード)" -ForegroundColor Cyan

Set-Location -Path ".."
