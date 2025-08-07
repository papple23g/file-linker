# File Linker

A VSCode extension that allows you to hover over and click on file names within square brackets to instantly open them using the Everything search engine.

## Features

- **Instant File Opening**: Hover over any file name enclosed in square brackets (e.g., `[myfile.txt]`) and click the link to open it instantly.
- **Cross-Project Search**: Finds files across your entire system, not just within the current workspace.
- **Everything Integration**: Leverages the powerful Everything search engine for lightning-fast file discovery.
- **No Manual Pathing**: Eliminates the need to manually browse or type file paths.

## Requirements

- **Everything**: The [Everything](https://www.voidtools.com/) application must be installed and running on your system.

## Usage

1. **Mark Files**: In any text file (code, notes, README, etc.), mark a file name using square brackets: `[filename]`.
2. **Hover**: Move your cursor over the file name within the brackets.
3. **Click**: Click the "Open File" link that appears in the hover tooltip.

## Extension Settings

This extension does not add any VS Code settings.

## Known Issues

- The extension requires Everything to be running. If it's not, a helpful error message will guide you to install it.

## Release Notes

### 1.0.0

- Initial release of File Linker.
- Hover and click functionality for opening files.
- Bundled Everything CLI for seamless integration.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request on [GitHub](https://github.com/papple23g/file-linker).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
