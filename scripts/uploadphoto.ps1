$photofile = 'uploadphoto.jpg'
$endpoint = 'http://localhost:3000/photos'
$whitelistedsite = 'http://localhost:5000'

$binary = [IO.File]::ReadAllBytes("$pwd\$photofile")
$base64 = [Convert]::ToBase64String($binary)

$request = @{}
$request.Photo = $base64
$request.FirstName = 'Leonard'
$request.LastName = 'Nimoy'
$request.Email = 'spock@startrek.com'
$request.Descrition = 'Live long and prosper'
$request.Latitude = -37.813187
$request.Longitude = 144.962977
$request.fileId = '0'

$headers = @{}
$headers.Add('Origin', $whitelistedsite)

$json = ConvertTo-Json $request

Write-Host 'sending'

Invoke-RestMethod $endpoint -Body $json -Headers $headers -Method POST -ContentType 'application/json'
