$ErrorActionPreference = 'Stop'

Write-Output "HOME:"
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing
  Write-Output "STATUS:$($r.StatusCode)"
  $s = $r.Content
  if ($s.Length -gt 600) { $s = $s.Substring(0,600) + '...' }
  Write-Output $s
} catch { Write-Output "ERROR:$($_.Exception.Message)" }

Write-Output "`nLIVE:"
try {
  $live = Invoke-RestMethod -Uri 'http://localhost:3000/api/matches/live'
  $live | ConvertTo-Json -Depth 6
} catch { Write-Output "ERROR:$($_.Exception.Message)" }

Write-Output "`nUPCOMING:"
try {
  $up = Invoke-RestMethod -Uri 'http://localhost:3000/api/matches/upcoming'
  $up | ConvertTo-Json -Depth 6
} catch { Write-Output "ERROR:$($_.Exception.Message)" }

Write-Output "`nPOST PREDICTION (using first upcoming):"
try {
  if ($up -is [array]) { $item = $up[0] } else { $item = $up }
  $res = Invoke-RestMethod -Uri 'http://localhost:3000/api/predictions' -Method Post -ContentType 'application/json' -Body ($item | ConvertTo-Json -Depth 6)
  $res | ConvertTo-Json -Depth 6
} catch { Write-Output "ERROR:$($_.Exception.Message)" }
