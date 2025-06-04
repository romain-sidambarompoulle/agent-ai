Write-Host '🔍  Smoke-test Phase 4A'
$ErrorActionPreference = 'Stop'

# ───────── ActivePieces ─────────
$codeAp = (curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/)
if ($codeAp -ne 200) { Write-Error "ActivePieces KO (code $codeAp)"; exit 1 }
Write-Host '✅ ActivePieces OK (200)'

# ────────── LangFlow ────────────
$codeLf = (curl.exe -s -o NUL -w "%{http_code}" http://localhost:7860/)
if ($codeLf -ne 200) { Write-Error "LangFlow KO (code $codeLf)"; exit 1 }
Write-Host '✅ LangFlow OK (200)'

exit 0