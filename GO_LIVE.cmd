@echo off
REM ============================================================
REM GO_LIVE.cmd
REM Ships V2 redesign to production (pattaya-gym.com).
REM
REM Three steps:
REM   1. Commit + push current working tree to redesign-2026
REM   2. Tag main-pre-v2-rollback (rollback point)
REM   3. Fast-forward merge redesign-2026 -> main + push main
REM
REM Cloudflare Pages auto-deploys main to pattaya-gym.com (~60s).
REM
REM ROLLBACK (if needed):
REM   git checkout main
REM   git reset --hard main-pre-v2-rollback
REM   git push origin main --force-with-lease
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
  echo Aborting. Run: git checkout redesign-2026
  exit /b 1
)
echo On %BRANCH%

echo.
echo === 3. Sanity checks ===
node --check build-v2.js
if errorlevel 1 (echo build-v2.js syntax FAIL - aborting & exit /b 1)
node --check data.js
if errorlevel 1 (echo data.js syntax FAIL - aborting & exit /b 1)
if not exist index.html (echo index.html missing - aborting & exit /b 1)
if not exist styles.css (echo styles.css missing - aborting & exit /b 1)
echo Syntax + critical files OK

echo.
echo === 4. Stage + commit working tree ===
git add -A
git status --short
git commit -m "audit pass + schema-rich rebuild + legacy migration: P0/P1/P1+ fixes" -m "P0: restore truncated index.html (307 -> 582 lines)" -m "P0: strip trailing NUL bytes from 7 files" -m "P0: package.json scripts point at build-v2.js (legacy as build:legacy)" -m "P0: _headers CSP +3 sha256 hashes (188+187+15 pages)" -m "P1: head() rebuild with canonical + hreflang en+x-default + og:locale + og:site_name + complete twitter tags on every generated page" -m "P1: 158/158 venue pages get BreadcrumbList + LocalBusiness with PostalAddress + parsed openingHoursSpecification + areaServed + schema.org subtypes" -m "P1: 15/15 category + 6/6 area pages get BreadcrumbList (areas previously had ZERO JSON-LD)" -m "P1: 8 utility pages get AboutPage/ContactPage/WebPage + BreadcrumbList" -m "P1: skip-link a11y on every generated page + CSS rule" -m "P1: homepage WebSite + Organization + SearchAction JSON-LD" -m "P1: 24 legacy pages migrated to V2 chrome (17 guides + index + 6 tool pages)" -m "site-wide consistency: 0 v=237, 0 sf-builtby, 0 old PATTAYA.GYM wordmark, 422 JSON-LD blocks 0 parse errors" -m "audits: CODEX_AUDIT_PROMPT.md rewritten, AUDIT_CLAUDE.md + AUDIT_REPORT.md added"
if errorlevel 1 (
  echo Nothing to commit OR commit failed
  echo If nothing to commit that's fine - the redesign-2026 branch is already up to date
)

echo.
echo === 5. Push redesign-2026 to GitHub ===
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED - aborting & exit /b 1)
echo Preview will redeploy at https://redesign-2026.pattayagym.pages.dev/

echo.
echo === 6. Tag main-pre-v2-rollback BEFORE touching main ===
git fetch origin main
git tag -f main-pre-v2-rollback origin/main
git push origin main-pre-v2-rollback --force
if errorlevel 1 (
  echo WARN: could not push rollback tag - continuing anyway
) else (
  echo Rollback tag pushed. To revert: git reset --hard main-pre-v2-rollback ^&^& git push origin main --force-with-lease
)

echo.
echo === 7. Switch to main + fast-forward merge redesign-2026 ===
git checkout main
if errorlevel 1 (echo Could not checkout main - aborting & exit /b 1)
git pull --ff-only origin main
if errorlevel 1 (echo Could not fast-forward main from origin - aborting & exit /b 1)
git merge --ff-only redesign-2026
if errorlevel 1 (
  echo Fast-forward merge FAILED - main and redesign-2026 have diverged
  echo Switching back to redesign-2026 - investigate before retrying
  git checkout redesign-2026
  exit /b 1
)
echo Fast-forward merge OK

echo.
echo === 8. Push main to GitHub ===
git push origin main
if errorlevel 1 (echo Push main FAILED & exit /b 1)

echo.
echo === 9. Switch back to redesign-2026 ===
git checkout redesign-2026

echo.
echo ============================================================
echo LIVE.
echo.
echo Cloudflare Pages is now redeploying main to pattaya-gym.com.
echo Wait ~60 seconds, hard-refresh, and verify.
echo.
echo URLs to check:
echo   https://pattaya-gym.com/                  (homepage - V2)
echo   https://pattaya-gym.com/gyms/fairtex-pattaya/   (venue + rich schema)
echo   https://pattaya-gym.com/category/muay-thai/     (category page)
echo   https://pattaya-gym.com/area/jomtien/           (area + new JSON-LD)
echo   https://pattaya-gym.com/guides/best-muay-thai-pattaya/   (legacy guide, now V2-wrapped)
echo.
echo ROLLBACK if anything is broken:
echo   git checkout main
echo   git reset --hard main-pre-v2-rollback
echo   git push origin main --force-with-lease
echo   git checkout redesign-2026
echo.
echo This will revert pattaya-gym.com to the previous design in ~60s.
echo ============================================================
