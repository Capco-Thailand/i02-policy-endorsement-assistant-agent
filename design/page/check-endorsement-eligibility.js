const result = document.getElementById('result');
const check = document.getElementById('check');
const examples = {
  ELIGIBLE: { style: 'eligible', html: '<h3>Eligible to continue to a mock quote</h3><p>The recorded address request meets the cited rule. No policy or coverage has changed.</p><p class="citation">Source FAMILY_PROTECTION:ADDRESS:v1 · Rule FAMILY_PROTECTION:ADDRESS · version 1 · section rule</p><p>Next: review the mock premium impact when that step is available.</p>' },
  INELIGIBLE: { style: 'ineligible', html: '<h3>Cannot continue yet</h3><ul><li>The requested change does not meet an applicable rule.</li></ul><p>Next: review the cited rule and adjust the request if appropriate.</p>' },
  REFERRED: { style: 'referred', html: '<h3>Needs human review</h3><ul><li>Adding an accidental-death rider requires underwriting follow-up.</li></ul><p>Real underwriting or health disclosure may be needed outside this prototype. Do not upload medical evidence here. No automatic quote or proposal will be made.</p><p class="citation">Source FAMILY_PROTECTION:ACCIDENTAL_DEATH_RIDER:v1 · version 1 · section rule</p>' },
  ERROR: { style: 'error', html: '<h3>Could not complete the check</h3><p>The eligibility service is unavailable. No decision was made.</p><p>Next: try the check again.</p>' },
};
function show(state) {
  const example = examples[state];
  result.className = `decision ${example.style}`;
  result.innerHTML = example.html;
}
check.addEventListener('click', () => {
  check.disabled = true;
  result.className = 'decision';
  result.innerHTML = '<h3>Checking this request…</h3><p>Reviewing the recorded request and cited rules.</p>';
  window.setTimeout(() => { show('ELIGIBLE'); check.disabled = false; }, 350);
});
document.querySelectorAll('[data-state]').forEach((button) => {
  button.addEventListener('click', () => show(button.dataset.state));
});
