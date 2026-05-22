# File Linker Internal Publishing Notes

This document is for repository maintainers and Codex agents. It is excluded from VSIX packaging by `.vscodeignore`, but it may still be visible in the public GitHub repository.

## Publishing Checklist

- Run validation before publishing: `npm test`.
- Bump `package.json` and `package-lock.json` to a new version; marketplaces reject republishing the same version.
- Update `CHANGELOG.md` and public README release notes with user-facing changes only.
- Package a fresh VSIX with `npm run package`; do not reuse an older package.
- Inspect the VSIX before publishing. It must not contain `extension/AGENTS.md`, `extension/docs/internal/`, `extension/note*.txt`, `.env`, or token-looking strings.
- Publish the same VSIX to VS Code Marketplace and Open VSX when credentials are available.

## Token Handling

- Never commit, print, summarize, or package marketplace tokens.
- Prefer environment variables for local publishing credentials:
  - `VSCE_PAT` for VS Code Marketplace.
  - `OVSX_TOKEN` for Open VSX.
- If a token is printed, committed, or packaged, treat it as leaked and rotate it before publishing again.
- Codex should use the local note path listed in `AGENTS.md` only as a pointer; do not read or quote secret values unless the user explicitly provides safe instructions.

## VS Code Marketplace

- Package first:
  ```powershell
  npm run package
  ```
- Publish an existing VSIX:
  ```powershell
  npx vsce publish --packagePath .\file-linker-<version>.vsix
  ```
- Verify the Marketplace page after publishing:
  `https://marketplace.visualstudio.com/items?itemName=peterwang.file-linker`

## Open VSX

- Cursor primarily uses Open VSX Registry, so Marketplace publishing alone may not make a new version available in Cursor search.
- Create the namespace once if needed:
  ```powershell
  npx ovsx create-namespace peterwang -p <token>
  ```
- Publish an existing VSIX:
  ```powershell
  npx ovsx publish .\file-linker-<version>.vsix -p <token>
  ```
- Verify the Open VSX page after publishing:
  `https://open-vsx.org/extension/peterwang/file-linker`

## Namespace Claim Notes

If Open VSX shows the `peterwang` namespace as unverified, open an issue at:
`https://github.com/EclipseFdn/open-vsx.org/issues/new`

Use the title:
```text
Claiming namespace: peterwang
```

Include evidence that the maintainer controls:
- VS Code Marketplace extension `peterwang.file-linker`.
- GitHub repository `papple23g/file-linker`.
- Open VSX publishing account used for the extension.

The claim is about trust/verification only; it should not affect extension runtime behavior.

## Failure Handling

- If VS Code Marketplace publish fails because the version exists, bump to a new version and rebuild.
- If Open VSX publish fails with missing namespace, create or claim the namespace before retrying.
- If Open VSX exits without a clear success message, verify with the API or website before treating the publish as complete.
- If packaging checks find internal files or token markers, fix `.vscodeignore` or source content, then rebuild a fresh VSIX.
