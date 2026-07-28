# Codex Hard Revert Report — 2026-05-15

## Step Status
1. Strip BOM from `scripts/verify.js`: OK.
2. Confirm no BOM: OK. First 8 bytes are `23 21 2F 75 73 72 2F 62`, not `EF BB BF`. Note: this PowerShell version did not support `Format-Hex -Count`, so I used an equivalent first-byte check.
3. Run `node scripts\verify.js`: OK.
4. Commit `scripts/verify.js`: OK. Commit `9469710 Preserve scripts/verify.js across hard revert to 8551051`.
5. Force-push with lease: OK. `main` force-updated from `1d863cc` to `9469710` using `--force-with-lease`.
6. Confirm remote head: OK. `origin/main` top two commits:
   - `9469710 Preserve scripts/verify.js across hard revert to 8551051`
   - `8551051 Unify nav site-wide — editorial PATTAYA.GYM brand + sport links on every page`
7. Restore reference docs to disk: OK. Restored `CODEX_HARD_REVERT_PROMPT.md`, `HARD_REVERT_PLAYBOOK.md`, and `CODEX_HARD_REVERT_UNBLOCK.md` from `%TEMP%`. `CODEX_STRIP_BOM_AND_FINISH.md` was present on disk but missing from `%TEMP%`.

## styles.css Line Count
- `styles.css`: 5424 lines at final HEAD.

## node scripts/verify.js Output
```text
1) Null-byte scan…
   ✓ 0 file(s) with null bytes
2) HTML truncation scan (must end with </html>)…
   ✓ 0 truncated HTML file(s)
3) HTML critical tag balance…
   ✓ 0 tag balance failure(s)
4) HTML attribute quote balance…
   ✓ 0 unclosed attribute(s)
5) CSS brace balance…
   ✓ 0 CSS file(s) with unbalanced braces
6) Node.js syntax check on build files…
   ✓ 0 build file syntax error(s)
7) Raw template-literal leak in shipped HTML…
   ✓ 0 unresolved template-literal leak(s)
8) ASSET_VERSION consistency across build files…
   ✓ All build files at v225

════════════════════════════════════════════════════════════

✓ ALL CHECKS PASSED. Safe to push.
```

## Cloudflare Spot Checks
- `https://pattaya-gym.com/` — OK.
- `https://pattaya-gym.com/category/golf/` — OK.
- `https://pattaya-gym.com/gyms/fairtex-pattaya/` — OK.
- `https://pattaya-gym.com/guides/best-muay-thai-pattaya/` — OK.
- `https://pattaya-gym.com/contact/` — OK.
- `https://pattaya-gym.com/about/` — OK.

## Anything Unexpected
- The prompt expected `styles.css` around 5659 lines and ASSET_VERSION 233 at the target commit, but the actual `8551051` tree has `styles.css` at 5424 lines and verifier reports ASSET_VERSION v225. I did not change either value.
- `Format-Hex -Count` is unsupported in this PowerShell environment; I used an equivalent first-byte check to confirm the BOM was gone.
- `CODEX_STRIP_BOM_AND_FINISH.md` was not present in `%TEMP%` during restore, but it remains present on disk as an untracked reference doc.
