# Run from project folder:  .\start-server.ps1
# Then open http://localhost:8765 in your browser

$port = 8765
$root = $PSScriptRoot

Set-Location $root
Write-Host "Serving $root at http://localhost:$port"
Write-Host "Press Ctrl+C to stop."

if (Get-Command python -ErrorAction SilentlyContinue) {
  python -m http.server $port
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
  py -m http.server $port
} else {
  Write-Error "Python not found. Install Python or open index.html with Live Server."
  exit 1
}
