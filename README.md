[閱讀繁體中文版 (Read in Traditional Chinese)](README.zh-tw.md)

# File Linker for VS Code

Instantly open files in VS Code by hovering over and clicking file paths in any text file. Powered by the lightning-fast search capabilities of **Everything**.

## Features

-   **Instant File Access**: Simply hover over a file name enclosed in square brackets (e.g., `[my-document.txt]`) to reveal a clickable link.
-   **Partial Name Search**: You don't need the full filename! Just type a part of it, and Everything will find the most relevant file based on your usage history.
-   **Everything Integration**: Leverages the Everything search engine for near-instantaneous file lookups across your entire system.
-   **Smart Error Handling**: If the Everything service isn't running, the extension will notify you and provide a convenient link to the official download page.

## Requirements

This extension has one crucial requirement:

**You must have the [Everything](https://www.voidtools.com/) application installed and running in the background.**

While this extension bundles the necessary command-line tool (`es.exe`), the tool itself needs to communicate with the main Everything service to perform searches. If the service is not running, you will be prompted to start it.

## How It Works

1.  When you hover over text enclosed in `[]`, a tooltip with a link will appear.
2.  Clicking the link triggers a search using Everything.
3.  The first file found matching the keyword(s) is opened instantly.

## License

MIT
