@echo off
REM ============================================================
REM PUSH_V2_HOMEPAGE.cmd
REM v2 rebuild · TimPaemi-inspired design
REM Round 1 of 3: ships the new styles.css + new homepage to redesign-2026
REM Subpages still use old design until round 2.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Confirming branch ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (
  echo Not on redesign-2026 — currently on %BRANCH%
  echo Run: git checkout redesign-2026
  exit /b 1
)

echo.
echo === 2. Swap in new homepage + new styles ===
if exist styles.css move /y styles.css styles.OLD.css >nul
move /y styles.new.css styles.css >nul
echo styles.css replaced

if exist index.html move /y index.html index.OLD.html >nul
move /y index.new.html index.html >nul
echo index.html replaced

del /f /q styles.OLD.css index.OLD.html 2>nul

echo.
echo === 3. Verify ===
node scripts\verify.js
if errorlevel 1 (echo verify.js FAILED & exit /b 1)

echo.
echo === 4. Commit + push ===
git add -A
git commit -m "v2 homepage: TimPaemi-inspired design (black + multi-color neon, marquee, multi-channel cards)"
git push origin redesign-2026
if errorlevel 1 (echo Push failed & exit /b 1)

echo.
echo ============================================================
echo Pushed. Wait ~60s for Cloudflare.
echo Preview: https://redesign-2026.pattayagym.pages.dev/
echo.
echo You should see:
echo   - Top marquee scrolling
echo   - Big "PATTAYA.GYM" hero with cyan dot block
echo   - Multi-color declaration headlines
echo   - Stats grid (158+ / 6 / 100% / WEEKLY / FREE / INDIE / AGENCY / ZERO)
echo   - 8 numbered cards (THE LONG GAME pattern)
echo   - Dark live card with red glow
echo   - Sports/areas as numbered cards
echo   - Project cards (Pattaya Authority, Restaurant Guide, Gym, Visa Help)
echo   - 4 colored channel cards
echo   - Big final declaration
echo   - Bottom marquee scrolling
echo   - Footer with 4 columns
echo.
echo Subpages will still look broken — that's round 2.
echo ============================================================
