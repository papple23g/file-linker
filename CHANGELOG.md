# Changelog

All notable changes to the "File Linker" extension will be documented in this file.

## [1.1.11] - 2026-05-23

### Changed
- Updated English and Traditional Chinese README release notes for v1.1.10.
- Moved internal Open VSX, namespace, and publishing notes into `docs/internal/publishing.md`.
- Restored `AGENTS.md` as the Codex entrypoint while keeping internal files excluded from VSIX packages.

## [1.1.10] - 2026-05-23

### Fixed
- Restored clickable hover command behavior with boolean `MarkdownString.isTrusted` compatibility.
- Restored default debug output for activation, hover, command trigger, search, and open events.
- Fixed Windows opening behavior so files open with the system default application instead of VS Code or Explorer reveal.
- Preserved legacy Everything stdout fallback while adding UTF-8 export support for Chinese and emoji filenames.

### Added
- Added unit and extension-host integration tests for hover command payloads, stdout fallback, UTF-8 export, emoji filenames, and default-application opening.

## [1.1.9] - 2026-05-22

### Fixed
- Emergency rollback release: restored the extension behavior and runtime implementation to the stable v1.1.5 code path.
- Published as v1.1.9 because marketplaces do not allow republishing the existing v1.1.5 version number.

## [1.1.5] - 2026-02-20

### Fixed
- **Critical bug fix**: Restored original file opening behavior from v1.1.0 (commit f8c235e)
  - Removed `/select` parameter that was causing all links to open "This PC" directory
  - Restored `cwd` parameter for reliable file operations
  - Files now open directly with default program instead of only showing parent directory
  - Fixed UTF-8 encoding detection for paths with Chinese characters

### Changed
- Simplified file opening logic back to proven implementation
  - Files: Open directly with default application
  - Directories: Open in Windows Explorer
  - Automatic encoding detection (UTF-8/CP950) for international file paths

## [1.1.4] - 2026-02-20

### Fixed
- **Critical bug fix**: Resolved "spawn cmd.exe ENOENT" error when opening files
  - Removed problematic `cwd` parameter from spawn command
  - Fixed issues with paths containing Chinese characters
  - Improved file opening reliability on Windows

### Changed
- Enhanced Windows file opening with `/select` parameter
  - Files are now opened in Explorer with the file automatically selected
  - Better user experience when locating opened files

## [1.1.3] - Previous version

### Features
- Hover over file names in square brackets to see quick actions
- Click to open files using Everything (Windows) or Spotlight (macOS)
- Support for full-path file searches
- Integrated Everything search engine support
- Output channel for debugging

---

## Bug Fix Details (v1.1.4)

### Problem
Users encountered an error when clicking on file links:
```
執行錯誤: spawn C:\Windows\system32\cmd.exe ENOENT
```

### Root Cause
The `cwd` (current working directory) parameter in the spawn command was set to a directory extracted from the file path. When paths contained Chinese characters, encoding issues could cause the directory path to be invalid, leading to the ENOENT (file not found) error.

### Solution
1. Removed the `cwd` parameter - `explorer.exe` works correctly with full paths without needing a working directory
2. Added `/select` parameter to `explorer.exe` command for better user experience
3. This ensures reliable file opening regardless of path encoding issues

### Impact
- ✅ Fixes file opening on Windows systems
- ✅ Handles paths with Chinese characters correctly
- ✅ Improves user experience by selecting the opened file in Explorer
- ✅ No breaking changes - fully backward compatible
