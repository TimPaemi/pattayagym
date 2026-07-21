@echo off
REM ============================================================
REM REBUILD_HEADER_FIX.cmd
REM
REM Run from C:\pattayagym in cmd.exe (or .\REBUILD_HEADER_FIX.cmd in PowerShell)
REM
REM Fixes the legacy nav header on subpages:
REM   - "PATTAYA.GYM" all-caps -> "Pattaya.Gym" title case
REM   - Drops horizontal mono nav menu (Muay Thai | Gyms | Golf...)
REM   - Adds the 2 round icon buttons matching the homepage
REM
REM Build scripts patched: build.js, build-extras.js, build-discovery.js
REM ============================================================

cd /d C:\pattayagym

echo === 1. Confirming branch ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (
  echo Wrong branch: %BRANCH%
  exit /b 1
)
echo On %BRANCH%

echo.
echo === 2. Regenerating all pages with new header ===
call node build.js 2>&1
if errorlevel 1 (echo build.js FAILED & exit /b 1)
call node build-extras.js 2>&1
if errorlevel 1 (echo build-extras.js FAILED & exit /b 1)
call node build-discovery.js 2>&1
if errorlevel 1 (echo build-discovery.js FAILED & exit /b 1)

echo.
echo === 3. Verify ===
node scripts\verify.js
if errorlevel 1 (echo verify.js FAILED & exit /b 1)

echo.
echo === 4. Commit + push ===
git add -A
git commit -m "fix(nav): subpages use new clean header (Pattaya.Gym + 2 icon buttons), drop legacy mono nav menu"
git push origin redesign-2026
if errorlevel 1 (echo Push failed & exit /b 1)

echo.
echo ============================================================
echo Pushed. Wait ~60s for Cloudflare to redeploy.
echo Then hard-refresh:
echo   https://redesign-2026.pattayagym.pages.dev/category/muay-thai/
echo   https://redesign-2026.pattayagym.pages.dev/gyms/fairtex-pattaya/
echo Header should now match the homepage.
echo ============================================================
