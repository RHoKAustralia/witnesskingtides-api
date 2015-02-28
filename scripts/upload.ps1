$jsonfile = 'upload.json'
$endpoint = 'http://localhost:3000/tides'
$whitelistedsite = 'http://localhost:5000'

$content = [IO.File]::ReadAllText("$pwd\$jsonfile")
$parsed = ConvertFrom-Json $content

$headers = @{}
$headers.Add('Origin', $whitelistedsite)

foreach($line in $parsed){
  $json = ConvertTo-Json $line
  Write-Host 'sending'
  Invoke-RestMethod $endpoint -Body $line -Headers $headers -Method POST
} 

