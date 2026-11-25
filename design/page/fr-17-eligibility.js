const outcome =
  new URLSearchParams(location.search).get('outcome') || 'pending';
const examples = {
  pending:
    '<p>Not checked yet. Select Check eligibility to see whether this recorded request can continue.</p>',
  can: '<div class="fr17-state"><h3>Can proceed to a proposal</h3><p><strong>Reason:</strong> The recorded request meets the applicable synthetic rule.</p><p><strong>Next action:</strong> Prepare a non-binding proposal for review.</p><p class="fr17-source">Policy wording · POL-NARIN-001:v1 · section dates</p><p class="fr17-source">Rule · FAMILY_PROTECTION:ADDRESS:v2 · section rule</p><p><a class="fr17-action" href="fr-15-proposal-review.html">Prepare proposal (preview)</a></p></div>',
  cannot:
    '<div class="fr17-state"><h3>Cannot proceed</h3><p><strong>Reason:</strong> The requested effective date is outside the active policy term.</p><p><strong>Next action:</strong> Correct and record a new request.</p></div>',
  review:
    '<div class="fr17-state"><h3>Needs review</h3><p><strong>Reason:</strong> Applicable policy wording or rule evidence cannot be reconciled automatically.</p><p><strong>Next action:</strong> This request cannot proceed automatically while the evidence remains unresolved.</p><p class="fr17-source">Available policy source: POL-NARIN-001:v1 · section dates</p><p class="fr17-source">Unresolved source: FAMILY_PROTECTION:ADDRESS:v2</p></div>',
  error:
    '<p role="alert" class="fr17-error">Could not complete the check. Your recorded request remains saved. Try again.</p>',
};
document.querySelector('#result').innerHTML =
  examples[outcome] || examples.pending;
