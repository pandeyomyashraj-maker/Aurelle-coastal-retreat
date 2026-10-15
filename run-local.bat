@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "AURELLE Motion Polish" /D "%~dp0" cmd /k "py -m http.server 5187 --bind 127.0.0.1"
) else (
  where python >nul 2>nul
  if %errorlevel%==0 (
    start "AURELLE Motion Polish" /D "%~dp0" cmd /k "python -m http.server 5187 --bind 127.0.0.1"
  ) else (
    echo Python 3 was not found. Install Python or run this folder with another static server.
    pause
    exit /b 1
  )
)
timeout /t 2 >nul
start "" http://127.0.0.1:5187/
