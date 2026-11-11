# ARRA

**A provider-backed SLA exception protocol: independently prove the miss first, then let GenLayer consensus decide whether a frozen exception clause actually excuses it.**

ARRA is hard-locked to **GenLayer Studionet only**:

- chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- wallet: generic injected **EIP-1193** through `window.ethereum` only (MetaMask or any compatible injected wallet)

There is no alternate-network release path, no Snaps path, no WalletConnect path, no embedded wallet, no backend signer and no browser private key anywhere in the application.

## Last update

**2026-10-22 — ARRA `1.1.0-studionet`, canonical address `0x8738E2B7660775eD3737BF2c692E6a26b5043d33`.** The repository ships the ARRA brand end-to-end (contract source `contracts/arra.py`, test suite, tooling, docs) with the editorial "wax-sealed ledger" interface; the canonical record holds exactly one live deployment. This release implements the steward settlement/timing/evidence-consistency feedback:

What changed in this update:

1. **Liability preservation (regression fix).** `finalize_default_breach()` on the `INCONCLUSIVE` branch no longer refunds the provider; a verified breach settles as `UNPROVEN_FINAL` paying the customer, so unavailable/inconclusive exception evidence can never zero out established liability.
2. **Timeout recovery for claims.** `claim_exception()` now stamps a 24-hour `adjudication_deadline`; a stalled or never-run adjudication settles permissionlessly as `CLAIM_TIMEOUT_NOT_PROVEN` via `finalize_default_breach()` — `EXCEPTION_CLAIMED` can no longer lock collateral indefinitely.
3. **Post-window reporting grace.** `expire_agreement()` is locked for 48 hours after `window_end`; the customer can report any completed observation interval inside coverage during that window. Availability is measured per selected completed interval, not the whole coverage window.
4. **Verdict consistency enforcement.** `_normalize_exception_result()` rejects binding classifications (`PROVEN`/`PARTIAL`) without `causal_match` and service/window attribution; `_enforce_exception_support()` requires supportive source manifests and corroborated outage intervals covering every excused interval — adversarial/manipulated model outputs degrade to "no decision" instead of relief.
5. **Withdrawal pays real GEN.** `withdraw_credit()` now uses the runtime's native transfer primitive (`_Recipient(account).emit_transfer(value=…)`) instead of the nonexistent `gl.evm.send`, so credit withdrawal actually executes on the EVM layer at finality.
6. **Challenge evidence family binding.** Challenge sources inherit the family frozen for their origin in the challenge policy (previously a wrong-caller-supplied family was hard-coded and rejected), fixing a latent submission bug.
7. **Regression + adversarial Direct Mode coverage** for all of the above (40 tests passing), updated UI (grace-period countdown, claim timeout path, verdict labels), refreshed docs, and release-wiring guards that lock the new invariants.

## Live deployment

