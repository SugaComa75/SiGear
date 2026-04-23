param()

Write-Host "Starting mint mock server..."

# Determine repo root relative to this script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..\..")

Push-Location $repoRoot

$serverPath = Join-Path $repoRoot 'scripts\mint-mock-server\server.js'

$node = (Get-Command node -ErrorAction Stop).Source

$startInfo = Start-Process -FilePath $node -ArgumentList $serverPath -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 1

if ($startInfo -and $startInfo.Id) {
    Write-Host "Mock server started (PID=$($startInfo.Id)). Running CLI demo..."
} else {
    Write-Host "Failed to start mock server."; Exit 1
}

try {
    # Run the CLI (defaults to localhost mock)
    Push-Location (Join-Path $repoRoot 'scripts\mint-test-nti')
    Write-Host "Running mint-test-nti CLI..."
    $env:MINT_ENDPOINT = 'http://localhost:4000/v1/mint'
    node .\cli.js --tier low
    Pop-Location
} finally {
    Write-Host "Stopping mock server (PID=$($startInfo.Id))..."
    Stop-Process -Id $startInfo.Id -Force -ErrorAction SilentlyContinue
    Pop-Location
}

Write-Host "Demo complete."
