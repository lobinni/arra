# Static verification log

Checks actually run while packaging this checkout, with exact commands.
Canonical deployment on record: `0x8738E2B7660775eD3737BF2c692E6a26b5043d33`
(Studionet 61999), release `1.1.0-studionet`.

| Check | Command | Scope |
| --- | --- | --- |
| Python compilation | `python -m py_compile contracts/arra.py tests/direct/*.py tests/integration/*.py` | syntax of contract and both suites |
| Contract pattern guard | `python scripts/check_contract_patterns.py` | 21-method surface, 3 consensus blocks, payable set, release lock, no admin surface, digest commitments, reporting grace, adjudication deadline, liability preservation, verdict consistency |
| Release wiring guard | `python scripts/check_release.py` | chain/RPC/version/address consistency across contract, deployments record, deploy script, frontend config |
| Direct Mode suite | `pytest tests/direct/ -v` | behavioural + adversarial lifecycle coverage, including the 1.1.0 steward-feedback regression and adversarial cases |
| Accounting replay | `python scripts/verify_accounting.py <deployed-address>` | off-chain recomputation of the deposit partition sum (requires a live address) |
| Web build | `npm ci && npm run build` | type-safe production bundle of the application |

## Release gates for finishing environments

```
py -3.12 -m pip install -r requirements.txt
genvm-lint check contracts/arra.py --json
pytest tests/direct/ -v
npm ci
npm run build
ARRA_CONTRACT=0xDeployedAddress pytest -m integration -v   # opt-in live
```

A green CI run and a deployment receipt are not evidence that lifecycle
transactions occurred; retain receipts for every state-changing transaction
demonstrated live.
