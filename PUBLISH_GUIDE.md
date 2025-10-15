# 📦 File Linker 發布指南

## 問題說明

你的擴充插件已經在 **VSCode Marketplace** 上架，但在 **Cursor** 中找不到。

### 原因
- VSCode 使用 **VSCode Marketplace**
- Cursor 主要使用 **Open VSX Registry**
- 雖然 Cursor 會嘗試同步 VSCode Marketplace 的內容，但不是即時且不完整的

### 解決方案
**同時發布到 Open VSX Registry**，讓 Cursor 使用者也能找到你的插件！

---

## 🚀 快速開始（推薦）

### 步驟 1️⃣：取得 Open VSX Access Token

#### 1.1 註冊 Eclipse 帳號
前往 https://accounts.eclipse.org/user/register
- ⚠️ **重要**：GitHub Username 欄位必須填寫，且要與你的 GitHub 帳號一致

#### 1.2 登入 Open VSX
1. 前往 https://open-vsx.org
2. 點擊右上角帳號圖示 → 用 GitHub 登入
3. 進入 Settings → 點擊 "Log in with Eclipse"
4. 授權後，點擊 "Show Publisher Agreement" → 閱讀並同意

#### 1.3 生成 Access Token
1. 進入 https://open-vsx.org/user-settings/tokens
2. 點擊 "Generate New Token"
3. 輸入描述：`file-linker-publish`
4. 點擊 "Generate Token"
5. **立即複製** Token（只會顯示一次！）

### 步驟 2️⃣：設定環境變數（可選但推薦）

在 PowerShell 中執行：
```powershell
# 設定環境變數（本次 session）
$env:OVSX_TOKEN = "YOUR_ACCESS_TOKEN_HERE"

# 永久儲存（可選）
[System.Environment]::SetEnvironmentVariable('OVSX_TOKEN', 'YOUR_ACCESS_TOKEN_HERE', 'User')
```

### 步驟 3️⃣：首次發布

#### 3.1 建立命名空間（只需執行一次）
```powershell
.\publish-openvsx.ps1 -Token "YOUR_TOKEN" -CreateNamespace
```

如果已設定環境變數：
```powershell
.\publish-openvsx.ps1 -CreateNamespace
```

#### 3.2 發布擴充插件
```powershell
.\publish-openvsx.ps1 -Token "YOUR_TOKEN"
```

如果已設定環境變數：
```powershell
.\publish-openvsx.ps1
```

### 步驟 4️⃣：驗證結果

前往以下網址確認：
https://open-vsx.org/extension/peterwang/file-linker

🎉 **完成！現在 Cursor 使用者可以在擴充插件市場找到你的插件了！**

---

## 📝 未來更新流程

每次發布新版本時：

### 方法 1：使用自動化腳本（推薦）
```powershell
# 1. 更新 package.json 的版本號
# 2. 執行打包（如果沒有現成的 .vsix）
npm run package

# 3. 發布到 VSCode Marketplace
npm run publish:vscode

# 4. 發布到 Open VSX
.\publish-openvsx.ps1
```

### 方法 2：使用 npm scripts
```powershell
# 發布到 VSCode Marketplace
npm run publish:vscode

# 發布到 Open VSX
npm run publish:openvsx

# 或者一次發布到兩個平台
npm run publish:all
```

---

## 🛠️ 手動發布（不使用腳本）

如果你不想使用自動化腳本，可以手動執行：

### 建立命名空間（首次）
```powershell
npx ovsx create-namespace peterwang -p YOUR_TOKEN
```

### 發布現有的 .vsix 檔案
```powershell
npx ovsx publish file-linker-1.1.3.vsix -p YOUR_TOKEN
```

### 從原始碼打包並發布
```powershell
npx ovsx publish -p YOUR_TOKEN
```

---

## 💡 常見問題

### Q1: 為什麼 Cursor 找不到我的插件？
A: Cursor 使用 Open VSX Registry，不是 VSCode Marketplace。你需要分別發布到兩個平台。

### Q2: 我需要維護兩份代碼嗎？
A: 不需要！使用相同的代碼和 .vsix 檔案，只是發布到兩個不同的平台。

### Q3: 發布失敗，顯示 "Extension already exists"
A: 這可能是因為版本號已經發布過。請更新 package.json 中的版本號後重試。

### Q4: 發布失敗，顯示 "Namespace not found"
A: 你需要先建立命名空間：
```powershell
.\publish-openvsx.ps1 -CreateNamespace
```

### Q5: Token 遺失怎麼辦？
A: 前往 https://open-vsx.org/user-settings/tokens，刪除舊的 token 並生成新的。

### Q6: 如何確認發布成功？
A: 
1. 檢查 Open VSX 網站：https://open-vsx.org/extension/peterwang/file-linker
2. 在 Cursor 中搜尋 "file-linker"
3. 查看插件的安裝數量是否增加

---

## 📚 參考資源

- [Open VSX 官方發布指南](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [VSCode 擴充插件發布](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [本專案 GitHub](https://github.com/papple23g/file-linker)
- [VSCode Marketplace 頁面](https://marketplace.visualstudio.com/items?itemName=peterwang.file-linker)
- [Open VSX 頁面](https://open-vsx.org/extension/peterwang/file-linker)（發布後可用）

---

## 🔐 安全提示

- ⚠️ **永遠不要**將 Access Token 提交到 Git
- ⚠️ **永遠不要**在公開場合分享 Token
- ✅ 使用環境變數儲存 Token
- ✅ 如果懷疑 Token 洩露，立即刪除並生成新的
- ✅ 建議為不同環境（本機、CI/CD）生成不同的 Token

---

## 📞 需要協助？

如果遇到任何問題：
1. 查看 [Open VSX 官方文件](https://github.com/eclipse/openvsx/wiki)
2. 在 [GitHub Issues](https://github.com/papple23g/file-linker/issues) 提問
3. 查看 [Cursor 論壇](https://forum.cursor.com/)相關討論

