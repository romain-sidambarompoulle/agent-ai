param(
  [Parameter(Mandatory=True)][string]
)

 = "compose\demo"
 = "compose\"

if (Test-Path ) {
  Write-Host "??  Stack  existe d�j�" -ForegroundColor Yellow
  exit 1
}

Copy-Item  -Recurse -Destination 
(Get-Content "\docker-compose.yml") -replace "demo",  |
    Set-Content "\docker-compose.yml"

Write-Host "? Stack  pr�te dans compose\"
