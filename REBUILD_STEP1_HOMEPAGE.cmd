@echo off
REM ============================================================
REM REBUILD_STEP1_HOMEPAGE.cmd
REM Run from C:\pattayagym in a normal CMD window (NOT PowerShell).
REM
REM What it does:
REM   1. Confirms we are on redesign-2026 branch
REM   2. Deletes Codex's overengineered junk
REM   3. Replaces styles.css and index.html with the new clean versions
REM   4. Runs node scripts/verify.js
REM   5. Commits and pushes to redesign-2026
REM
REM After it runs:
REM   - Cloudflare auto-deploys the redesign-2026 branch
REM   - Wait ~60s, then check the preview URL
REM   - Take a screenshot of the rendered homepage
REM ============================================================

cd /d C:\pattayagym

echo.
echo === 1. Confirming branch ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (
  echo Wrong branch: %BRANCH%
  echo Switch to redesign-2026 first: git checkout redesign-2026
  exit /b 1
)
echo On branch: %BRANCH%

echo.
echo === 2. Deleting Codex junk ===
if exist packages\ui (rmdir /s /q packages\ui & echo removed packages\ui)
if exist packages (rmdir /s /q packages & echo removed packages/)
if exist scripts\capture-component-snapshots.js (del /f /q scripts\capture-component-snapshots.js & echo removed scripts\capture-component-snapshots.js)
if exist PALETTE_PREVIEW.html (del /f /q PALETTE_PREVIEW.html & echo removed PALETTE_PREVIEW.html)
if exist TYPE_SPECIMEN.html (del /f /q TYPE_SPECIMEN.html & echo removed TYPE_SPECIMEN.html)
if exist DISCOVERY.md (del /f /q DISCOVERY.md & echo removed DISCOVERY.md)
if exist ICONOGRAPHY.md (del /f /q ICONOGRAPHY.md & echo removed ICONOGRAPHY.md)
if exist tokens.json (del /f /q tokens.json & echo removed tokens.json)

echo.
echo === 3. Swapping homepage ===
move /y index.html index.OLD.html
move /y styles.css styles.OLD.css
move /y index.new.html index.html
move /y styles.new.css styles.css
del /f /q index.OLD.html styles.OLD.css
echo new index.html and styles.css in place

echo.
echo === 4. Verify ===
node scripts\verify.js
if errorlevel 1 (
  echo verify.js FAILED. Stopping. Do NOT push.
  exit /b 1
)

echo.
echo === 5. Commit + push to redesign-2026 ===
git add -A
git commit -m "rebuild step 1: new homepage from scratch (V4 direction, blue+orange+white, no scrollbars, mobile-first)"
git push origin redesign-2026
if errorlevel 1 (
  echo Push failed. Investigate.
  exit /b 1
)

echo.
echo ============================================================
echo Done. Wait ~60s for Cloudflare to redeploy redesign-2026.
echo Then open the preview URL:
echo   https://redesign-2026.pattayagym.pages.dev/
echo   (exact URL is in your Cloudflare Pages dashboard)
echo.
echo Screenshot it on your phone and send the screenshot back.
echo ============================================================
