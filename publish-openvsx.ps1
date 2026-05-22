# File Linker - Open VSX 發布腳本
# 使用方式: .\publish-openvsx.ps1 -Token "YOUR_ACCESS_TOKEN"

param(
    [Parameter(Mandatory=$false)]
    [string]$Token,

    [Parameter(Mandatory=$false)]
    [switch]$CreateNamespace,

    [Parameter(Mandatory=$false)]
    [switch]$Help
)

# 顯示說明
if ($Help) {
    Write-Host @"
File Linker - Open VSX 發布腳本

使用方式:
  .\publish-openvsx.ps1 -Token "YOUR_TOKEN"              # 發布擴充插件
  .\publish-openvsx.ps1 -Token "YOUR_TOKEN" -CreateNamespace  # 建立命名空間（首次使用）
  .\publish-openvsx.ps1 -Help                            # 顯示此說明

如何取得 Access Token:
  1. 前往 https://open-vsx.org
  2. 登入後進入 Settings -> Access Tokens
  3. 點擊 Generate New Token
  4. 複製生成的 token

首次發布流程:
  1. 先建立命名空間: .\publish-openvsx.ps1 -Token "YOUR_TOKEN" -CreateNamespace
  2. 然後發布: .\publish-openvsx.ps1 -Token "YOUR_TOKEN"

注意: 建議將 Token 儲存在環境變數 OVSX_TOKEN 中，這樣就不需要每次都輸入
"@
    exit 0
}

# 從環境變數取得 Token
if (-not $Token) {
    $Token = $env:OVSX_TOKEN
}

# 檢查 Token
if (-not $Token) {
    Write-Host "❌ 錯誤: 未提供 Access Token" -ForegroundColor Red
    Write-Host ""
    Write-Host "請使用以下方式之一提供 Token:" -ForegroundColor Yellow
    Write-Host "  1. 參數: .\publish-openvsx.ps1 -Token `"YOUR_TOKEN`""
    Write-Host "  2. 環境變數: `$env:OVSX_TOKEN = `"YOUR_TOKEN`""
    Write-Host ""
    Write-Host "使用 -Help 參數查看完整說明"
    exit 1
}

$publisher = "peterwang"
$extensionName = "file-linker"

# 建立命名空間
if ($CreateNamespace) {
    Write-Host "🔧 正在建立命名空間: $publisher" -ForegroundColor Cyan
    npx ovsx create-namespace $publisher -p $Token

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 命名空間建立成功！" -ForegroundColor Green
    } else {
        Write-Host "❌ 命名空間建立失敗（可能已存在）" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "下一步: 執行發布指令" -ForegroundColor Cyan
    Write-Host "  .\publish-openvsx.ps1 -Token `"YOUR_TOKEN`""
    exit 0
}

# 尋找最新的 .vsix 檔案
Write-Host "🔍 尋找最新的 .vsix 檔案..." -ForegroundColor Cyan
$vsixFiles = Get-ChildItem -Path . -Filter "file-linker-*.vsix" | Sort-Object LastWriteTime -Descending

if ($vsixFiles.Count -eq 0) {
    Write-Host "❌ 找不到 .vsix 檔案，正在從原始碼打包..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📦 執行打包指令..." -ForegroundColor Cyan
    npm run vscode:prepublish

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 打包失敗" -ForegroundColor Red
        exit 1
    }

    Write-Host "📦 使用 vsce 打包..." -ForegroundColor Cyan
    npx vsce package

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 打包失敗" -ForegroundColor Red
        exit 1
    }

    # 重新尋找
    $vsixFiles = Get-ChildItem -Path . -Filter "file-linker-*.vsix" | Sort-Object LastWriteTime -Descending
}

if ($vsixFiles.Count -eq 0) {
    Write-Host "❌ 仍然找不到 .vsix 檔案" -ForegroundColor Red
    exit 1
}

$latestVsix = $vsixFiles[0]
Write-Host "✅ 找到檔案: $($latestVsix.Name)" -ForegroundColor Green
Write-Host ""

# 發布到 Open VSX
Write-Host "🚀 正在發布到 Open VSX..." -ForegroundColor Cyan
Write-Host "   檔案: $($latestVsix.Name)" -ForegroundColor Gray
npx ovsx publish $latestVsix.FullName -p $Token

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 發布成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 檢視擴充插件:" -ForegroundColor Cyan
    Write-Host "   https://open-vsx.org/extension/$publisher/$extensionName"
    Write-Host ""
    Write-Host "💡 提示: Cursor 使用者現在可以在擴充插件市場搜尋到你的插件了！" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ 發布失敗" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "  1. Token 無效或已過期"
    Write-Host "  2. 命名空間尚未建立（使用 -CreateNamespace 參數）"
    Write-Host "  3. 此版本已經發布過（需要更新版本號）"
    Write-Host ""
    Write-Host "如果命名空間尚未建立，請執行:" -ForegroundColor Cyan
    Write-Host "  .\publish-openvsx.ps1 -Token `"YOUR_TOKEN`" -CreateNamespace"
    exit 1
}

