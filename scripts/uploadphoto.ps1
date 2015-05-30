$photofile = '916388919873557099_1592517739.jpg'
$endpoint = 'http://photos.witnesskingtides.org:3000/photos/'
$whitelistedsite = 'http://photos.witnesskingtides.org'

$binary = [IO.File]::ReadAllBytes("$pwd\$photofile")
$base64 = [Convert]::ToBase64String($binary)

$request = @{}
$request.Photo = $base64
$request.FirstName = 'Uni Melbourne Brazilian Science Without Borders Scholars'
$request.LastName = ''
$request.Email = 'pv.rizzardi@gmail.com'
$request.Description = ''
$request.Latitude = -37.878870
$request.Longitude = 144.976408
$request.fileId = "$photofile"

$headers = @{}
$headers.Add('Origin', $whitelistedsite)

$json = ConvertTo-Json $request

Write-Host 'sending'

try
{
  Invoke-RestMethod $endpoint -Body $json -Headers $headers -Method POST -ContentType 'application/json'
}
catch [System.Exception]
{
  echo $_.Exception|format-list -force
}
