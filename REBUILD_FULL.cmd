@echo off
REM ============================================================
REM REBUILD_FULL.cmd
REM
REM Run from C:\pattayagym in a normal CMD window (NOT PowerShell).
REM Replaces homepage + styles.css + about/contact/404 with new
REM design and pushes to redesign-2026.
REM
REM Strategy: don't touch the 5,870-line build scripts. The new
REM styles.css handles BOTH new homepage markup AND existing
REM build-output class names (.venue-page, .cat-venue-grid,
REM .venue-hero, etc.) so every page gets the new design without
REM rewriting the build logic.
REM ============================================================

cd /d C:\pattayagym

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
if exist packages (rmdir /s /q packages & echo removed packages)
if exist scripts\capture-component-snapshots.js (del /f /q scripts\capture-component-snapshots.js & echo removed scripts\capture-component-snapshots.js)
if exist PALETTE_PREVIEW.html (del /f /q PALETTE_PREVIEW.html & echo removed PALETTE_PREVIEW.html)
if exist TYPE_SPECIMEN.html (del /f /q TYPE_SPECIMEN.html & echo removed TYPE_SPECIMEN.html)
if exist DISCOVERY.md (del /f /q DISCOVERY.md & echo removed DISCOVERY.md)
if exist ICONOGRAPHY.md (del /f /q ICONOGRAPHY.md & echo removed ICONOGRAPHY.md)
if exist tokens.json (del /f /q tokens.json & echo removed tokens.json)

echo.
echo === 3. Swapping in new files ===
move /y styles.css styles.OLD.css >nul
move /y styles.new.css styles.css >nul
echo styles.css replaced

move /y index.html index.OLD.html >nul
move /y index.new.html index.html >nul
echo index.html replaced

if exist about\index.html move /y about\index.html about\index.OLD.html >nul
move /y about.new.html about\index.html >nul
echo about/index.html replaced

if exist contact\index.html move /y contact\index.html contact\index.OLD.html >nul
move /y contact.new.html contact\index.html >nul
echo contact/index.html replaced

if exist 404.html move /y 404.html 404.OLD.html >nul
move /y 404.new.html 404.html >nul
echo 404.html replaced

del /f /q styles.OLD.css 2>nul
del /f /q index.OLD.html 2>nul
del /f /q about\index.OLD.html 2>nul
del /f /q contact\index.OLD.html 2>nul
del /f /q 404.OLD.html 2>nul

echo.
echo === 4. Regenerating build-script pages (venue/category/area/guide) ===
echo (existing build.js / build-extras.js / build-discovery.js keep their data
echo  flow; new styles.css handles their class names with the new visual)
call node build.js 2>&1
if errorlevel 1 (echo build.js FAILED & exit /b 1)
call node build-extras.js 2>&1
if errorlevel 1 (echo build-extras.js FAILED & exit /b 1)
call node build-discovery.js 2>&1
if errorlevel 1 (echo build-discovery.js FAILED & exit /b 1)
echo all build scripts succeeded

echo.
echo === 5. Verify ===
node scripts\verify.js
if errorlevel 1 (
  echo verify.js FAILED. Do NOT push. Stopping.
  exit /b 1
)

echo.
echo === 6. Commit + push to redesign-2026 ===
git add -A
git commit -m "rebuild: new design system (blue+orange+white, mobile+desktop, no scrollbars, all 6 templates)"
git push origin redesign-2026
if errorlevel 1 (
  echo Push failed. Investigate.
  exit /b 1
)

echo.
echo ============================================================
echo Pushed. Wait 60s for Cloudflare to deploy redesign-2026.
echo Then open the preview URL in your Cloudflare Pages dashboard
echo (typically https://redesign-2026.pattayagym.pages.dev/)
echo.
echo What you should see:
echo   /             new homepage (mobile + desktop)
echo   /about/       new about page
echo   /contact/     new contact page
echo   /404 routes   new 404 page
echo   /gyms/*/      OLD build markup with NEW visual treatment
echo   /category/*/  OLD build markup with NEW visual treatment
echo   /area/*/      OLD build markup with NEW visual treatment
echo   /guides/*/    OLD build markup with NEW visual treatment
echo.
echo Screenshot every URL type on your phone AND desktop.
echo Anything looks broken: send me the URL + screenshot.
echo ============================================================
