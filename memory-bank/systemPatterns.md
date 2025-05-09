# 系統設計模式與技術決策

## 設計模式
- 事件驅動：以 VSCode HoverProvider 及 Command 註冊事件為核心，實現 Alt+點擊觸發檔案開啟
- 正則解析：以正則表達式偵測方括號內檔名，確保彈性與可擴充性

## 技術決策
- 使用 VSCode Extension API 開發，確保與主流開發環境整合
- 整合 Everything CLI（es.exe），以 PowerShell 指令搜尋並開啟檔案
- 以 MarkdownString 呈現 hover 內容，支援 command URI 點擊觸發
- 僅支援 Windows 平台，專為本地檔案搜尋優化
