@echo off
REM ============================================================
REM PUSH_ROUND12.cmd
REM
REM Trust + community + operational sustainability pass.
REM
REM What ships:
REM   1. Per-venue "Sources we checked" block — renders the YAML sources
REM      list from venues/<id>.md frontmatter. Big E-E-A-T trust signal.
REM   2. Per-venue "Spot an error?" / Suggest update link with mailto:
REM      pre-filled with venue ID + body template. Community accountability.
REM   3. "★ Editor's Pick" badge for venues with featured:true in data.js.
REM      Visible ranking signal; flag already existed but wasn't shown.
REM   4. "// You also viewed" recently-viewed strip at bottom of venue pages.
REM      localStorage-based (no server). UX retention for tourists comparing
REM      multiple venues.
REM   5. NEW: /status.json — public machine-readable health endpoint.
REM      Schema completeness, freshness, version, endpoints. Trust signal
REM      for AI crawlers + auditors. Updated on every build.
REM   6. NEW: scripts/ping-sitemap.js — auto-pings Google + Bing webmaster
REM      sitemap-ping URLs on each push. Speeds up crawl discovery.
REM   7. NEW: scripts/stale-venues.js — outputs prioritized list of venues
REM      with verified date > 30 days old. Editorial workflow tool.
REM   8. Asset version bumped 407 -> 408.
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
node --check scripts\write-status-json.js || (echo write-status-json syntax FAIL & exit /b 1)
node --check scripts\ping-sitemap.js || (echo ping-sitemap syntax FAIL & exit /b 1)
node --check scripts\stale-venues.js || (echo stale-venues syntax FAIL & exit /b 1)
node --check scripts\sync-csp-hashes.js || (echo sync-csp-hashes syntax FAIL & exit /b 1)

echo.
echo === 4. Build-v2 (sources block, editors-pick, report-info, recently-viewed) ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 5. Generate /status.json ===
node scripts\write-status-json.js
if errorlevel 1 (echo write-status-json FAIL & exit /b 1)

echo.
echo === 6. Update changelog ===
node scripts\write-changelog.js
if errorlevel 1 (echo write-changelog FAIL & exit /b 1)

echo.
echo === 7. Tool stubs ===
node scripts\rebuild-tool-stubs.js
if errorlevel 1 (echo rebuild-tool-stubs FAIL & exit /b 1)

echo.
echo === 8. Guide schema + bylines ===
node scripts\inject-guide-schema.js
if errorlevel 1 (echo inject-guide-schema FAIL & exit /b 1)

echo.
echo === 9. Sync legacy pages to v408 ===
node scripts\bump-legacy-assets.js
if errorlevel 1 (echo bump-legacy-assets FAIL & exit /b 1)

echo.
echo === 10. Auto-sync CSP hashes ===
node scripts\sync-csp-hashes.js
if errorlevel 1 (echo sync-csp-hashes FAIL & exit /b 1)

echo.
echo === 11. Pre-push verify ===
node scripts\verify-deploy.js
if errorlevel 1 (echo VERIFY FAILED & exit /b 1)

echo.
echo === 12. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 12: sources block + report-info + editors-pick + recently-viewed + /status.json + sitemap pinger + stale-detect" -m "Per-venue body now ends with 'Sources we checked' block (rendered from YAML sources list in venues/*.md frontmatter — was previously buried) + 'Spot an error?' suggest-update link with mailto pre-fill. E-E-A-T + community accountability." -m "Trust bar now includes '★ Editor's Pick' badge for venues with featured:true in data.js. Flag already existed; finally surfaced." -m "Recently-viewed strip ('// You also viewed') at the bottom of every venue page. localStorage-only, no server. Top 8 recently-viewed venues persisted; current page filtered out. UX retention for tourists comparing 3-5 venues." -m "NEW: /status.json — public machine-readable site-health endpoint. Includes catalog counts, schema completeness percentages, freshness metrics, every public API endpoint URL, editorial policy commitments. Updated on every build. AI-crawler + auditor friendly." -m "NEW: scripts/ping-sitemap.js — auto-pings Google + Bing webmaster sitemap-ping URLs after each push. Non-blocking on network errors. Speeds up Google crawl discovery of new pages." -m "NEW: scripts/stale-venues.js — outputs prioritized list of venues with verified date older than 30 days. Editorial workflow tool for refresh sprints. CSV mode for spreadsheet workflow." -m "Asset version bumped 407 -> 408. CSP hashes auto-synced via sync-csp-hashes.js (no manual updates needed when inline scripts change)."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 13. Tag rollback + refspec push to main ===
git tag -f main-pre-round12 origin/main
git push origin main-pre-round12 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 14. Ping search engines that the sitemap changed ===
node scripts\ping-sitemap.js
REM Non-blocking — even if this fails, the deploy already shipped

echo.
echo ============================================================
echo Round 12 SHIPPED.
echo.
echo VERIFY:
echo   https://pattaya-gym.com/gyms/fairtex-pattaya/  (Sources block, Editor's Pick, Report-info, recently-viewed)
echo   https://pattaya-gym.com/status.json            (NEW public status endpoint)
echo   https://pattaya-gym.com/changelog/             (now includes Round 12)
echo.
echo EDITORIAL TOOL:
echo   node scripts\stale-venues.js                   (shows venues with verified > 30 days)
echo   node scripts\stale-venues.js --csv ^> stale.csv (spreadsheet-friendly output)
echo.
echo Rollback: git push origin main-pre-round12:main --force-with-lease
echo ============================================================
