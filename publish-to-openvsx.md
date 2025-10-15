# 發布到 Open VSX 指南

## 前置作業（只需執行一次）

### 1. 建立命名空間
```powershell
npx ovsx create-namespace peterwang -p YOUR_ACCESS_TOKEN
```

## 發布新版本

### 方法 1：發布現有的 .vsix 檔案
```powershell
npx ovsx publish file-linker-1.1.3.vsix -p YOUR_ACCESS_TOKEN
```

### 方法 2：從原始碼打包並發布
```powershell
npx ovsx publish -p YOUR_ACCESS_TOKEN
```

## 驗證發布結果

發布成功後，前往以下網址確認：
https://open-vsx.org/extension/peterwang/file-linker

## 未來更新流程

每次發布新版本時：

1. 更新 package.json 的版本號
2. 發布到 VSCode Marketplace（原有流程）
3. 同時發布到 Open VSX：
   ```powershell
   npx ovsx publish -p YOUR_ACCESS_TOKEN
   ```

## 注意事項

- 建議將 Access Token 儲存在環境變數中，避免外洩
- 可以在 package.json 中新增 script 來簡化發布流程
- Open VSX 和 VSCode Marketplace 需要分別發布，但都使用相同的 .vsix 檔案

