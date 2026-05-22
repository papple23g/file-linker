[Read this in English](README.md)

# VS Code 檔案連結器 (File Linker)

透過您作業系統**的特定搜尋引擎**，在任何文字檔案中將滑鼠懸停並點擊檔案名稱，即可立即開啟檔案。

![Demo](demo.gif)

## 功能特色

-   **即時檔案存取**：只需將滑鼠懸停在方括號中的檔案名稱 (例如 `[我的文件.txt]`) 上，即可顯示可點擊的連結。
-   **跨平台支援**：同時支援 Windows 與 macOS。
-   **原生系統整合**：
    -   在 **Windows** 上，本擴充功能利用強大的 **[Everything](https://www.voidtools.com/)** 搜尋引擎。
    -   在 **macOS** 上，則使用內建的 **Spotlight** 搜尋功能 (`mdfind`)，無需安裝額外軟體。
-   **全系統搜尋**：在您的整個系統中尋找檔案，而不僅限於目前的工作區。
-   **智慧錯誤處理**：如果 Windows 上的 Everything 服務未執行，本擴充功能會引導您進行安裝。
-   **支援 Unicode 與 emoji 檔名**：Windows 會從 Everything 的 UTF-8 匯出結果讀取路徑，因此 `[👥會議準備.txt]` 這類檔名可以可靠開啟。

## 必要條件

-   **Windows**: 您必須已安裝 **[Everything](https://www.voidtools.com/)** 應用程式，並讓它在背景執行。
-   **macOS**: 無需安裝任何額外軟體，本擴充功能直接使用內建的 Spotlight 功能。

## 運作方式

1.  當您將滑鼠懸停在 `[]` 包圍的文字上時，一個帶有連結的工具提示將會出現。
2.  點擊連結會觸發系統原生的搜尋引擎（Windows 為 Everything，macOS 為 Spotlight）。
3.  在 Windows 上，會直接開啟最符合的檔案。在 macOS 上，如果找到多個檔案，會提供一個清單讓您選擇。

## 發布與 Token 安全

- 請勿將 Marketplace 或 Open VSX 的真實 token 放入此 repository。
- 本機 token 筆記請放在 repository 外側，例如專案資料夾旁的 `<repo path> note.txt`。
- `note.example.txt` 只作為格式範本，不要填入真實 token。
- 發布前先執行 `npm run package:release`；它會建立 VSIX 並掃描封包中是否含有 token 筆記或敏感檔案。
- 掃描通過後再執行 `npm run publish:all` 發布。

## 版本紀錄

### 1.1.7

- 修復 Windows 上 emoji 檔名無法開啟的問題，例如 `[👥會議準備.txt]`。
- 改用 Everything UTF-8 匯出結果讀取路徑，避免非 ANSI 字元在 stdout 解碼時遺失。
- 新增發布封包安全掃描，避免本機 token 筆記或敏感檔被打入 VSIX。
- 修正 integration test runner 可能被繼承的 Electron 環境變數干擾。

### 1.1.4

- **重要錯誤修復**：解決了開啟包含中文字元路徑的檔案時出現的 "spawn cmd.exe ENOENT" 錯誤。
- **改善使用者體驗**：檔案開啟時會在檔案總管中自動選取該檔案（使用 `/select` 參數）。
- **提升可靠性**：移除了導致檔案開啟失敗的工作目錄參數設定。

### 1.1.3

- 錯誤修復與穩定性改進。

### 1.1.1

- 在 README 中新增演示 GIF。
- 在英文版 README 中新增中文版 README 的連結。

### 1.1.0

- 新增對 macOS 的支援，使用 Spotlight (`mdfind`) 進行搜尋。
- 擴充功能現已跨平台。

### 1.0.0

- 初始版本,支援在 Windows 上透過 Everything 開啟檔案。

## 原始碼儲存庫

[GitHub - papple23g/file-linker](https://github.com/papple23g/file-linker)

## 授權條款

MIT
