# Cricket API Test Script
# Run this to test if the cricket live matches API is working

Write-Host "🏏 Testing Cricket Live Matches API..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Test 1: General live matches with cricket filter
Write-Host "Test 1: Fetching live matches (cricket only)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/matches/live?sports=cricket" -Method Get
    Write-Host "✅ Success! Found $($response.data.Count) cricket matches" -ForegroundColor Green
    if ($response.data.Count -gt 0) {
        Write-Host "Sample match: $($response.data[0].homeTeam.name) vs $($response.data[0].awayTeam.name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 2: Dedicated cricket API
Write-Host "Test 2: Fetching from dedicated cricket API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/cricket/live" -Method Get
    Write-Host "✅ Success! Found $($response.data.Count) live cricket matches" -ForegroundColor Green
    Write-Host "Leagues available: $($response.leagues.Count)" -ForegroundColor Gray
    
    if ($response.data.Count -gt 0) {
        Write-Host ""
        Write-Host "Live Matches:" -ForegroundColor Cyan
        foreach ($match in $response.data) {
            Write-Host "  🔴 $($match.league): $($match.homeTeam.name) $($match.homeScore) - $($match.awayScore) $($match.awayTeam.name)" -ForegroundColor White
        }
    } else {
        Write-Host "ℹ️  No live cricket matches at the moment" -ForegroundColor Blue
    }
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Filter by specific league (IPL)
Write-Host "Test 3: Fetching IPL matches only..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/cricket/live?league=ipl" -Method Get
    Write-Host "✅ Success! Found $($response.data.Count) IPL matches" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Tests completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view in browser:" -ForegroundColor Yellow
Write-Host "  • All live matches: http://localhost:3000/live" -ForegroundColor Gray
Write-Host "  • Cricket only: http://localhost:3000/cricket" -ForegroundColor Gray
Write-Host "  • API endpoint: http://localhost:3000/api/cricket/live" -ForegroundColor Gray
