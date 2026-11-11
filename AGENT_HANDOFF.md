# Agent handoff — ARRA

Current state of this checkout and how to advance it safely.

## What is complete

- `contracts/arra.py` — full Intelligent Contract, 21 public methods,
  three consensus blocks, four-partition accounting, release lock to
  Studionet 61999. Version 1.1.0-studionet implements the steward feedback:
  liability preservation for inconclusive exception evidence, the bounded
  adjudication deadline for claimed exceptions, the 48-hour post-window
  reporting grace, binding-verdict consistency/support enforcement, frozen
  challenge evidence families, and `emit_transfer` withdrawals. Passes
  `python -m py_compile` and `scripts/check_contract_patterns.py`.
- `tests/direct/` — Direct Mode behavioural/adversarial suite for the
  deterministic surface.
- `tests/integration/` — opt-in live Studionet smoke (read-only) gated behind
  the `integration` marker and the `ARRA_CONTRACT` env.
- `deploy/deployScript.ts` — 61999-locked deployment script that writes
  `deployments/studionet.json` and the frontend `.env.local` address handoff.
- `deployments/studionet.json` — the single canonical record for release
  1.1.0-studionet at `0x8738E2B7660775eD3737BF2c692E6a26b5043d33`. No
  historical addresses are published; superseded records are deliberately
  dropped from the repository.
- Web application — Vite + React in `src/`, routes `/`, `/agreements`,
  `/agreements/:id`, `/open`, `/account`, `/protocol`; wallet connect +
  chain guard; all reads/writes flow through `src/lib/config.ts` and
  `src/lib/contract.ts` only.
- Documentation — `README.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`,
  `docs/TESTING.md`, `docs/CONFIGURATION.md`, `docs/LIVE_DEMO.md`,
  `STATIC_VERIFICATION.md`.

## What is deliberately pending

1. **Deployment record completion.** The canonical 1.1.0 release is live at
   `0x8738E2B7660775eD3737BF2c692E6a26b5043d33`; add the deployment
   transaction hash to `deployments/studionet.json` from the deployer wallet
   history. Do not re-run the deployment script against this version.
2. **Live lifecycle receipt set.** Follow `docs/MANUAL_TESTING.md` end-to-end
   on the canonical address (formation → acceptance → incident → measurement
   → exception claim → adjudication → challenge → settlement → withdrawal)
   and archive every transaction hash plus the final accounting readback into
   the deployments record under a `lifecycleEvidence` key.
3. **CI.** Wire the release gates from `STATIC_VERIFICATION.md` into your
   pipeline; the integration suite stays opt-in.
4. **Publishing.** `docs/PUBLISHING.md` has the GitHub push commands and the
   Vercel recipe (single env variable, no database).

## Non-negotiables

- Never wire a historical address into current code.
- Never retry a measurement marked rejected/undetermined on a live address.
- Never widen the wallet surface beyond injected EIP-1193 on chain 61999.
- Every user-facing write keeps the pre-sign wallet guard in place.
