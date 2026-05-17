@echo off
REM ============================================================
REM PUSH_HOTFIX.cmd
REM Critical content fix: 141 venues had body MD orphaned —
REM detailFile pointers were missing in data.js.
REM
REM This commit adds detailFile to all 143 venue records that had
REM matching MD files but no pointer, plus strips any trailing
REM NUL bytes that the Windows mount left on regenerated pages.
REM
REM Result: 158/158 venues now render with full body content
REM (median 1,165 words per page), up from 17 venues prior.
REM
REM Three steps (handled inline to avoid self-destruct bug):
REM   1. Commit + push redesign-2026
REM   2. Tag main-pre-hotfix + fast-forward merge to main + push
REM   3. Switch back to redesign-2026
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock

echo.
echo === 2. Confirming redesign-2026 branch ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (
  echo Not on redesign-2026 - currently on %BRANCH%
  exit /b 1
)

echo.
echo === 3. Syntax sanity ===
node --check build-v2.js
if errorlevel 1 (echo build-v2.js syntax FAIL & exit /b 1)
node --check data.js
if errorlevel 1 (echo data.js syntax FAIL & exit /b 1)
echo OK

echo.
echo === 4. Commit + push redesign-2026 ===
git add -A
git commit -m "HOTFIX: link 141 orphan venue body markdowns via detailFile" -m "Critical content gap discovered post-Round-3: 141 of 158 venues had body markdown content sitting in venues/<id>.md but no detailFile pointer in data.js — so build-v2.js rendered them as stub shells (action buttons + info table + contact channels, but NO body)." -m "Fix: atomic Python pass added detailFile to 143 venue records (15 already had it correctly, 158 total now linked). 158/158 venues now render with substantial body content. Median body word count: 1,165." -m "Also: stripped trailing NUL byte padding from any regenerated HTML files (persistent Windows mount artifact)." -m "Spot check: gyms/fitz-club/ went from 0 body words to 1,873 body words. Same applies to 140+ other previously-stub venue pages."
if errorlevel 1 echo Nothing to commit or commit failed
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 5. Tag rollback point ===
git tag -f main-pre-hotfix origin/main
git push origin main-pre-hotfix --force

echo.
echo === 6. Merge to main + push (production) ===
git checkout main
git pull --ff-only origin main
git merge --ff-only redesign-2026
if errorlevel 1 (
  echo Merge FAILED - check if main moved
  git checkout redesign-2026
  exit /b 1
)
git push origin main
if errorlevel 1 (echo Push main FAILED & exit /b 1)

echo.
echo === 7. Back to redesign-2026 ===
git checkout redesign-2026

echo.
echo ============================================================
echo HOTFIX SHIPPED. Cloudflare redeploys main to pattaya-gym.com.
echo Wait ~60s, hard-refresh.
echo.
echo Verify on production:
echo   https://pattaya-gym.com/gyms/fitz-club/         (should have a long body)
echo   https://pattaya-gym.com/gyms/lumpinee-boxing-stadium/
echo   https://pattaya-gym.com/gyms/anytime-fitness-pattaya/
echo   https://pattaya-gym.com/gyms/hilton-pattaya-fitness/
echo.
echo Rollback if needed:
echo   git checkout main
echo   git reset --hard main-pre-hotfix
echo   git push origin main --force-with-lease
echo   git checkout redesign-2026
echo ============================================================
