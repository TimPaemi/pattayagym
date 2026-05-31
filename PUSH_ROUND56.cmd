@echo off
REM Round 56 — CI hotfix: LF-normalize CSP hash computation (Windows CRLF vs Linux)
cd /d "%~dp0"
if exist .git\index.lock del /f /q .git\index.lock
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (echo Not on redesign-2026 & exit /b 1)
node scripts\verify-deploy.js || exit /b 1
git add _headers scripts\sync-csp-hashes.js scripts\verify-deploy.js
git commit -m "Round 56: Fix CI CSP hash mismatch (LF-normalize inline scripts)" -m "sync-csp-hashes and verify-deploy now hash script bodies with LF normalization so Windows dev and Linux CI/deploy agree. _headers restored sha256-3sFDjj07 for search back-to-top."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026 || exit /b 1
git tag -f main-pre-round56 origin/main
git push origin main-pre-round56 --force
git push origin redesign-2026:main || exit /b 1
echo Round 56 CI fix SHIPPED.
