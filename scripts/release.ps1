param(
    [Parameter(Mandatory=$false)]
    [switch]$PublishMarketplace,

    [Parameter(Mandatory=$false)]
    [switch]$PublishOpenVsx,

    [Parameter(Mandatory=$false)]
    [string]$TokenNotePath,

    [Parameter(Mandatory=$false)]
    [switch]$SkipTests
)

$ErrorActionPreference = 'Stop'

function Invoke-CheckedCommand {
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$Command,

        [Parameter(Mandatory=$true)]
        [string]$Description
    )

    Write-Host $Description
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$Description failed with exit code $LASTEXITCODE"
    }
}

function Get-OpenVsxTokenFromNote {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        return ''
    }

    foreach ($line in Get-Content -LiteralPath $Path) {
        if ($line -match '(?i)(?:\$env:)?(?:OVSX_TOKEN|OVSX_PAT)\s*[:=]\s*["'']?([^"'']+)') {
            return $matches[1].Trim()
        }
    }

    return ''
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
if (-not $TokenNotePath) {
    $TokenNotePath = "$repoRoot note.txt"
}

Push-Location $repoRoot
try {
    $repoNotePath = Join-Path $repoRoot 'note.txt'
    if (Test-Path -LiteralPath $repoNotePath) {
        throw "Refusing to release while repo-local note.txt exists. Move secrets outside the repository."
    }

    $packageJson = Get-Content -LiteralPath 'package.json' -Raw | ConvertFrom-Json
    $version = $packageJson.version
    $vsixPath = Join-Path $repoRoot "file-linker-$version.vsix"

    if (-not $SkipTests) {
        Invoke-CheckedCommand -Description 'Running npm test' -Command { npm test }
    }

    if (Test-Path -LiteralPath $vsixPath) {
        Remove-Item -LiteralPath $vsixPath -Force
    }

    Invoke-CheckedCommand -Description "Packaging $vsixPath" -Command { vsce package -o $vsixPath }
    Invoke-CheckedCommand -Description 'Scanning VSIX for secrets' -Command {
        & (Join-Path $repoRoot 'scripts/assert-vsix-clean.ps1') -VsixPath $vsixPath -TokenNotePath $TokenNotePath
    }

    if ($PublishMarketplace) {
        Invoke-CheckedCommand -Description 'Publishing to VS Marketplace' -Command {
            vsce publish --packagePath $vsixPath
        }
    }

    if ($PublishOpenVsx) {
        $openVsxToken = $env:OVSX_PAT
        if (-not $openVsxToken) {
            $openVsxToken = $env:OVSX_TOKEN
        }
        if (-not $openVsxToken) {
            $openVsxToken = Get-OpenVsxTokenFromNote -Path $TokenNotePath
        }
        if (-not $openVsxToken) {
            throw "Open VSX token not found. Set OVSX_PAT/OVSX_TOKEN or update the sibling note file."
        }

        $oldOpenVsxPat = $env:OVSX_PAT
        try {
            $env:OVSX_PAT = $openVsxToken
            Invoke-CheckedCommand -Description 'Publishing to Open VSX' -Command {
                npx ovsx@0.10.12 publish $vsixPath
            }
        } finally {
            $env:OVSX_PAT = $oldOpenVsxPat
        }
    }

    Write-Host "Release package ready: $vsixPath"
} finally {
    Pop-Location
}
