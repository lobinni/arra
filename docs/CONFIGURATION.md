# Configuration — rotating the contract address

Current canonical address: `0x8738E2B7660775eD3737BF2c692E6a26b5043d33`
(see `deployments/studionet.json`).

Every environment value that can change between releases is centralized. To
deploy a new contract version and point the application at it, you touch at
most **two generated files and one constant**.

## Single source of truth

| Concern | Location |
| --- | --- |
| Chain ID, RPC, explorer, network metadata | `src/lib/config.ts` (hard-locked to 61999 / studio gateway) |
| Active contract address | env `VITE_ARRA_CONTRACT` → fallback `ARRA_CONTRACT` in `src/lib/config.ts` |
| Deployment records | `deployments/studionet.json` |
| Contract source of record | `contracts/arra.py` |

## After a fresh deployment

`deploy/deployScript.ts` performs the handoff automatically once consensus
finalizes the deployment:

1. writes the finalized address into `deployments/studionet.json`;
2. writes `.env.local` with `VITE_ARRA_CONTRACT=<address>`;
3. verifies `get_stats()` on the new address reports chain `61999` and the
   studio RPC before declaring success.

Rebuild and ship the frontend; no source edits are required.

## Manual repoint

If the address rotated outside the deploy script:

```bash
# option A — build-time env (preferred)
VITE_ARRA_CONTRACT=0xNewFinalizedAddress npm run build
```

or edit the single fallback constant in `src/lib/config.ts`:

```ts
const ARRA_CONTRACT = "0xNewFinalizedAddress";
```

Then run the wiring guard to prove consistency:

```bash
python scripts/check_release.py
```

## Rules

- Never wire any superseded address into current code; the release guard
  fails when an address outside the canonical record appears in config.
- Never relax the chain guard. Both `assertReleaseConfig()` and the deploy
  script must refuse non-61999 configurations.
- The UI reads the address from config only; no page, component or test may
  hardcode an address.
