$changesZip = "c:\Users\92312\Desktop\mymusicalmarshall\mymusicalmarshall-changes-only.zip"
$webZip = "c:\Users\92312\Desktop\mymusicalmarshall\mymusicalmarshall-web-only.zip"

if (Test-Path $changesZip) { Remove-Item -Force $changesZip }
if (Test-Path $webZip) { Remove-Item -Force $webZip }

$staging = "c:\Users\92312\Desktop\mymusicalmarshall\staging_changes"
if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }

New-Item -ItemType Directory -Path "$staging\src\components" -Force | Out-Null
New-Item -ItemType Directory -Path "$staging\src\data" -Force | Out-Null

Copy-Item "c:\Users\92312\Desktop\mymusicalmarshall\src\types.ts" "$staging\src\types.ts"
Copy-Item "c:\Users\92312\Desktop\mymusicalmarshall\src\App.tsx" "$staging\src\App.tsx"
Copy-Item "c:\Users\92312\Desktop\mymusicalmarshall\src\components\LandingPage.tsx" "$staging\src\components\LandingPage.tsx"
Copy-Item "c:\Users\92312\Desktop\mymusicalmarshall\src\components\AdminPanelView.tsx" "$staging\src\components\AdminPanelView.tsx"
Copy-Item "c:\Users\92312\Desktop\mymusicalmarshall\src\components\NoticeBoardView.tsx" "$staging\src\components\NoticeBoardView.tsx"
Copy-Item "c:\Users\92312\Desktop\mymusicalmarshall\src\data\initialSongs.ts" "$staging\src\data\initialSongs.ts"
Copy-Item -Recurse "c:\Users\92312\Desktop\mymusicalmarshall\dist" "$staging\dist"

Compress-Archive -Path "$staging\*" -DestinationPath $changesZip -Force
Remove-Item -Recurse -Force $staging

Compress-Archive -Path "c:\Users\92312\Desktop\mymusicalmarshall\dist\*" -DestinationPath $webZip -Force

Get-Item $changesZip, $webZip | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
