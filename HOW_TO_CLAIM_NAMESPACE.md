# 🔒 如何申請 Open VSX 命名空間擁有權

## 📋 問題說明

當你看到這個警告時：
> ⚠️ This version of the "File Linker" extension was published by papple23g. That user account is not a verified publisher of the namespace "peterwang" of this extension.

這表示你需要申請命名空間的**擁有權 (ownership)**。

## 🎯 解決方案：建立 GitHub Issue

### 步驟 1：前往 Eclipse Foundation 專案

點擊以下連結，開啟新 issue 頁面：

👉 **https://github.com/EclipseFdn/open-vsx.org/issues/new**

### 步驟 2：填寫 Issue

#### Title (標題)
```
Claiming namespace: peterwang
```

#### Body (內容)
複製 `namespace-claim-request-en.md` 檔案的內容，或直接使用以下內容：

```markdown
# Claiming Namespace: peterwang

## Request

I would like to request ownership of the `peterwang` namespace on Open VSX.

## Evidence

### VSCode Marketplace
- **Extension Name**: File Linker
- **Publisher**: peterwang
- **Marketplace URL**: https://marketplace.visualstudio.com/items?itemName=peterwang.file-linker
- **Published**: January 2025 (16+ installs)

### Open VSX
- **Extension URL**: https://open-vsx.org/extension/peterwang/file-linker
- **Version**: 1.1.3
- **Publishing User**: papple23g

### GitHub Repository
- **Repository**: https://github.com/papple23g/file-linker
- **Owner**: papple23g (same as my Open VSX login)

### Identity Verification
- My GitHub account is **papple23g**
- I am the original author and maintainer of this extension
- I have logged into Open VSX using the same GitHub account
- Both the GitHub repository and VSCode Marketplace verify that I own the `peterwang` publisher

## Reason for Claiming

1. I am the original author and maintainer of the `file-linker` extension
2. I use `peterwang` as my publisher name on the VSCode Marketplace
3. I just published this extension to Open VSX but haven't claimed namespace ownership yet
4. I want to become a verified publisher so users can trust this extension

## Additional Information

- This extension is a file quick-opening tool
- Supports Windows (Everything) and macOS (Spotlight)
- Already published on VSCode Marketplace with real users
- The GitHub repository is public and available for verification

Thank you for reviewing my request!
```

### 步驟 3：提交 Issue

1. 確認所有資訊正確
2. 點擊 **Submit new issue**
3. 等待 Eclipse Foundation 團隊審核

## ⏱️ 審核時間

- 通常需要 **幾天到一週**
- 你會在 GitHub issue 中收到通知
- 審核通過後，你的擴充插件會顯示為「已驗證」✅

## 📊 審核後的變化

### 審核前 (目前)
```
⚠️ 未驗證
Publishing User: papple23g
Role: Contributor
```

### 審核後
```
✅ 已驗證 (Verified)
Publishing User: papple23g
Role: Owner
```

## 💡 立即行動

1. **現在就建立 issue**：https://github.com/EclipseFdn/open-vsx.org/issues/new
2. **標題**：`Claiming namespace: peterwang`
3. **內容**：複製上面準備好的內容
4. **提交並等待**：通常很快就會獲得批准！

## 📝 常見問題

### Q1: 為什麼需要這個步驟？
A: Open VSX 的安全機制。建立命名空間 ≠ 擁有命名空間，需要額外驗證。

### Q2: 會被拒絕嗎？
A: 不太可能！你有充分的證據：
   - ✅ VSCode Marketplace 上的 publisher
   - ✅ GitHub repository 擁有者
   - ✅ 同一個 GitHub 帳號登入

### Q3: 如果沒有通過怎麼辦？
A: 團隊會在 issue 中說明原因，你可以補充資料。

### Q4: 通過後需要做什麼嗎？
A: 不需要！你的擴充插件會自動顯示為已驗證。

### Q5: 這會影響現有使用者嗎？
A: 不會！插件功能完全不受影響，只是會移除警告訊息。

## 🎯 快速行動清單

- [ ] 開啟 GitHub issue 頁面
- [ ] 填寫標題：`Claiming namespace: peterwang`
- [ ] 複製貼上申請內容
- [ ] 提交 issue
- [ ] 等待審核（會收到 email 通知）
- [ ] 審核通過後，確認 Open VSX 頁面顯示已驗證

---

**重要提醒**：即使目前顯示未驗證，你的插件功能完全正常，使用者可以正常安裝和使用。這只是一個信任標記！

