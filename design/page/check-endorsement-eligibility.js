const result = document.getElementById('result');
const check = document.getElementById('check');
const examples = {
  CAN_PROCEED: { style: 'proceed', html: '<h3>Can proceed to a proposal</h3><p>The address request is supported by the cited policy wording and endorsement rule. No policy or coverage has changed.</p><ul class="citations"><li>Policy wording · Family Protection v3.2 · section 4.1, Correspondence address</li><li>Endorsement rule · RULE-ADDR-009 v1.2 · section 2, Address changes</li></ul><p>Next: review the proposed change.</p>' },
  CANNOT_PROCEED: { style: 'cannot', html: '<h3>Cannot proceed</h3><ul><li>The requested effective date does not meet the cited rule condition.</li></ul><p>Review the request details before continuing.</p><ul class="citations"><li>Endorsement rule · RULE-ADDR-009 v1.2 · section 2, Address changes</li></ul>' },
  NEEDS_REVIEW: { style: 'review', html: '<h3>Needs further review</h3><ul><li>The current policy wording and applicable rule could not be reconciled.</li></ul><p>The evidence is unresolved, so no calculation or proposal can be prepared automatically.</p><ul class="citations"><li>Policy wording · Family Protection v3.2 · section 7.3</li><li>Endorsement rule · RULE-RIDER-004 v1.0 · section 3</li></ul>' },
  ERROR: { style: 'error', html: '<h3>Could not complete the check</h3><p>The assessment service is unavailable. No result was recorded.</p><p>Next: try the check again.</p>' },
};
function show(state) { const item = examples[state]; result.className = `decision ${item.style}`; result.innerHTML = item.html; }
check.addEventListener('click', () => { check.disabled = true; result.className = 'decision'; result.innerHTML = '<h3>Checking this request…</h3><p>Reviewing policy wording and applicable endorsement rules.</p>'; window.setTimeout(() => { show('CAN_PROCEED'); check.disabled = false; }, 350); });
document.querySelectorAll('[data-state]').forEach((button) => button.addEventListener('click', () => show(button.dataset.state)));
