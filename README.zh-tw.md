[Read this in English](README.md)

# VS Code 檔案連結器 (File Linker)

透過您作業系統**內建的搜尋引擎**，在任何文字檔案中將滑鼠懸停並點擊檔案名稱，即可立即開啟檔案。

## 功能特色

-   **即時檔案存取**：只需將滑鼠懸停在方括號中的檔案名稱 (例如 `[我的文件.txt]`) 上，即可顯示可點擊的連結。
-   **跨平台支援**：同時支援 Windows 與 macOS。
-   **原生系統整合**：
    -   在 **Windows** 上，本擴充功能利用強大的 **[Everything](https://www.voidtools.com/)** 搜尋引擎。
    -   在 **macOS** 上，則使用內建的 **Spotlight** 搜尋功能 (`mdfind`)，無需安裝額外軟體。
-   **全系統搜尋**：在您的整個系統中尋找檔案，而不僅限於目前的工作區。
-   **智慧錯誤處理**：如果 Windows 上的 Everything 服務未執行，本擴充功能會引導您進行安裝。

## 必要條件

-   **Windows**: 您必須已安裝 **[Everything](https://www.voidtools.com/)** 應用程式，並讓它在背景執行。
-   **macOS**: 無需安裝任何額外軟體，本擴充功能直接使用內建的 Spotlight 功能。

## 運作方式

1.  當您將滑鼠懸停在 `[]` 包圍的文字上時，一個帶有連結的工具提示將會出現。
2.  點擊連結會觸發系統原生的搜尋引擎（Windows 為 Everything，macOS 為 Spotlight）。
3.  在 Windows 上，會直接開啟最符合的檔案。在 macOS 上，如果找到多個檔案，會提供一個清單讓您選擇。

## 版本紀錄

### 1.1.0 (計畫中)

-   新增對 macOS 的支援，使用 Spotlight (`mdfind`) 進行搜尋。
-   擴充功能現已跨平台。

### 1.0.0

-   初始版本，支援在 Windows 上透過 Everything 開啟檔案。

## 原始碼儲存庫

[GitHub - papple23g/file-linker](https://github.com/papple23g/file-linker)

## 授權條款

MIT
