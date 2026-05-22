param(
    [Parameter(Mandatory=$true)]
    [string]$VsixPath,

    [Parameter(Mandatory=$false)]
    [string]$TokenNotePath
)

$ErrorActionPreference = 'Stop'

function Get-TokenValuesFromNote {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        return @()
    }

    $tokenValues = New-Object System.Collections.Generic.List[string]
    foreach ($line in Get-Content -LiteralPath $Path) {
        if ($line -match '(?i)(?:\$env:)?(?:OVSX_TOKEN|OVSX_PAT|VSCE_PAT)\s*[:=]\s*["'']?([^"'']+)') {
            $value = $matches[1].Trim()
            if ($value.Length -gt 0) {
                $tokenValues.Add($value)
            }
        }
    }

    return $tokenValues.ToArray()
}

if (-not (Test-Path -LiteralPath $VsixPath)) {
    throw "VSIX file not found: $VsixPath"
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$repoNotePath = Join-Path $repoRoot 'note.txt'
if (Test-Path -LiteralPath $repoNotePath) {
    throw "Refusing to package while repo-local note.txt exists. Move secrets outside the repository."
}

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("file-linker-vsix-check-" + [System.Guid]::NewGuid().ToString('N'))
$extractRoot = Join-Path $tempRoot 'extract'
$zipPath = Join-Path $tempRoot 'package.zip'
New-Item -ItemType Directory -Path $extractRoot | Out-Null

try {
    Copy-Item -LiteralPath $VsixPath -Destination $zipPath
    Expand-Archive -LiteralPath $zipPath -DestinationPath $extractRoot -Force

    $blockedPathPatterns = @(
        '(^|[\\/])note[^\\/]*\.txt$',
        '(^|[\\/])AGENTS\.md$',
        '(^|[\\/])\.env($|[\\/\.])',
        '\.token$',
        '\.key$',
        '\.secret$',
        '(^|[\\/])secrets[\\/]'
    )

    $violations = New-Object System.Collections.Generic.List[string]
    $files = Get-ChildItem -LiteralPath $extractRoot -Recurse -File

    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($extractRoot.Length).TrimStart('\', '/')
        foreach ($pattern in $blockedPathPatterns) {
            if ($relativePath -match $pattern) {
                $violations.Add("Blocked file path in VSIX: $relativePath")
            }
        }
    }

    $contentPatterns = @(
        'ovsxat_[A-Za-z0-9_\-]{20,}',
        'staging_ovsxat_[A-Za-z0-9_\-]{20,}',
        '\bVSCE_PAT\b',
        '\bOVSX_TOKEN\b',
        '\bOVSX_PAT\b'
    )

    $tokenValues = @()
    if ($TokenNotePath) {
        $tokenValues = Get-TokenValuesFromNote -Path $TokenNotePath
    }

    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($extractRoot.Length).TrimStart('\', '/')
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $text = [System.Text.Encoding]::UTF8.GetString($bytes)

        foreach ($pattern in $contentPatterns) {
            if ($text -match $pattern) {
                $violations.Add("Possible token pattern in VSIX file: $relativePath")
            }
        }

        foreach ($tokenValue in $tokenValues) {
            if ($tokenValue.Length -gt 0 -and $text.Contains($tokenValue)) {
                $violations.Add("Known publish token found in VSIX file: $relativePath")
            }
        }
    }

    if ($violations.Count -gt 0) {
        $message = "VSIX secret scan failed:`n" + ($violations -join "`n")
        throw $message
    }

    Write-Host "VSIX secret scan passed: $VsixPath"
} finally {
    if (Test-Path -LiteralPath $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
}
