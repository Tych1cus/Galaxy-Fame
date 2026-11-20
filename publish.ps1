# Publish a new build of Galaxy Fame to GitHub Pages.
# Usage:  .\publish.ps1 -File "C:\Users\kevin\Downloads\galaxy-fame-22.html" -Message "Harder midgame"
param(
  [Parameter(Mandatory=$true)][string]$File,
  [string]$Message = "Update build",
  [string]$Repo = "Tych1cus/Galaxy-Fame"
)
if (-not (Test-Path $File)) { throw "File not found: $File" }
$bytes = [IO.File]::ReadAllBytes((Resolve-Path $File))
$content = [Convert]::ToBase64String($bytes)

# current file sha (needed to replace it)
$sha = (gh api "repos/$Repo/contents/index.html" --jq .sha)

# upload
$body = @{ message = $Message; content = $content; sha = $sha; branch = "main" } | ConvertTo-Json -Compress
$body | Out-File -Encoding ascii "$env:TEMP\gf_body.json"
gh api -X PUT "repos/$Repo/contents/index.html" --input "$env:TEMP\gf_body.json" --jq ".commit.sha"
Write-Host "Pushed. GitHub Pages rebuilds in about a minute."
