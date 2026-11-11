# Security model

ARRA treats every external input — user calldata, fetched web content,
model output and even validator observations — as untrusted. All consequential
transitions are re-derived deterministically.

## Invariants

1. **Accounting conservation.** `total_deposited = agreement_escrow +
   challenge_escrow + total_claimable + total_withdrawn` holds across every
   write. `get_stats()` recomputes it; `scripts/verify_accounting.py` replays
   it off-chain.
2. **No admin surface.** There is no owner key, upgrade hook, pause switch or
   privileged address. `get_stats().admin_controls` is hard-coded `false`.
3. **Pull payments.** Settlement never pushes value during a lifecycle call;
   it accrues to `credits`, and `withdraw_credit` clears the ledger entry
   before emitting the EVM-layer native transfer (`emit_transfer`), which
   executes at finality — so a failing transfer cannot be replayed.
4. **Liability preservation.** Once measurement consensus verifies a breach,
   its `liable_bps` is never reset by missing or contested exception
   evidence. Only a sufficiently proven exception (or an upheld challenge)
   reduces it; every bounded default path settles the established liability.
5. **Frozen cases.** Measurement, exception and challenge decisions commit to
   `*_case_hash` values assembled from the immutable agreement spec hash, the
   frozen window and the submitted evidence, so decisions cannot be re-pointed
   at altered inputs after the fact.
6. **Consensus containment.** Only three methods run non-deterministic
   blocks; validators re-execute and compare bounded fields only. Consensus
   never returns money amounts or percentages — liability basis points are
   recomputed deterministically from validated interval sets.
7. **Binding-verdict consistency.** A financially binding classification
   (`PROVEN`/`PARTIAL`) must be causally consistent (`causal_match`,
   service/window attribution) and corroborated by supportive exception
   source manifests; `PARTIAL` relief must be covered by corroborated outage
   intervals. Inconsistent or unsupported outputs yield no decision instead
   of relief.
8. **Bounded liveness.** Every contested stage has a permissionless timeout
   path: measurement retry → dismissal, claimed exception adjudication →
   default breach, challenge resolution → expiry, and unused collateral only
   refunds after the post-window reporting grace period.

## Threat notes

- **Customer exaggeration.** Opening an incident requires `actual_bps` strictly
  below the frozen target; a fabricated number still needs every frozen
  source — including an independent probe — to corroborate it, or the
  measurement is rejected and the agreement unblocked.
- **Provider excuse invention.** Only clauses frozen at formation can be
  claimed, evidence must come from origins frozen in the source policy, and
  unattributable or stale evidence produces `INCONCLUSIVE`, never relief —
  and if it stays unavailable the incident finalizes as `UNPROVEN_FINAL`,
  settling the verified breach liability for the customer.
- **Prompt injection from evidence.** All fetched text is treated as data,
  never instructions; manifests are structurally validated, intervals are
  clipped and merged deterministically, and digest comparison ignores any
  narrative the model adds.
- **Evidence replay.** Interval endpoints must intersect the frozen window;
  events wholly outside it are normalized away and a source that only carries
  out-of-window history cannot support the requested fact.
- **Re-entrancy.** Value moves via credit accrual; the single native transfer
  is emitted to the EVM layer after ledger mutation, so no interim callback
  can re-enter the ledger.
- **Refund racing.** `expire_agreement` stays locked for 48 hours after the
  window ends, so late-published monitoring evidence can still open an
  incident before collateral leaves escrow.
- **Network confusion.** Contract, deploy script, frontend and release guards
  all reject anything that is not chain 61999 on the studio gateway. The
  frontend additionally re-asserts the wallet chain immediately before every
  signature request.

## Limits

- Bonds: 0.001–50 GEN per agreement. Challenge stakes: 0.0001–10 GEN.
- Evidence: ≤ 8 sources per stage; ≤ 8 policy origins per group; ≤ 8 frozen
  clauses per agreement.
- Windows: SLA window 30 minutes–90 days; formation lead ≥ 5 minutes;
  challenge window 10 minutes–24 hours; exception adjudication deadline 24
  hours from claim; post-window reporting grace 48 hours.
