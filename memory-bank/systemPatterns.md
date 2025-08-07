# System Design Patterns & Technical Decisions

## Design Patterns
- **Event-Driven**: Core logic is triggered by VSCode's `HoverProvider` event. The hover appears automatically on text matching the pattern, without requiring a modifier key.
- **Regex Parsing**: Uses regular expressions to detect filenames within square brackets, ensuring flexibility.

## Technical Decisions
- **VSCode Extension API**: Developed using the official VSCode API for seamless integration.
- **Unconditional Hover**: Due to limitations in the `HoverProvider` API, the hover tooltip is shown unconditionally when the cursor is over a potential link, rather than being tied to a modifier key like 'Alt'.
- **Bundled Everything CLI**: The extension bundles the Everything command-line interface (`es.exe`) to remove the need for a separate user installation of the CLI.
- **Dependency on Everything Service**: The extension requires the main Everything application/service to be running in the background to perform searches.
- **Graceful Error Handling**: If the Everything service is not detected (via exit code 8 from `es.exe`), the user is shown a clear error message with a link to the official download page.
- **Partial Name Search**: The implementation calls Everything in a way that allows for partial name matches, sorting by `run-count` to surface the most relevant result.
- **MarkdownString for Hovers**: Hover content is rendered using `MarkdownString` to support clickable command URIs.
- **Windows-Only**: The extension is optimized for and exclusively supports the Windows platform due to its reliance on Everything.
