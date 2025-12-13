$ErrorActionPreference = 'Stop'
try {
  $up = Invoke-RestMethod -Uri 'http://localhost:3000/api/matches/upcoming'
  if ($up -is [array]) { $match = $up[0] } elseif ($up.data) { $match = $up.data[0] } else { $match = $up }
  Write-Output "Posting match id: $($match.id)"
  $res = Invoke-WebRequest -Uri 'http://localhost:3000/api/predictions' -Method Post -ContentType 'application/json' -Body ($match | ConvertTo-Json -Depth 10) -UseBasicParsing -ErrorAction Stop
  Write-Output "STATUS:$($res.StatusCode)"
  Write-Output $res.Content
} catch {
  Write-Output "ERROR: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    try {
      $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
      $body = $reader.ReadToEnd()
      Write-Output "RESPONSE BODY:"; Write-Output $body
    } catch {
      Write-Output "No response body available"
    }
  }
}
