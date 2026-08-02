<#
================================================================================
 SHIP-GYM.ps1  -  pattaya-gym.com : one command, build to live.
================================================================================

 RUN IT:
   powershell -NoProfile -ExecutionPolicy Bypass -File C:\Projects\pattayagym\SHIP-GYM.ps1

 WHAT IT DOES, in order:
   1. Sanity      repo, tools, branch, data.js loads, chain manifest loads
   2. Build       every step in scripts/ship-chain.json, in listed order
   3. Gates       every gate in scripts/ship-chain.json
                  ->  if ANY gate fails it STOPS and pushes nothing

 THE CHAIN LIVES IN scripts/ship-chain.json, NOT IN THIS FILE (S2-F1, 2026-07-29).
 It used to be a hardcoded list here and a second, different list in AGENTS.md,
 and a third in .internal-docs/ENRICH-2026-07.md. They disagreed: AGENTS omitted
 normalize-entity-graph.js entirely and ran verify-deploy before the encoding and
 network gates. Add or reorder a step in the JSON, run
 `node scripts/write-ship-chain-doc.js` to refresh the AGENTS.md copy, and
 scripts/verify-ship-chain.js gates the two staying in sync.
   4. Tag         tags the current origin/main so rollback is one command
   5. Push        commits, pushes the branch, fast-forwards main
   6. Notify      sitemap ping + IndexNow (failures here never fail the ship)

 SWITCHES:
   -DryRun      build + gates only, never touches git. Run this first if unsure.
   -NoPush      build, gate, commit locally, do not push.
   -SkipBuild   gates + push only, when you have already built.
   -Message     custom commit message.
   -RepoPath    defaults to the folder this script lives in.

 TWO POWERSHELL TRAPS THIS SCRIPT AVOIDS - both have bitten this repo:

   1. $ErrorActionPreference = 'Stop' does NOT catch a non-zero exit from
      node.exe or git.exe. A naive script sails straight past a failed build and
      pushes broken HTML live. Every command here has its exit code checked.

   2. Worse, 'Stop' plus `2>&1` on a native command DOES throw - the moment npm
      writes a deprecation notice to stderr the whole script dies with a
      NativeCommandError, even though npm succeeded. So stderr is captured with
      the preference temporarily relaxed, and success is judged only by exit
      code. That is why this works where a simpler script kept breaking.

 Compatible with Windows PowerShell 5.1 and PowerShell 7.
================================================================================
#>

