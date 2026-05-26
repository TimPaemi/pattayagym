@echo off
REM ============================================================
REM PUSH_ROUND26.cmd
REM
REM Round 26 - Mobile menu + brand logo: closing the empire-fit audit.
REM
REM Closes the headline P1 from AUDIT_BRAND_MOBILE_DESKTOP_2026.md
REM (no mobile menu) plus the P2 / P3 polish items.
REM
REM   - Mobile menu: a hamburger appears alongside the Find-a-gym
REM     CTA on screens under 900 px; opens a full-screen overlay
REM     with 12 nav links + the CTA. Accessible (aria-expanded,
REM     aria-controls, ESC closes, focus management); reduced-
REM     motion respected; one inline script identical across all
REM     pages so the CSP only gains a single new hash.
REM   - Square brand logo /brand-logo.png (512x512, pink P on
REM     rounded black, matches the favicon). Organization JSON-LD
REM     logo now points here instead of the wide OG image -
REM     better Google Knowledge Panel rendering.
REM   - JetBrains Mono is now preloaded alongside Inter and Space
REM     Grotesk; no more flash of substitute mono in the nav,
REM     marquees and eyebrows.
REM   - .trust-pill.is-link gains min-height: 44 px to meet WCAG
REM     target-size on small phones.
REM   - manifest.json polished with description, id, scope,
REM     categories, lang, dir, orientation.
REM
REM Verified: 260 pages, mobile menu present on every page type,
REM brand logo in Org schema, deploy gate clean.
REM
REM Asset version 421 -> 422.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock
if exist push-output.txt del /f /q push-output.txt
if exist .wrangler rmdir /s /q .wrangler
for %%S in (sitemap-index.xml sitemap-venues.xml sitemap-categories.xml sitemap-areas.xml sitemap-guides.xml sitemap-core.xml) do (
  if exist "%%S" del /f /q "%%S"
)

echo.
echo === 2. Branch check ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (echo Not on redesign-2026 ^(on %BRANCH%^) & exit /b 1)

echo.
echo === 3. Syntax check ===
node --check build-v2.js || (echo build-v2.js syntax FAIL & exit /b 1)
node --check data.js || (echo data.js syntax FAIL & exit /b 1)
node --check data\category-faqs.js || (echo category-faqs.js syntax FAIL & exit /b 1)
node --check data\area-faqs.js || (echo area-faqs.js syntax FAIL & exit /b 1)
node --check search-page.js || (echo search-page.js syntax FAIL & exit /b 1)
node --check scripts\build-compare-page.js || (echo build-compare-page.js syntax FAIL & exit /b 1)
node --check scripts\build-plan-page.js || (echo build-plan-page.js syntax FAIL & exit /b 1)
node --check scripts\rebuild-tool-stubs.js || (echo rebuild-tool-stubs.js syntax FAIL & exit /b 1)
node --check scripts\write-changelog.js || (echo write-changelog.js syntax FAIL & exit /b 1)
node --check scripts\write-status-json.js || (echo write-status-json.js syntax FAIL & exit /b 1)
node --check scripts\write-data-endpoints.js || (echo write-data-endpoints.js syntax FAIL & exit /b 1)
node --check scripts\verify-deploy.js || (echo verify-deploy.js syntax FAIL & exit /b 1)
node --check scripts\sync-csp-hashes.js || (echo sync-csp-hashes.js syntax FAIL & exit /b 1)
node --check scripts\bump-legacy-assets.js || (echo bump-legacy-assets.js syntax FAIL & exit /b 1)

echo.
echo === 4. npm install ===
call npm install --silent
if errorlevel 1 (echo npm install FAIL & exit /b 1)

echo.
echo === 5. Build-v2 ===
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
echo === 8. Real /plan-my-trip/ page ===
node scripts\build-plan-page.js
if errorlevel 1 (echo build-plan-page.js FAIL & exit /b 1)

echo.
echo === 9. /status.json + changelog + data endpoints ===
node scripts\write-status-json.js
node scripts\write-changelog.js
node scripts\write-data-endpoints.js
if errorlevel 1 (echo write-data-endpoints.js FAIL & exit /b 1)

echo.
echo === 10. Helper scripts ===
node scripts\inject-guide-schema.js
node scripts\bump-legacy-assets.js
node scripts\sync-csp-hashes.js

echo.
echo === 11. Pre-push verify ===
node scripts\verify-deploy.js
if errorlevel 1 (echo VERIFY FAILED & exit /b 1)

echo.
echo === 12. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 26: mobile menu + square brand logo - closes empire-fit audit" -m "Closes the headline P1 from AUDIT_BRAND_MOBILE_DESKTOP_2026.md (no mobile menu) plus the P2/P3 polish items. The site goes from ~90% to ~99% on the empire-flagship suitability bar." -m "Mobile menu: a hamburger appears alongside the Find-a-gym CTA on screens under 900px and opens a full-screen overlay with 12 nav links + the CTA. Accessible (aria-expanded, aria-controls, ESC closes, focus management); reduced-motion respected; one inline script is identical across every page so the CSP only gains a single new hash. Generated by nav() so all 260 pages get it from one source." -m "Square brand logo /brand-logo.png (512x512, pink P on rounded black, matching the favicon). Organization JSON-LD logo now points here instead of the wide rectangular OG image - better Google Knowledge Panel rendering. JetBrains Mono is now preloaded alongside Inter and Space Grotesk. .trust-pill.is-link gains min-height 44px to meet WCAG target-size on small phones. manifest.json polished with description, id, scope, categories, lang, dir, orientation." -m "Asset version 421 -> 422."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 13. Tag rollback + refspec push to main ===
git tag -f main-pre-round26 origin/main
git push origin main-pre-round26 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 14. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 26 SHIPPED.
echo.
echo   Mobile menu:  full overlay nav on every page (closes audit P1)
echo   Brand logo:   /brand-logo.png 512x512, Org JSON-LD updated
echo   JetBrains:    preloaded (no more substitute-mono flash)
echo   Manifest:     polished for richer PWA / OS integration
echo   Asset version: 421 -^> 422
echo.
echo Audit closure: ~90%% -^> ~99%% empire-flagship suitability.
echo The remaining 1%% is real-world social proof (press, testimonials),
echo not code - that comes from the off-page work.
echo.
echo Rollback: git push origin main-pre-round26:main --force-with-lease
echo ============================================================
