# File Linker for VS Code

Instantly open files in VS Code by Alt-clicking file paths in any text file. Powered by the lightning-fast search capabilities of **Everything**.

## Features

-   **Quick File Access**: Hold the `Alt` key and click on a file name enclosed in square brackets (e.g., `[my-document.txt]`) to open it instantly.
-   **Everything Integration**: Leverages the Everything search engine for near-instantaneous file lookups across your entire system.
-   **Smart Error Handling**: If the Everything service isn't running, the extension will notify you and provide a convenient link to the official download page.

## Requirements

This extension has one crucial requirement:

**You must have the [Everything](https://www.voidtools.com/) application installed and running in the background.**

While this extension bundles the necessary command-line tool (`es.exe`), the tool itself needs to communicate with the main Everything service to perform searches. If the service is not running, you will be prompted to start it.

## How It Works

1.  When you hover over text enclosed in `[]` while pressing the `Alt` key, the extension recognizes it as a potential file link.
2.  A tooltip will appear, confirming the file name.
3.  Clicking the link triggers a search using Everything.
4.  The first file found matching the name is opened instantly.

## License

ISC
