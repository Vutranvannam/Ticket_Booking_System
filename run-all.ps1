param (
    [switch]$NoBackend,
    [switch]$NoFrontend,
    [switch]$NoContainers
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"
$dockerCompose = Join-Path $root "infrastructure\app\docker-compose.yml"
$dockerEnvFile = Join-Path $root "infrastructure\app\.env"
$envFile = Join-Path $root ".env"

function Write-Step($message) {
    Write-Host ""
    Write-Host "==> $message" -ForegroundColor Cyan
}

#
# Load .env
#
if (Test-Path $envFile) {
    Write-Step "Loading .env"

    Get-Content $envFile |
    Where-Object { $_ -and $_ -notmatch '^\s*#' } |
    ForEach-Object {
        $name, $value = $_ -split '=', 2
        [System.Environment]::SetEnvironmentVariable(
            $name.Trim(),
            $value.Trim(),
            "Process"
        )
    }
}
else {
    Write-Host ".env not found." -ForegroundColor Yellow
}

#
# Containers
#
if (-not $NoContainers) {

    Write-Step "Starting PostgreSQL & Redis"

    docker compose `
        --env-file $dockerEnvFile `
        -f $dockerCompose `
        up -d

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start Docker containers."
    }

}
else {
    Write-Host "Skipping containers." -ForegroundColor Yellow
}

#
# Backend
#
if (-not $NoBackend) {

    Write-Step "Starting Backend"

    $backendCmd = @"
Get-Content "$envFile" | Where-Object { `$_ -and `$_ -notmatch '^\s*#' } | ForEach-Object {
    `$n, `$v = `$_ -split '=', 2
    [System.Environment]::SetEnvironmentVariable(`$n.Trim(), `$v.Trim(), 'Process')
}
Set-Location "$backendPath"
.\mvnw spring-boot:run
"@

    Start-Process powershell `
        -ArgumentList "-NoExit", "-Command", $backendCmd

}
else {
    Write-Host "Skipping backend." -ForegroundColor Yellow
}

#
# Frontend
#
if (-not $NoFrontend) {

    Write-Step "Starting Frontend"

    $frontendCmd = @"
Set-Location "$frontendPath"

if (!(Test-Path "node_modules")) {
    pnpm install
}

pnpm dev
"@

    Start-Process powershell `
        -ArgumentList "-NoExit", "-Command", $frontendCmd

}
else {
    Write-Host "Skipping frontend." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Development environment started successfully." -ForegroundColor Green