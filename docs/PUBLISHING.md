# Publishing — GitHub push + Vercel deploy

All commands assume the repository root. Content in this repository is
English-only.

## 1. Push to GitHub

```bash
# first time only
git init
git branch -M main
git remote add origin https://github.com/<your-account>/<your-repo>.git

# every release
git add .
git status                                  # review what is being committed
git commit -m "ARRA 1.1.0-studionet: rebrand + canonical deployment 0x8738E2B7"
git push -u origin main
```

Useful follow-ups:

```bash
git tag -a v1.1.0-studionet -m "Canonical ARRA Studionet deployment 0x8738E2B7660775eD3737BF2c692E6a26b5043d33"
git push origin v1.1.0-studionet

# pull request flow for reviews
git checkout -b release/1.1.0
git push -u origin release/1.1.0
```

Never commit `.env.local`, the CLI cache or deployer keys — they are covered
by `.gitignore`. The canonical address itself is public configuration and is
committed deliberately (`src/lib/config.ts` fallback + `deployments/studionet.json`).

## 2. Deploy the web app on Vercel (no database)

The application is a static Vite single-page build. There is no backend, no
database and no server secret — every read goes to the public Studionet
gateway and every write is signed locally by the user's wallet.

1. **Import the repository** in Vercel (New Project → Import Git Repository).
2. Framework preset: **Vite** (`vercel.json` pins the build command, output
   directory and SPA rewrites already).
3. Add the single environment variable before the first build:

   | Key | Value |
   | --- | --- |
   | `VITE_ARRA_CONTRACT` | `0x8738E2B7660775eD3737BF2c692E6a26b5043d33` |

   Leave `VITE_GENLAYER_CHAIN_ID`, `VITE_GENLAYER_RPC_URL` and
   `VITE_GENLAYER_EXPLORER` unset (defaults are the locked Studionet values),
   or set them to the exact values from `.env.example` — anything else makes
   the app refuse to boot.
4. Deploy. Then set `productionFrontend.url` in `deployments/studionet.json`
   to the assigned domain and commit it (see section 1).

Redeploying after a contract rotation: update the env variable (or the
fallback constant), trigger a redeploy — no code changes are needed anywhere
else. `scripts/check_release.py` validates the wiring locally before pushing.
