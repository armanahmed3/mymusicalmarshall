$zipPath = "c:\Users\92312\Desktop\mymusicalmarshall\mymusicalmarshall-changes-only.zip"
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

$stage = "c:\Users\92312\Desktop\mymusicalmarshall\stage_code_only"
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }

New-Item -ItemType Directory -Path "$stage\src\components" -Force | Out-Null
New-Item -ItemType Directory -Path "$stage\src\data" -Force | Out-Null
New-Item -ItemType Directory -Path "$stage\dist\assets" -Force | Out-Null

Copy-Item "c:\Users\92312\Desktop\mymusicalmarshall\src\types.ts" "$stage\src\types.ts"
Copy-Item "c:\Users\92312\Desktop\mymusicalmarshall\src\App.tsx" "$stage\src\App.tsx"
Copy-Item "c:\Users\92312\Desktop\mymusicalmarshall\src\components\LandingPage.tsx" "$stage\src\components\LandingPage.tsx"
Copy-Item "c:\Users\92312\Desktop\mymusicalmarshall\src\components\AdminPanelView.tsx" "$stage\src\components\AdminPanelView.tsx"
Copy-Item "c:\Users\92312\Desktop\mymusicalmarshall\src\components\NoticeBoardView.tsx" "$stage\src\components\NoticeBoardView.tsx"
Copy-Item "c:\Users\92312\Desktop\mymusicalmarshall\src\data\initialSongs.ts" "$stage\src\data\initialSongs.ts"

Copy-Item "c:\Users\92312\Desktop\mymusicalmarshall\dist\index.html" "$stage\dist\index.html"
Copy-Item -Recurse "c:\Users\92312\Desktop\mymusicalmarshall\dist\assets" "$stage\dist\assets"

Compress-Archive -Path "$stage\*" -DestinationPath $zipPath -Force
Remove-Item -Recurse -Force $stage

Get-Item $zipPath | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
