Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  サーバーコンソール - 起動"
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# サーバーディレクトリの確認
if (-not (Test-Path "server\server.js")) {
    Write-Host "❌ server\server.js が見つかりません" -ForegroundColor Red
    Write-Host "   正しいディレクトリから実行してください" -ForegroundColor Yellow
    exit 1
}

# .env ファイルの確認
if (-not (Test-Path "server\.env")) {
    Write-Host "⚠️  .env ファイルが見つかりません" -ForegroundColor Yellow
    Write-Host "   init.ps1 を実行して初期化してください" -ForegroundColor Yellow
}

Write-Host "サーバーを起動中..." -ForegroundColor Yellow
Write-Host ""

Set-Location -Path "server"

# 開発モードまたは本番モードの選択
 = Read-Host "起動モードを選択してください (1: 開発モード, 2: 本番モード) [1]"

if ( -eq "2") {
    Write-Host "🚀 本番モードで起動します..." -ForegroundColor Green
    npm start
} else {
    Write-Host "🔧 開発モードで起動します..." -ForegroundColor Green
    Write-Host "   ファイル変更を監視し、自動再起動します" -ForegroundColor Blue
    npm run dev
}
