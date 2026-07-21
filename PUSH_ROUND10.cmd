@echo off
REM ============================================================
REM PUSH_ROUND10.cmd
REM
REM Ships 3 new long-tail guide pages (autonomous editorial round):
REM
REM   /guides/english-speaking-muay-thai-pattaya/
REM     Target query: "english speaking muay thai pattaya"
REM     10 venues listed, FAQ section, internal links across the directory
REM
REM   /guides/muay-thai-camps-with-accommodation-pattaya/
REM     Target query: "muay thai camp accommodation pattaya"
REM     8 stay-and-train camps with pricing tiers and what's included
REM
REM   /guides/gym-day-pass-pattaya/
REM     Target query: "gym day pass pattaya", "drop-in gym pattaya"
REM     12 gyms accepting walk-in day passes with prices
REM
REM Each guide auto-gets:
REM   - V2 chrome (head/marquee/nav/breadcrumb/footer/back-to-top)
REM   - CollectionPage + BreadcrumbList JSON-LD baked in
REM   - Article schema injected by scripts/inject-guide-schema.js
REM   - FAQPage schema where Q/A pattern detected (all 3 have FAQ sections)
REM   - Sitemap inclusion via build-v2.js GUIDE_SLUGS update
REM
REM Steps:
REM   1. Cleanup + branch check
REM   2. node --check syntax
REM   3. Write the 3 new guides (write-new-guides.js)
REM   4. node build-v2.js (regenerate sitemap with new guide URLs)
REM   5. Run helper scripts (tool stubs, schema injection, legacy bump)
REM   6. node scripts/verify-deploy.js (hard gate)
REM   7. Commit + push redesign-2026
REM   8. Refspec push to main
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock

echo.
echo === 2. Branch check ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (echo Not on redesign-2026 ^(on %BRANCH%^) & exit /b 1)

echo.
echo === 3. Syntax check ===
node --check build-v2.js || (echo build-v2.js syntax FAIL & exit /b 1)
node --check data.js || (echo data.js syntax FAIL & exit /b 1)
node --check scripts\write-new-guides.js || (echo write-new-guides.js syntax FAIL & exit /b 1)

echo.
echo === 4. Write 3 new guides ===
node scripts\write-new-guides.js
if errorlevel 1 (echo write-new-guides FAIL & exit /b 1)

echo.
echo === 5. Build-v2 (sitemap picks up new guide URLs) ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 6. Tool stubs ===
node scripts\rebuild-tool-stubs.js
if errorlevel 1 (echo rebuild-tool-stubs FAIL & exit /b 1)

echo.
echo === 7. Guide schema (adds Article + FAQPage to new guides) ===
node scripts\inject-guide-schema.js
if errorlevel 1 (echo inject-guide-schema FAIL & exit /b 1)

echo.
echo === 8. Legacy asset sync ===
node scripts\bump-legacy-assets.js
if errorlevel 1 (echo bump-legacy-assets FAIL & exit /b 1)

echo.
echo === 9. Pre-push verify ===
node scripts\verify-deploy.js
if errorlevel 1 (
  echo VERIFY FAILED - inspect output above
  exit /b 1
)

echo.
echo === 10. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 10: 3 new long-tail guides (autonomous editorial)" -m "Codex Nuclear V3 Section L flagged ~50+ keyword opportunity combinations. These 3 are the highest-intent ones not previously covered: english-speaking-muay-thai-pattaya, muay-thai-camps-with-accommodation-pattaya, gym-day-pass-pattaya." -m "Each guide: ~1500-2000 words substantive editorial, V2 chrome, 8-12 internal links to specific Pattaya.Gym venues by name, 6-7 Q/A pairs that auto-trigger FAQPage schema, plus Article schema via inject-guide-schema.js. Sitemap auto-includes them." -m "Adds ~5000 words of fresh editorial content + 3 new ranking surfaces for high-commercial-intent queries that the existing 17 guides didn't target."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 11. Tag rollback + refspec push to main ===
git tag -f main-pre-round10 origin/main
git push origin main-pre-round10 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo ============================================================
echo Round 10 SHIPPED.
echo.
echo 3 NEW GUIDES LIVE:
echo   https://pattaya-gym.com/guides/english-speaking-muay-thai-pattaya/
echo   https://pattaya-gym.com/guides/muay-thai-camps-with-accommodation-pattaya/
echo   https://pattaya-gym.com/guides/gym-day-pass-pattaya/
echo.
echo Each has Article + FAQPage schema. Each links to 8-12 venue pages.
echo Sitemap now has 3 additional URLs for Google to crawl.
echo.
echo Rollback: git push origin main-pre-round10:main --force-with-lease
echo ============================================================