[CmdletBinding()]
param(
  [string] $RepoPath  = $PSScriptRoot,
  [string] $Message   = '',
  [string] $Branch    = '',
  [switch] $DryRun,
  [switch] $NoPush,
  [switch] $SkipBuild
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { }

# Transient-lock shim (2026-07-30): scanners/indexers briefly hold freshly built
# files and random writeFileSync calls die with UNKNOWN (errno -4094). Preload a
# retry wrapper into every node child so the chain rides out the lock.
# Best-effort: if anything here misfires, ship WITHOUT the shim rather than stop.
try {
  $shimBase = $RepoPath
  if ([string]::IsNullOrWhiteSpace($shimBase) -and $PSCommandPath) { $shimBase = Split-Path -Parent $PSCommandPath }
  if (-not [string]::IsNullOrWhiteSpace($shimBase)) {
    $shim = Join-Path $shimBase 'scripts\fs-write-retry-shim.cjs'
    if ((Test-Path $shim) -and ($env:NODE_OPTIONS -notmatch 'fs-write-retry-shim')) {
      $env:NODE_OPTIONS = ("$($env:NODE_OPTIONS) --require $shim").Trim()
    }
  }
} catch { }

$script:StepNo    = 0
$script:StartTime = Get-Date

function Write-Head([string] $Text) {
  Write-Host ''
  Write-Host ('=' * 74) -ForegroundColor DarkGray
  Write-Host "  $Text" -ForegroundColor Cyan
  Write-Host ('=' * 74) -ForegroundColor DarkGray
}

function Fail([string] $Text) {
  Write-Host ''
  Write-Host ('!' * 74) -ForegroundColor Red
  Write-Host "  STOPPED: $Text" -ForegroundColor Red
  Write-Host '  Nothing was pushed.' -ForegroundColor Yellow
  Write-Host ('!' * 74) -ForegroundColor Red
  exit 1
}

# Runs a native command and actually checks its exit code.
# NOTE: the parameter is $CmdArgs, never $Args - $Args is a PowerShell automatic
# variable and declaring a parameter with that name breaks the binder outright
# ("Cannot bind argument to parameter 'Args' because it is an empty string").
function Invoke-Step {
  param(
    [Parameter(Mandatory)] [string]   $Label,
    [Parameter(Mandatory)] [string]   $Exe,
    [Parameter(Mandatory)] [string[]] $CmdArgs,
    [switch] $Quiet,
    [switch] $AllowFail
  )

  $script:StepNo++
  Write-Host ("  [{0:d2}] {1,-46}" -f $script:StepNo, $Label) -NoNewline

  # Relax the preference ONLY around the native call - see trap 2 in the header.
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  $out  = & $Exe @CmdArgs 2>&1
  $code = $LASTEXITCODE
  $ErrorActionPreference = $prev

  if ($null -eq $code) { $code = 0 }

  if ($code -ne 0 -and -not $AllowFail) {
    Write-Host '  FAILED' -ForegroundColor Red
    Write-Host ''
    Write-Host "  exit code $code from: $Exe $($CmdArgs -join ' ')" -ForegroundColor Red
    Write-Host '  ---------------------------------------------------------------' -ForegroundColor DarkGray
    foreach ($line in $out) { Write-Host "  $line" }
    Write-Host '  ---------------------------------------------------------------' -ForegroundColor DarkGray
    Fail "$Label failed."
  }

  if ($code -ne 0) {
    Write-Host '  skipped' -ForegroundColor Yellow
    return
  }

  Write-Host '  ok' -ForegroundColor Green
  if (-not $Quiet) {
    $lines = @($out | ForEach-Object { "$_" } | Where-Object { $_.Trim() -ne '' })
    if ($lines.Count -gt 0) {
      $t = $lines[$lines.Count - 1].Trim()
      if ($t.Length -gt 70) { $t = $t.Substring(0, 67) + '...' }
      Write-Host ("       -> {0}" -f $t) -ForegroundColor DarkGray
    }
  }
}

function Invoke-Node([string] $Label, [string] $ScriptFile) {
  Invoke-Step -Label $Label -Exe 'node' -CmdArgs @($ScriptFile)
}

# =============================================================================
#  1. SANITY
# =============================================================================
Write-Head 'PATTAYA.GYM - SHIP'

if ([string]::IsNullOrWhiteSpace($RepoPath)) { $RepoPath = 'C:\Projects\pattayagym' }
if (-not (Test-Path (Join-Path $RepoPath 'build-v2.js'))) {
  Fail "No build-v2.js in '$RepoPath'. Pass -RepoPath C:\Projects\pattayagym"
}
Set-Location $RepoPath
Write-Host "  repo      $RepoPath"

foreach ($tool in @('node', 'git')) {
  if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { Fail "'$tool' is not on PATH." }
}

# --- Stale git lock files -----------------------------------------------------
# A crashed editor, a killed git process, or a tool touching the repo through a
# file-sync layer can leave .git/index.lock behind. Git then refuses every write
# with "Unable to create '.git/index.lock': File exists", which used to kill the
# ship AFTER a clean build and all gates - maximally annoying.
# So: if a lock exists and NO git process is actually running, it is stale and we
# clear it. If git really is running, we stop and say so rather than corrupt it.
$locks = @(Get-ChildItem -Path (Join-Path $RepoPath '.git') -Filter '*.lock' -File -ErrorAction SilentlyContinue)
if ($locks.Count -gt 0 -and $DryRun) {
  Write-Host "  locks     $($locks.Count) git lock file(s) present; dry-run will not remove them" -ForegroundColor Yellow
}
if ($locks.Count -gt 0 -and -not $DryRun) {
  $running = @(Get-Process -Name 'git' -ErrorAction SilentlyContinue)
  if ($running.Count -gt 0) {
    Write-Host ''
    Write-Host "  $($locks.Count) git lock file(s) present AND $($running.Count) git process(es) running:" -ForegroundColor Red
    foreach ($p in $running) { Write-Host "    pid $($p.Id)  $($p.ProcessName)" -ForegroundColor Red }
    Fail 'A git process is using this repo. Close it (or your editor) and re-run.'
  }
  foreach ($lk in $locks) {
    try {
      Remove-Item $lk.FullName -Force -ErrorAction Stop
      Write-Host "  cleaned    stale .git/$($lk.Name) (no git process was running)" -ForegroundColor Yellow
    } catch {
      Fail "Could not remove '$($lk.FullName)'. Delete it manually, then re-run."
    }
  }
}

# npm resolves to npm.ps1 on some installs, which does not set $LASTEXITCODE
# the way a native command does. Prefer the .cmd shim.
$Npm = 'npm.cmd'
if (-not (Get-Command $Npm -ErrorAction SilentlyContinue)) { $Npm = 'npm' }

$nodeVer = (& node --version) 2>&1
Write-Host "  node      $nodeVer"
Write-Host "  npm       $Npm"

if ([string]::IsNullOrWhiteSpace($Branch)) {
  $Branch = (& git rev-parse --abbrev-ref HEAD 2>&1)
  if ($LASTEXITCODE -ne 0) { Fail 'Not a git repository.' }
  $Branch = "$Branch".Trim()
}
Write-Host "  branch    $Branch"

$AllowedShipBranches = @('main', 'redesign-2026-07')
if ($AllowedShipBranches -notcontains $Branch) {
  Fail "Branch '$Branch' is not an approved ship source. Use main or redesign-2026-07, or update the reviewed allowlist in SHIP-GYM.ps1."
}
& git show-ref --verify --quiet refs/remotes/origin/main
if ($LASTEXITCODE -eq 0) {
  $divergence = (& git rev-list --left-right --count "origin/main...HEAD" 2>&1)
  if ($LASTEXITCODE -eq 0) { Write-Host "  divergence origin/main...HEAD  $divergence (left=live-only, right=branch-only)" }
}

# --- The chain manifest — the single definition of build steps and gates -------
$ChainFile = Join-Path $RepoPath 'scripts\ship-chain.json'
if (-not (Test-Path $ChainFile)) {
  Fail "No scripts\ship-chain.json in '$RepoPath'. That file defines the build and gate chain."
}
try { $Chain = Get-Content -Raw -LiteralPath $ChainFile | ConvertFrom-Json }
catch { Fail "scripts\ship-chain.json is not valid JSON: $($_.Exception.Message)" }
if (-not $Chain.build -or -not $Chain.gates) {
  Fail 'scripts\ship-chain.json must define both "build" and "gates".'
}
Write-Host "  chain     $(@($Chain.build).Count) build steps, $(@($Chain.gates).Count) gates"

$venues = (& node -e "console.log(require('./data.js').GYMS.length)" 2>&1)
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host "  $venues" -ForegroundColor Red
  Fail 'data.js will not load - check it for a syntax error.'
}
$venues = "$venues".Trim()
Write-Host "  venues    $venues"
if ([string]::IsNullOrWhiteSpace($Message)) {
  $Message = "Flagship 2027: source-led directory, venue count $venues"
}
if ($DryRun) { Write-Host '  mode      DRY RUN (build + gates only, no git)' -ForegroundColor Yellow }

