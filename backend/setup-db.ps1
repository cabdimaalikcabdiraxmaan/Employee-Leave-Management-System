param(
    [Parameter(Mandatory = $true)]
    [string]$Password
)

$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (-not (Test-Path $psql)) {
    Write-Error "psql not found at $psql. Adjust the path in setup-db.ps1 if needed."
    exit 1
}

$env:PGPASSWORD = $Password

Write-Host "Creating database 'elms' (if it does not exist)..."
& $psql -U postgres -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'elms'" | Out-Null
$exists = & $psql -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'elms'"
if ($exists -ne "1") {
    & $psql -U postgres -d postgres -c "CREATE DATABASE elms;"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "Database 'elms' created."
} else {
    Write-Host "Database 'elms' already exists."
}

$envFile = Join-Path $PSScriptRoot ".env"
$url = "postgresql://postgres:$Password@127.0.0.1:5432/elms?schema=public"
$content = Get-Content $envFile -Raw
$content = $content -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$url`""
Set-Content $envFile $content.TrimEnd()
Write-Host ".env updated with DATABASE_URL."

Write-Host "Running Prisma setup..."
Set-Location $PSScriptRoot
npm run setup
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Done! Start the backend with: npm run dev"
Write-Host "Then in another terminal: cd ../frontend && npm run dev"
