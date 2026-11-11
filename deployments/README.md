# Deployments

`studionet.json` is the single canonical record for every ARRA release on
GenLayer Studionet (chain `61999`).

## How the address flows

1. `deploy/deployScript.ts` deploys `contracts/arra.py`, waits for a
   `FINALIZED` receipt, verifies `get_stats()` reports chain `61999` and the
   studio RPC, then updates:
   - `deployments/studionet.json` → `canonicalDeployment.address`
   - `.env.local` → `VITE_ARRA_CONTRACT=<address>`
2. The web application resolves the active address in
   `src/lib/config.ts`:
   - first from the build-time env `VITE_ARRA_CONTRACT`,
   - otherwise from the `ARRA_CONTRACT` fallback constant in that file.

To repoint the application at a different deployment, change **one** value:
either rebuild with `VITE_ARRA_CONTRACT` set, or edit the fallback constant
in `src/lib/config.ts`. No other file hardcodes an address.

The record carries exactly one live deployment. Superseded addresses are
deliberately removed from the repository and must never be wired into
current application code.
