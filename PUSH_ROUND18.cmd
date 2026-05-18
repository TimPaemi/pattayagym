@echo off
REM ============================================================
REM PUSH_ROUND18.cmd
REM
REM Round 18 — Self-hosted fonts + inline-style reduction.
REM
REM Two engineering wins from the Round 17 Codex audit backlog:
REM
REM   F14.1  Google Fonts removed from every page. Self-hosted
REM          Space Grotesk (variable), Inter (400/500/600/700),
REM          JetBrains Mono (500/600/700) in /fonts/ with
REM          font-display: swap. CSP no longer allowlists
REM          fonts.googleapis.com or fonts.gstatic.com.
REM
REM   F10.1  Inline style="..." count dropped 11,212 -> 4,905 (-56%)
REM          by adding 30+ utility classes for the most-repeated
REM          patterns. Foundation for a future strict CSP round
REM          (style-src without 'unsafe-inline').
REM
REM Privacy page updated to drop "may self-host in future" caveat.
REM New /fonts/* immutable cache rule in _headers.
REM
REM Asset version 413 -> 414.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock
for %%F in (30 Venue af-academy-pattaya git kids-youth main) do (
  if exist "%%F" del /f /q "%%F"
)
if exist "kids-youth)" del /f /q "kids-youth)"
if exist push-output.txt del /f /q push-output.txt
if exist .wrangler rmdir /s /q .wrangler
REM Round 18 — clean up the static-weight Space Grotesk files we replaced
REM with the variable font (sandbox couldn't delete them on the Windows mount)
if exist fonts\space-grotesk-500.woff2 del /f /q fonts\space-grotesk-500.woff2
if exist fonts\space-grotesk-600.woff2 del /f /q fonts\space-grotesk-600.woff2
if exist fonts\space-grotesk-700.woff2 del /f /q fonts\space-grotesk-700.woff2

echo.
echo === 2. Branch check ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (echo Not on redesign-2026 ^(on %BRANCH%^) & exit /b 1)

echo.
echo === 3. Syntax check ===
node --check build-v2.js || (echo build-v2.js syntax FAIL & exit /b 1)
node --check data.js || (echo data.js syntax FAIL & exit /b 1)
node --check scripts\build-compare-page.js || (echo build-compare-page.js syntax FAIL & exit /b 1)
node --check scripts\rebuild-tool-stubs.js || (echo rebuild-tool-stubs.js syntax FAIL & exit /b 1)
node --check scripts\write-changelog.js || (echo write-changelog.js syntax FAIL & exit /b 1)
node --check scripts\verify-deploy.js || (echo verify-deploy.js syntax FAIL & exit /b 1)

echo.
echo === 4. npm install (markdown-it + @fontsource packages) ===
call npm install --silent
if errorlevel 1 (echo npm install FAIL & exit /b 1)

echo.
echo === 5. Build-v2 (158 venues + 15 cats + 6 areas + 9 utility) ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 6. Rebuild tool stubs ===
node scripts\rebuild-tool-stubs.js
if errorlevel 1 (echo rebuild-tool-stubs.js FAIL & exit /b 1)

echo.
echo === 7. Real /compare/ page ===
node scripts\build-compare-page.js
if errorlevel 1 (echo build-compare-page.js FAIL & exit /b 1)

echo.
echo === 8. /status.json + changelog refresh ===
node scripts\write-status-json.js
node scripts\write-changelog.js

echo.
echo === 9. Helper scripts ===
node scripts\inject-guide-schema.js
node scripts\bump-legacy-assets.js
node scripts\sync-csp-hashes.js

echo.
echo === 10. Pre-push verify ===
node scripts\verify-deploy.js
if errorlevel 1 (echo VERIFY FAILED & exit /b 1)

echo.
echo === 11. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 18: self-hosted fonts + 56%% inline-style reduction" -m "F14.1 - Google Fonts replaced by self-hosted Space Grotesk (variable), Inter (400/500/600/700), JetBrains Mono (500/600/700) in /fonts/ with font-display: swap. fonts.googleapis.com and fonts.gstatic.com removed from CSP." -m "F10.1 - Inline style attribute count cut from 11,212 to 4,905 (-56%%) by adding 30+ utility classes for the most-repeated patterns. Builds the foundation for a future strict CSP round without 'unsafe-inline' on style-src." -m "Privacy page caveat dropped. /fonts/* immutable cache rule added to _headers. Asset version 413 -> 414."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 12. Tag rollback + refspec push to main ===
git tag -f main-pre-round18 origin/main
git push origin main-pre-round18 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 13. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 18 SHIPPED.
echo.
echo CHECK:
echo   DevTools Network tab on https://pattaya-gym.com/
echo   Should NOT contact fonts.googleapis.com or fonts.gstatic.com
echo   Should fetch /fonts/inter-400.woff2 and /fonts/space-grotesk.woff2
echo.
echo Rollback: git push origin main-pre-round18:main --force-with-lease
echo ============================================================
