# System Design Patterns & Technical Decisions

## Design Patterns
- **Event-Driven**: Core logic is triggered by VSCode's HoverProvider and Command registration events for Alt-click functionality.
- **Regex Parsing**: Uses regular expressions to detect filenames within square brackets, ensuring flexibility.

## Technical Decisions
- **VSCode Extension API**: Developed using the official VSCode API for seamless integration.
- **Bundled Everything CLI**: The extension now bundles the Everything command-line interface (`es.exe`) to remove the need for a separate user installation of the CLI.
- **Dependency on Everything Service**: The extension requires the main Everything application/service to be running in the background to perform searches.
- **Graceful Error Handling**: If the Everything service is not detected (via exit code 8 from `es.exe`), the user is shown a clear error message with a link to the official download page.
- **MarkdownString for Hovers**: Hover content is rendered using `MarkdownString` to support clickable command URIs.
- **Windows-Only**: The extension is optimized for and exclusively supports the Windows platform due to its reliance on Everything.
