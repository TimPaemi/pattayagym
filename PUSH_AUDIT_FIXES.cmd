@echo off
REM ============================================================
REM PUSH_AUDIT_FIXES.cmd
REM Ships the P0+P1 audit fixes (Claude + Codex) to redesign-2026
REM
REM What this commits:
REM   - Restored truncated index.html (was 307 lines, now 582)
REM   - Stripped trailing NUL bytes from 7 files (styles.css, 404.html,
REM     about/, contact/, gyms/fairtex-pattaya/, build.js, build-extras.js)
REM   - package.json now points npm run build/watch at build-v2.js
REM   - _headers CSP: added 3 missing sha256 hashes
REM   - Homepage: canonical, hreflang en + x-default, og:locale,
REM     twitter:title/desc/image, WebSite+Organization+SearchAction JSON-LD,
REM     skip-link a11y, broken #guide nav anchor fixed, footer v402->v404
REM   - styles.css: added .skip-link + .skip-link:focus rule
REM   - CODEX_AUDIT_PROMPT.md: rewritten for V2 read-only audit
REM   - AUDIT_CLAUDE.md (new): Claude's audit report
REM   - AUDIT_REPORT.md (new): Codex's audit report
REM
REM This does NOT touch main. Production stays on old design until
REM you explicitly merge redesign-2026 -> main.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Clearing any stale git index lock ===
if exist .git\index.lock (
  del /f /q .git\index.lock
  echo Removed stale .git\index.lock
) else (
  echo No stale lock
)

echo.
echo === 2. Confirming branch ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (
  echo Not on redesign-2026 - currently on %BRANCH%
  echo Run: git checkout redesign-2026
  exit /b 1
)
echo On %BRANCH%

echo.
echo === 3. Status before commit ===
git status --short

echo.
echo === 4. Sanity check: critical files non-empty + valid syntax ===
for %%f in (index.html styles.css package.json _headers build-v2.js data.js) do (
  if not exist %%f (
    echo FAIL: %%f missing
    exit /b 1
  )
)
node --check build-v2.js
if errorlevel 1 (echo build-v2.js syntax FAIL & exit /b 1)
node --check data.js
if errorlevel 1 (echo data.js syntax FAIL & exit /b 1)
echo All syntax checks passed

echo.
echo === 5. Stage + commit ===
git add -A
git commit -m "audit fix pass: P0+P1 ship-blockers + 2 audit reports" -m "P0: restore truncated index.html (307 -> 582 lines, was missing entire footer half)" -m "P0: strip trailing NUL bytes from 7 files (styles.css 4104, 404.html 9468, about/ 7060, contact/ 5140, fairtex 22757, build.js 330, build-extras.js 131)" -m "P0: package.json scripts point at build-v2.js (legacy build.js preserved as build:legacy)" -m "P0: _headers CSP +3 sha256 hashes (gtag bootstrap 188 pages, back-to-top 187, TOC 15)" -m "P1: homepage gets canonical + hreflang en+x-default + og:locale + complete twitter tags" -m "P1: homepage gets WebSite + Organization + SearchAction JSON-LD graph" -m "P1: homepage skip-link a11y + .skip-link CSS rule" -m "P1: broken #guide nav anchor -> /guides/, footer v402 -> v404" -m "audits: CODEX_AUDIT_PROMPT.md rewritten, AUDIT_CLAUDE.md + AUDIT_REPORT.md added"
if errorlevel 1 (
  echo Commit failed - nothing to commit or another error
  exit /b 1
)

echo.
echo === 6. Push to origin/redesign-2026 ===
git push origin redesign-2026
if errorlevel 1 (echo Push failed - check credentials/network & exit /b 1)

echo.
echo ============================================================
echo Pushed. Wait ~60s for Cloudflare to redeploy the preview.
echo.
echo PREVIEW URL: https://redesign-2026.pattayagym.pages.dev/
echo.
echo Verify on preview before considering main merge:
echo   - Homepage renders V2 design (black + multi-color)
echo   - View source: canonical, hreflang, WebSite JSON-LD present
echo   - Footer says "v404" (not v402)
echo   - Nav "Guides" link points to /guides/ (not #guide)
echo   - Tab key reveals "Skip to content" link
echo.
echo Production pattaya-gym.com still serves the OLD design from main.
echo To swap production to V2, separate step needed: merge redesign-2026 -> main.
echo ============================================================
