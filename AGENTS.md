# File Linker Agent Notes

## Token handling

- Never write marketplace tokens, Open VSX tokens, Azure DevOps PATs, or any other secret values into repository files.
- For VS Marketplace / Open VSX publishing token information, refer to this local file outside the repository:
  `G:\我的雲端硬碟\場外用\場外存\250509 file_linker_vscode_extension 檔案超連結VSCODE模組擴充插件 note.txt`
- Do not print token values in chat, terminal summaries, logs, changelogs, package metadata, or commit messages.
- If a token was ever published inside a VSIX or pushed to a public service, treat it as leaked and rotate it before publishing again.

## Before publishing

- Run the project validation first, normally `npm test`.
- Package a fresh VSIX for the intended version; do not reuse an older `*.vsix`.
- Inspect the generated VSIX before publishing. The package must not contain:
  - `extension/AGENTS.md`
  - `extension/note.txt`
  - `.env`
  - token-looking strings such as `ovsxat_`
  - `VSCE_PAT`
  - `OVSX_TOKEN`
  - `OVSX_PAT`
- If any secret-like content is found in the VSIX, stop and fix the packaging inputs before publishing.