# =============================================================================
#  2. BUILD
# =============================================================================
if ($SkipBuild) {
  Write-Head 'BUILD - skipped (-SkipBuild)'
} else {
  Write-Head 'BUILD'

  Invoke-Step -Label 'npm install' -Exe $Npm -CmdArgs @('install', '--no-audit', '--no-fund') -Quiet

  foreach ($step in $Chain.build) {
    $label = if ($step.label) { $step.label } else { [IO.Path]::GetFileNameWithoutExtension($step.script) }
    Invoke-Node $label $step.script
  }
}

# =============================================================================
#  3. GATES - nothing ships if any of these fail
# =============================================================================
Write-Head 'GATES'

foreach ($gate in $Chain.gates) {
  if ($gate.npm) {
    $label = if ($gate.label) { $gate.label } else { "npm run $($gate.npm)" }
    Invoke-Step -Label $label -Exe $Npm -CmdArgs @('run', $gate.npm) -Quiet
  } else {
    $label = if ($gate.label) { $gate.label } else { [IO.Path]::GetFileNameWithoutExtension($gate.script) }
    Invoke-Node $label $gate.script
  }
}

Write-Host ''
Write-Host '  ALL GATES PASSED' -ForegroundColor Green

if ($DryRun) {
  $mins = [math]::Round(((Get-Date) - $script:StartTime).TotalMinutes, 1)
  Write-Head "DRY RUN COMPLETE in $mins min - nothing committed, nothing pushed"
  Write-Host '  Re-run without -DryRun to ship.' -ForegroundColor Yellow
  exit 0
}

