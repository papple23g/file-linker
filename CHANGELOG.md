# Changelog

All notable changes to the "File Linker" extension will be documented in this file.

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
