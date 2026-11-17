const outcomes = [
  'VERIFIED — Simulated checks passed. This is not real identity verification.',
  'FAILED — Synthetic identity details did not match.',
  'FAILED — Synthetic ID is expired.',
  'REVIEW_REQUIRED — Simulated liveness result is inconclusive.',
];
document.getElementById('run').addEventListener('click', () => {
  document.getElementById('identity-result').textContent = outcomes[document.getElementById('scenario').selectedIndex];
});
