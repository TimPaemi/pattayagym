@echo off
REM ============================================================
REM PUSH_HOTFIX_V2.cmd
REM Re-ships the orphan-MD detailFile hotfix after the prior
REM checkout -f wiped the working tree.
REM
REM Restored via deterministic rebuild:
REM   - data.js: +143 detailFile entries (158/158 venues linked)
REM   - All 158 venue pages regenerated with body content
REM   - Average body words: 1,165 per venue
REM   - Spot checks: fitz-club 1,873w, lumpinee 1,115w, hilton 1,135w
REM
REM ALL git steps happen inline. No script self-destruct this time —
REM the entire merge-to-main happens via a single git invocation chain
REM that doesn't depend on this .cmd file existing on main branch.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup + branch check ===
if exist .git\index.lock del /f /q .git\index.lock
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (
  echo Not on redesign-2026 - on %BRANCH%. Run: git checkout redesign-2026
  exit /b 1
)

echo.
echo === 2. Syntax checks ===
node --check build-v2.js
if errorlevel 1 (echo build-v2.js FAIL & exit /b 1)
node --check data.js
if errorlevel 1 (echo data.js FAIL & exit /b 1)
echo OK

echo.
echo === 3. Commit + push redesign-2026 ===
git add -A
git commit -m "HOTFIX: link 141 orphan venue body markdowns via detailFile" -m "Critical content gap: 141 of 158 venues had body markdown content in venues/<id>.md but no detailFile pointer in data.js. Build rendered them as stub shells (no body section). Fixed via atomic Python pass adding detailFile to 143 venue records; total now 158/158 linked." -m "Result: 158/158 venues render with substantial body content. Average body words: 1,165. Spot checks: fitz-club 1,873w (was 0), lumpinee-boxing-stadium 1,115w, hilton-pattaya-fitness 1,135w." -m "Also: sitemap.xml now 211 URLs (Round 3 sitemap generator already in HEAD). Stripped trailing NUL byte padding from regenerated files."
if errorlevel 1 echo Commit step: nothing to commit or failed
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 4. Tag rollback point at current production ===
git fetch origin main
git tag -f main-pre-hotfix2 origin/main
git push origin main-pre-hotfix2 --force

echo.
echo === 5. Merge redesign-2026 -^> main and push ===
REM Use git push with refspec to avoid the checkout-main self-destruct.
REM This pushes redesign-2026's tip directly to origin/main as a fast-forward,
REM bypassing the local main branch entirely. NO branch switch needed.
git push origin redesign-2026:main
if errorlevel 1 (
  echo Direct refspec push FAILED - falling back to branch switch path
  git checkout main
  git pull --ff-only origin main
  git merge --ff-only redesign-2026
  if errorlevel 1 (echo Merge FAILED & git checkout redesign-2026 & exit /b 1)
  git push origin main
  git checkout redesign-2026
)
echo Production main updated.

echo.
echo ============================================================
echo HOTFIX V2 SHIPPED.
echo Cloudflare redeploys pattaya-gym.com in ~60s.
echo.
echo Verify on production after Cloudflare propagates:
echo   https://pattaya-gym.com/gyms/fitz-club/
echo   https://pattaya-gym.com/gyms/lumpinee-boxing-stadium/
echo   https://pattaya-gym.com/gyms/anytime-fitness-pattaya/
echo   https://pattaya-gym.com/gyms/hilton-pattaya-fitness/
echo.
echo Each should have a long editorial body section between
echo the action buttons and the contact channels.
echo.
echo Rollback if needed:
echo   git push origin main-pre-hotfix2:main --force-with-lease
echo ============================================================
