@echo off
cd /d "%~dp0"
echo Creating Winter Arc Tracker shortcut on your Windows Desktop...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$desktop = [Environment]::GetFolderPath('Desktop'); " ^
  "$shortcutPath = [System.IO.Path]::Combine($desktop, 'Winter Arc Tracker.lnk'); " ^
  "$shortcut = $ws.CreateShortcut($shortcutPath); " ^
  "$shortcut.TargetPath = [System.IO.Path]::Combine('%CD%', 'run_app.bat'); " ^
  "$shortcut.WorkingDirectory = '%CD%'; " ^
  "$shortcut.WindowStyle = 1; " ^
  "$shortcut.Description = 'Winter Arc Tracker - Lifetime Habit & Goal System'; " ^
  "$shortcut.Save(); " ^
  "Write-Host 'Desktop shortcut created successfully at: ' $shortcutPath -ForegroundColor Green"

echo.
echo You can now double-click 'Winter Arc Tracker' directly from your Desktop anytime!
pause