**Canonical release 1.1.0-studionet** is deployed on Studionet 61999 at [`0x8738E2B7660775eD3737BF2c692E6a26b5043d33`](https://explorer-studio.genlayer.com/address/0x8738E2B7660775eD3737BF2c692E6a26b5043d33). The web application resolves this address from `src/lib/config.ts` (fallback constant) or the build-time `VITE_ARRA_CONTRACT` env; both are verified against `deployments/studionet.json` by `scripts/check_release.py`. All reads and writes in the UI are live on-chain calls — no demo data, no database, no backend.

## Stable Studionet toolchain

The release toolchain is pinned to stable Studionet 61999: Python 3.12, GenLayer CLI 0.39.1, `genlayer-js==1.1.8`, `genlayer-test==0.29.2`, `genlayer-py==0.16.3`, `genvm-linter==0.11.0`, Node 22, and the stable `py-genlayer` runtime hash in the contract header.

## Product boundary

ARRA deliberately keeps SLA arithmetic deterministic. A customer cannot expose provider collateral merely by typing a poor availability number, and a provider cannot invent an exception after failure. Independent measurement consensus opens the incident; only then can a frozen exception be adjudicated and challenged.

Deterministic systems can establish the measured SLA result. They cannot reliably decide whether a frozen semantic clause such as *“an upstream infrastructure failure materially caused this service impact”* is established by conflicting public evidence, whether causation matches the observation interval, or whether that exact frozen exception applies. ARRA uses deterministic code for timing, thresholds, interval arithmetic and money, while consensus is restricted to the contested semantic interpretation.

**Deterministic responsibilities:** agreement formation, authorization, timing, source-policy enforcement, measurement threshold comparison, interval validation, partial-liability arithmetic, GEN allocation, settlement and accounting.

**Consensus responsibilities:** semantic interpretation of public evidence, whether facts establish the exact frozen exception, causal relation to the measured impact, and challenge re-evaluation. Consensus is never used for arithmetic or ordinary deterministic oracle facts.

Evidence uses a provider-neutral pipeline: fetch each frozen source, independently extract a bounded structured manifest, normalize it, then compare consequential fields. Volatile request timestamps, rolling metadata, counters, response ordering, unrelated current records and page chrome never enter the consensus digest. The `measurement_evidence_digest`, `exception_evidence_digest` and `challenge_evidence_digest` commit to normalized source identity, service/window attribution, source contribution, measured availability and event intervals. Separate `*_observation_digest` values commit to the accepted leader's fetched body hashes for audit; they are not required to match validators' observations. Each source is processed up to 24,000 characters (48,000 total per decision), while only bounded structured manifests are persisted.

Each source policy freezes a retrieval mode: `REQUEST_JSON`, `REQUEST_TEXT` or `RENDER_TEXT` (omitted mode defaults to `RENDER_TEXT`). A decisive measurement requires every submitted source to contribute evidence for the named service and completed observation interval, including an independent probe and a corroborating family. Malformed, empty, unattributable, stale or unavailable evidence remains non-decisive.

## Settlement guarantees (release 1.1.0)

* A verified breach keeps its established liability unless an exception is **sufficiently proven**. Unavailable or inconclusive exception evidence finalizes as `UNPROVEN_FINAL` and pays the customer — it can never silently return the bond to the provider that invoked the exception.
* `EXCEPTION_CLAIMED` carries a **bounded 24-hour adjudication window**. If adjudication stalls or never runs, anyone may settle a `CLAIM_TIMEOUT_NOT_PROVEN` default breach — collateral can never be locked indefinitely.
* Unused collateral refunds only after a **48-hour post-window reporting grace period** (`expire_agreement`), so customers can report incidents from monitoring evidence that publishes after coverage ends. Availability is measured over a **customer-selected completed interval** inside the coverage window, not necessarily the whole window.
* Financially binding verdicts (`PROVEN`/`PARTIAL`) must be **logically consistent** (`causal_match`, service/window attribution) and **backed by supportive source manifests**; every excused interval must be corroborated by covered outage intervals. Adversarial or manipulated model outputs yield no decision instead of relief.
* Withdrawals pay native GEN through the EVM-layer `emit_transfer` message (executed by the ghost contract at finality), keeping the pull-pattern accounting intact.
* Challenge evidence **inherits the source family frozen for its origin** — the family is never caller-chosen.

## Main lifecycle

`create_agreement → accept_agreement → open_incident → verify_measurement → claim_exception → adjudicate_exception → optional challenge_exception/resolve_challenge → finalize_incident (or bounded default breach) → withdraw_credit`

## Repository

```
contracts/arra.py           one substantial Intelligent Contract (21 public methods)
tests/direct/                 authored behavioural/adversarial Direct Mode coverage
tests/integration/            opt-in live Studionet smoke against a deployed address
src/                          web application (Vite + React, routes mirror the protocol)
deploy/deployScript.ts        61999-locked deployment script
deployments/studionet.json    canonical + historical deployment records
scripts/                      static contract-pattern and release wiring guards
docs/                         architecture, security, testing, configuration, live demo,
                              manual live-testing and publishing guides
samples/                      reference payloads for the manual live walkthrough
vercel.json                   static SPA hosting config (single-file build, no backend)
```

Guides: manual live exercise in `docs/MANUAL_TESTING.md`, shipping in
`docs/PUBLISHING.md` (GitHub push commands and the Vercel deploy recipe),
address rotation in `docs/CONFIGURATION.md`.

See `docs/CONFIGURATION.md` for the single-value contract address handoff.

## Static checks

```
python -m py_compile contracts/arra.py tests/direct/*.py tests/integration/*.py
python scripts/check_contract_patterns.py
python scripts/check_release.py
```

## Release gates

```
py -3.12 -m pip install -r requirements.txt
genvm-lint check contracts/arra.py --json
pytest tests/direct/ -v
npm ci
npm run build
```

## Frontend

The UI is intentionally product-specific rather than a reusable crypto dashboard. Visual direction: **the wax-sealed ledger — editorial parchment field, engraved hairline cards, Fraunces display serifs, vermilion wax-seal marks, a rotating seal on an ink-dark hero, mono uppercase labels**.

Routes: `/`, `/agreements`, `/agreements/:id`, `/open`, `/account`, `/protocol`. Primary navigation is limited to Agreements, New Agreement, Account and Protocol; incident-specific actions stay inside the agreement workflow. The New Agreement form starts blank. **Load Sample Agreement** is an explicit opt-in and its illustrative terms must be checked and replaced before a real proposal.

Reading and writing require reading the chain through the studio gateway; every write is signed by the connected EIP-1193 wallet on chain 61999. If the wallet sits on another network the application refuses to submit and offers to switch chains instead. The app is a static single-page build (see `docs/PUBLISHING.md` for the Vercel recipe — one env variable, no database URL).

## Ship it

```bash
# 1. Push to GitHub
git init
git branch -M main
git remote add origin https://github.com/<your-account>/<your-repo>.git
git add .
git commit -m "ARRA 1.1.0-studionet: rebrand + canonical deployment 0x8738E2B7"
git push -u origin main
git tag -a v1.1.0-studionet -m "Canonical ARRA Studionet deployment 0x8738E2B7660775eD3737BF2c692E6a26b5043d33"
git push origin v1.1.0-studionet
```

```bash
# 2. Deploy on Vercel — static Vite build, no database
#    Import the repo (framework: Vite; vercel.json already pins build,
#    output directory and SPA rewrites), then set ONE variable:
VITE_ARRA_CONTRACT=0x8738E2B7660775eD3737BF2c692E6a26b5043d33
```

No database URL, no backend secret, no server code: every read goes to the public Studionet gateway and every write is signed by the visitor's own wallet. Full walkthrough in `docs/PUBLISHING.md`.
