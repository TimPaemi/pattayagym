@echo off
REM ============================================================
REM PUSH_ROUND24.cmd
REM
REM Round 24 - Category FAQs: answer-engine-ready content.
REM
REM Extended every sport category page with a hand-authored FAQ
REM section and FAQPage structured data. Category pages are where
REM head-term search intent lands ("muay thai pattaya"), and a
REM structured FAQ is the single most effective format for being
REM quoted by AI answer engines (ChatGPT, Claude, Perplexity).
REM
REM   - New data/category-faqs.js: ~50 hand-authored, genuinely
REM     useful Q&A pairs across all 15 sport categories.
REM   - Each category page renders an accessible FAQ accordion
REM     (native <details>, no JavaScript) and emits FAQPage
REM     JSON-LD - eligible for FAQ rich results, easy for AI
REM     crawlers to extract and cite.
REM   - Honest content: no fabricated prices; answers point to
REM     venue pages and the Plan My Trip tool for specifics.
REM   - New .faq-list / .faq-item dark-theme CSS.
REM
REM Verified: 45 JSON-LD blocks valid, 15/15 category pages carry
REM a FAQPage block, deploy gate clean.
REM
REM Asset version 419 -> 420.
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
git commit -m "Round 24: category-page FAQs + FAQPage schema (answer-engine optimisation)" -m "Extended every sport category page with a hand-authored FAQ section and FAQPage structured data. Category pages are where head-term search intent lands ('muay thai pattaya'); a structured FAQ is the single most effective format for being quoted by AI answer engines (ChatGPT, Claude, Perplexity)." -m "New data/category-faqs.js: ~50 hand-authored, genuinely useful Q&A pairs across all 15 sport categories - cost, beginners, booking, seasons, areas and category-specific questions. Each category page renders an accessible FAQ accordion (native <details>, no JavaScript) and emits FAQPage JSON-LD - eligible for FAQ rich results and easy for AI crawlers to extract. Honest content: no fabricated prices; answers point to venue pages and the Plan My Trip tool. New .faq-list / .faq-item dark-theme CSS." -m "Verified: 45 JSON-LD blocks valid, 15/15 category pages carry a FAQPage block. Asset version 419 -> 420."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 13. Tag rollback + refspec push to main ===
git tag -f main-pre-round24 origin/main
git push origin main-pre-round24 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 14. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 24 SHIPPED.
echo.
echo   FAQ content:  ~50 Q&A across all 15 category pages
echo   Schema:       15/15 category pages emit FAQPage JSON-LD
echo   Built for:    Google FAQ rich results + AI answer engines
echo   Asset version: 419 -^> 420
echo.
echo Rollback: git push origin main-pre-round24:main --force-with-lease
echo ============================================================
