@echo off
REM ============================================================
REM PUSH_ROUND3.cmd
REM Ships Round 3 audit fixes to redesign-2026 + production main.
REM
REM Fixes shipped this round:
REM   P0-1: 8 malformed tel: links sanitized via new phoneToTel() in build-v2.js
REM         (fitz-club, petchrungruang-gym, tara-tennis-club + schema.telephone)
REM   P1-2: sitemap.xml now lists 211 URLs (was 185) - added 17 guides,
REM         6 tool pages, /add-your-gym/, /colophon/, /press/, /pattaya-sport-stats/
REM   P1-3: Fairtex-style multi-session hours now parse fully (Mon-Sat 07:30-10:30
REM         AND Mon-Sat 15:30-18:30) - parser splits on & and propagates day-range
REM   P1-4: Titles shortened across page types (138/158 venues now in 20-65 char range,
REM         15/15 categories, 6/6 areas)
REM   P1-5: Footer v404 + progress-bar + back-to-top on all 212 pages (was 187 + 25 gaps)
REM   P1-6: Footer h4 -> div.footer-col-h (semantic hierarchy fix on 211 pages);
REM         back-to-top button: removed inline onclick, added type="button",
REM         click handler moved into existing CSP-hashed script
REM   P1-7: rel="noopener" -> rel="noopener noreferrer" sitewide (28+ instances)
REM   P2-1: 5 broken YAML venue frontmatters fixed (koh-larn, laem-chabang,
REM         pattaya-marathon, phoenix-gold-golf, planet-football)
REM   P2-4: --hint: #555 -> #888 (WCAG AA contrast pass)
REM   P2-5: .nav-cta min-height: 44px (mobile tap target)
REM   Plus: 24 legacy pages re-migrated with new footer + progress-bar + back-to-top
REM
REM NOT in this round (deferred):
REM   - Restoring JS on /search/, /map/, /compare/, etc. (P0-2) - still empty shells
REM   - FAQPage JSON-LD on venues (P1-3 partial) - hours done, FAQ not
REM   - geo coordinates on venues (P1-3 partial) - no source data
REM   - Cloudflare Email Obfuscation (P1-1) - manual Cloudflare setting
REM   - HTTP -> HTTPS external venue URLs (P2-7) - editorial pass
REM
REM Three steps:
REM   1. Commit + push redesign-2026
REM   2. Fast-forward merge to main + push (deploys to pattaya-gym.com)
REM   3. Switch back to redesign-2026
REM
REM IMPORTANT: this script avoids the self-destruct bug from GO_LIVE.cmd
REM by doing the entire main merge BEFORE switching branches at the end.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Clearing stale git index lock ===
if exist .git\index.lock (
  del /f /q .git\index.lock
  echo Removed stale .git\index.lock
) else (
  echo No stale lock
)

echo.
echo === 2. Confirming branch is redesign-2026 ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (
  echo Not on redesign-2026 - currently on %BRANCH%
  echo Run: git checkout redesign-2026
  exit /b 1
)
echo On %BRANCH%

echo.
echo === 3. Sanity checks ===
node --check build-v2.js
if errorlevel 1 (echo build-v2.js syntax FAIL - aborting & exit /b 1)
node --check data.js
if errorlevel 1 (echo data.js syntax FAIL - aborting & exit /b 1)
echo OK

echo.
echo === 4. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 3 audit fixes: P0/P1/P2 batch (Codex post-live audit)" -m "P0-1: sanitize malformed tel: links via phoneToTel() helper - fixes fitz-club, petchrungruang, tara-tennis-club + schema.telephone" -m "P1-2: sitemap.xml +26 URLs (17 guides, 6 tool pages, add-your-gym, colophon, press, pattaya-sport-stats) - now 211 URLs total" -m "P1-3 partial: parseHoursSpec handles multi-session via & continuation - Fairtex now correctly emits both 07:30-10:30 and 15:30-18:30 ranges" -m "P1-4: titles shortened - 138/158 venues + 15/15 cats + 6/6 areas in 20-65 char range" -m "P1-5: footer v404 + progress-bar + back-to-top on all 212 pages" -m "P1-6: footer h4 -> div.footer-col-h (hierarchy); back-to-top type=button; inline onclick removed" -m "P1-7: rel=noopener -> noopener noreferrer site-wide (28+ instances)" -m "P2-1: 5 broken YAML frontmatters fixed (now pass strict PyYAML)" -m "P2-4: --hint #555 -> #888 (WCAG AA contrast)" -m "P2-5: .nav-cta min-height: 44px tap target" -m "24 legacy pages re-migrated with new chrome"
if errorlevel 1 (
  echo Nothing to commit or commit failed - check git status
)
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)
echo Preview redeploys at https://redesign-2026.pattayagym.pages.dev/

echo.
echo === 5. Update rollback tag to current production ===
git tag -f main-pre-round3-rollback origin/main
git push origin main-pre-round3-rollback --force
if errorlevel 1 (echo WARN: rollback tag push failed - continuing)

echo.
echo === 6. Fast-forward merge redesign-2026 to main + push ===
git checkout main
if errorlevel 1 (echo checkout main FAILED & exit /b 1)
git pull --ff-only origin main
git merge --ff-only redesign-2026
if errorlevel 1 (echo Merge FAILED - branches diverged & git checkout redesign-2026 & exit /b 1)
git push origin main
if errorlevel 1 (echo Push main FAILED & exit /b 1)
echo Production redeploys at https://pattaya-gym.com/

echo.
echo === 7. Switch back to redesign-2026 ===
git checkout redesign-2026

echo.
echo ============================================================
echo Round 3 SHIPPED.
echo.
echo Wait ~60s for Cloudflare, then hard-refresh:
echo   https://pattaya-gym.com/
echo   https://pattaya-gym.com/gyms/fitz-club/        (check tel: link)
echo   https://pattaya-gym.com/gyms/fairtex-pattaya/  (check 2 hours sessions)
echo   https://pattaya-gym.com/sitemap.xml            (should be 211 URLs)
echo.
echo ROLLBACK to pre-Round-3 production (if needed):
echo   git checkout main
echo   git reset --hard main-pre-round3-rollback
echo   git push origin main --force-with-lease
echo   git checkout redesign-2026
echo.
echo Still deferred for next rounds:
echo   - Restore JS on /search/, /map/, /compare/, etc. (Round 4 - tool repair)
echo   - FAQPage JSON-LD detection from venue MD bodies
echo   - Disable Cloudflare Email Obfuscation in Cloudflare dashboard
echo   - HTTP -> HTTPS external venue URLs (editorial pass)
echo   - Lighthouse / Core Web Vitals deep-dive (Round 5)
echo ============================================================
