# System Design Patterns & Key Technical Decisions

## Core Architecture
- **VSCode Extension API**: Developed using the official VSCode API for seamless integration.
- **Unconditional Hover**: Due to limitations in the `HoverProvider` API, the hover tooltip is shown unconditionally when the cursor is over a potential link, rather than being tied to a modifier key.
- **Bundled Everything CLI**: The extension bundles the Everything command-line interface (`es.exe`) to remove the need for a separate user installation of the CLI.
