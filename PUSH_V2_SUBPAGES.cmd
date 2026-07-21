@echo off
REM ============================================================
REM PUSH_V2_SUBPAGES.cmd
REM v2 Round 2: regenerate venue + category + area pages
REM in the new TimPaemi design.
REM
REM Uses build-v2.js (clean consolidated build).
REM Does NOT touch old build.js / build-extras.js / build-discovery.js.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Confirming branch ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (
  echo Not on redesign-2026 — currently on %BRANCH%
  exit /b 1
)
echo On %BRANCH%

echo.
echo === 2. Running new build-v2.js ===
call node build-v2.js
if errorlevel 1 (echo build-v2.js FAILED & exit /b 1)

echo.
echo === 3. Verify ===
node scripts\verify.js
if errorlevel 1 (echo verify.js FAILED & exit /b 1)

echo.
echo === 4. Commit + push ===
git add -A
git commit -m "v2 subpages: regenerate venues + categories + areas in TimPaemi design (build-v2.js) + seamless marquee"
git push origin redesign-2026
if errorlevel 1 (echo Push failed & exit /b 1)

echo.
echo ============================================================
echo Pushed. Wait ~60s for Cloudflare.
echo
echo Pages regenerated:
echo   - 158 venue pages (/gyms/{slug}/)
echo   - 15 category pages (/category/{slug}/)
echo   - 6 area pages (/area/{slug}/)
echo   - sitemap.xml
echo
echo All match the homepage V2 design language.
echo Test URLs:
echo   https://redesign-2026.pattayagym.pages.dev/category/muay-thai/
echo   https://redesign-2026.pattayagym.pages.dev/gyms/fairtex-pattaya/
echo   https://redesign-2026.pattayagym.pages.dev/area/jomtien/
echo ============================================================