# =============================================================================
#  4. COMMIT
# =============================================================================
Write-Head 'COMMIT'

$dirty = @(& git status --porcelain 2>&1)
if ($dirty.Count -eq 0) {
  Write-Host '  Nothing to commit - the build produced no changes.' -ForegroundColor Yellow
} else {
  Write-Host "  $($dirty.Count) changed path(s)"
  # Stage the site and its source, but never sweep private operations, audit
  # evidence or spent one-off command files into a release commit.
  $stagePaths = @(
    'add', '-A', '--', '.',
    ':(exclude).internal-docs/**', ':(exclude)_audit-tmp/**',
    ':(exclude)private/**', ':(exclude)research/**',
    ':(exclude)*.cmd', ':(exclude)PUSH_*.cmd', ':(exclude)REBUILD_*.cmd',
    ':(exclude)TIM-SHIP-*.ps1',
    ':(exclude)WORK_LOG_CODEX.md', ':(exclude)CODEX-FULL-AUDIT.md'
  )
  Invoke-Step -Label 'git add (release allowlist)' -Exe 'git' -CmdArgs $stagePaths -Quiet
  Invoke-Step -Label 'git commit' -Exe 'git' -CmdArgs @('commit', '-m', $Message) -Quiet
  Write-Host ("       -> " + (& git log -1 --format="%h %s")) -ForegroundColor DarkGray
}

if ($NoPush) {
  Write-Head 'COMMITTED LOCALLY (-NoPush) - nothing pushed'
  Write-Host "  To ship:  git push origin ${Branch}:main" -ForegroundColor Yellow
  exit 0
}

# =============================================================================
#  5. PUSH  (rollback tag first, always)
# =============================================================================
Write-Head 'PUSH'

Invoke-Step -Label 'git fetch origin' -Exe 'git' -CmdArgs @('fetch', 'origin', '--quiet') -Quiet

if ($Branch -ne 'main') {
  & git merge-base --is-ancestor origin/main HEAD
  if ($LASTEXITCODE -ne 0) {
    Fail "$Branch does not contain current origin/main. Reconcile the branches before attempting a live push."
  }
}

$tag = 'main-pre-' + (Get-Date -Format 'yyyyMMdd-HHmm')
Invoke-Step -Label "tag $tag -> origin/main" -Exe 'git' -CmdArgs @('tag', '-f', $tag, 'origin/main') -Quiet
Invoke-Step -Label 'push rollback tag'       -Exe 'git' -CmdArgs @('push', '-f', 'origin', "refs/tags/$tag") -Quiet

if ($Branch -ne 'main') {
  Invoke-Step -Label "push $Branch" -Exe 'git' -CmdArgs @('push', '-u', 'origin', $Branch) -Quiet
}
Invoke-Step -Label "push $Branch -> main (LIVE)" -Exe 'git' -CmdArgs @('push', 'origin', "${Branch}:main") -Quiet

Write-Host '  Cloudflare Pages is now building from main.' -ForegroundColor Green

# =============================================================================
#  6. NOTIFY  (best effort - a slow search engine must not fail the ship)
# =============================================================================
Write-Head 'NOTIFY SEARCH ENGINES'

Invoke-Step -Label 'ping-sitemap'    -Exe 'node' -CmdArgs @('scripts/ping-sitemap.js')    -AllowFail
Invoke-Step -Label 'submit-indexnow' -Exe 'node' -CmdArgs @('scripts/submit-indexnow.js') -AllowFail

# =============================================================================
#  DONE
# =============================================================================
$mins = [math]::Round(((Get-Date) - $script:StartTime).TotalMinutes, 1)
Write-Head "SHIPPED in $mins min"
Write-Host "  live      https://pattaya-gym.com/"
Write-Host "  venues    $venues"
Write-Host "  branch    $Branch -> main"
Write-Host ("  commit    " + (& git log -1 --format="%h %s"))
Write-Host ''
Write-Host '  Give Cloudflare 1-2 minutes, then hard-refresh (Ctrl+F5).' -ForegroundColor Cyan
Write-Host '  If the edge still serves old HTML, purge the cache in the dashboard.' -ForegroundColor DarkGray
Write-Host ''
Write-Host '  ROLLBACK, if anything looks wrong:' -ForegroundColor Yellow
Write-Host "    git push origin ${tag}:main --force-with-lease" -ForegroundColor Yellow
Write-Host ''
exit 0
