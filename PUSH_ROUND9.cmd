@echo off
REM ============================================================
REM PUSH_ROUND9.cmd
REM
REM Codex Nuclear V3 final polish + off-page playbook:
REM
REM   P2-3/P2-4/P2-6 cleanup:
REM     - .gitignore rewritten (UTF-16 corruption stripped, backup
REM       archive patterns added)
REM     - sitemap_index.xml duplicate deleted
REM     - Junk binary files (zirZ3Bwy, zii7NKzl, $null) deleted
REM     - README.md fully rewritten to V2 reality (build-v2.js,
REM       Round 1-8 workflow, deploy + cache behavior, schema map)
REM     - NEW: NEXT_STEPS.md — comprehensive off-page playbook
REM       (GSC, GBP, backlinks, editorial expansion, rank tracking)
REM
REM Steps:
REM   1. Cleanup .git/index.lock + branch check
REM   2. node --check syntax
REM   3. node scripts/repo-cleanup.js (deletes dup sitemap + junk files)
REM   4. node build-v2.js (regenerate everything)
REM   5. node scripts/rebuild-tool-stubs.js
REM   6. node scripts/inject-guide-schema.js
REM   7. node scripts/bump-legacy-assets.js
REM   8. node scripts/verify-deploy.js
REM   9. Commit + push redesign-2026
REM  10. Refspec push to main
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
node --check scripts\repo-cleanup.js || (echo repo-cleanup.js syntax FAIL & exit /b 1)

echo.
echo === 4. Repo cleanup ===
node scripts\repo-cleanup.js
if errorlevel 1 (echo repo-cleanup FAIL & exit /b 1)

echo.
echo === 5. Build-v2 regen ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 6. Tool stubs ===
node scripts\rebuild-tool-stubs.js
if errorlevel 1 (echo rebuild-tool-stubs FAIL & exit /b 1)

echo.
echo === 7. Guide schema ===
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
git commit -m "Round 9: repo hygiene + README V2 + off-page playbook" -m "Codex V3 P2 polish: cleaned .gitignore (stripped UTF-16 garbage tail, added patterns for backup archives, *.zip, *.tar.gz, BACKUP_MANIFEST_*.md, push-output.txt, Cowork mount junk). Deleted duplicate sitemap_index.xml (canonical is sitemap-index.xml; robots.txt references the canonical). Deleted junk binary files (zirZ3Bwy, zii7NKzl, dollar-null) that the mount left behind." -m "README.md completely rewritten to V2 reality. Documents: build-v2.js as canonical generator, the Round 1-9 PUSH script workflow, refspec-push pattern that bypasses the main-checkout self-destruct, Cloudflare cache behavior (must-revalidate not immutable), full schema map (LocalBusiness+subtype, BreadcrumbList, ItemList, Article, FAQPage, WebSite+Organization+SearchAction), CSP guard via verify-deploy.js, file map for new scripts (geocode-venues, rebuild-tool-stubs, inject-guide-schema, bump-legacy-assets, repo-cleanup, verify-deploy)." -m "NEW: NEXT_STEPS.md — the off-page playbook. Tier 1 (this week): Google Search Console submit, Bing Webmaster Tools, Google Business Profile, production verification. Tier 2 (this month): geocoder run, sister-site cross-links, 5-10 quality backlink outreach, 3 high-intent guide expansions, phone completion sprint. Tier 3 (this quarter): real rank tracker, author photos for E-E-A-T, Russian/Thai landing pages. Tier 4: optional polish (PWA, WebP, tool functionality)."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 11. Tag rollback + refspec push to main ===
git tag -f main-pre-round9 origin/main
git push origin main-pre-round9 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo ============================================================
echo Round 9 SHIPPED.
echo.
echo If git status still shows tracked backup archives, run:
echo   git rm --cached pattayagym_*.zip pattayagym_*.tar.gz BACKUP_MANIFEST_*.md .backups\*
echo   git commit -m "Untrack backup archives (.gitignore now covers them)"
echo   git push origin redesign-2026
echo   git push origin redesign-2026:main
echo.
echo READ THIS:
echo   C:\pattayagym\NEXT_STEPS.md
echo.
echo It's the off-page playbook. Tier 1 (GSC + Bing + GBP + verification)
echo is ~30 min total and is the highest-impact thing remaining.
echo.
echo Rollback: git push origin main-pre-round9:main --force-with-lease
echo ============================================================
