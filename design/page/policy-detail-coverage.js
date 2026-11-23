const state = new URLSearchParams(location.search).get('state');
const detail = document.querySelector('#detail');
if (state === 'expired') {
  document.querySelector('#status').textContent = 'Expired';
  document.querySelector('#status').classList.add('expired');
  document.querySelector('#expiry').textContent = '31 December 2023';
  document.querySelector('#request-action').innerHTML = '<p class="action-label">Request unavailable</p><p>This policy has expired. You can’t request a change for it.</p>';
}
if (state === 'unresolved') {
  document.querySelector('#second-coverage').classList.add('unresolved');
  document.querySelector('#second-coverage .term-heading span').textContent = 'Unresolved';
  document.querySelector('#second-coverage .source').textContent = 'The available wording conflicts on this amount. Relevant source: Sample Family Protection wording, version 2025.1, section 2.2 (illustrative).';
}
const stateMessages = {
  loading: ['Loading policy details…', 'Please wait while we load this policy and its source wording.'],
  unavailable: ['This policy is unavailable.', 'Return to your policies.'],
  error: ['We couldn’t load policy details.', 'Try again to load this policy.'],
  session: ['Your session has ended.', 'Sign in again to view policy details.']
};
if (stateMessages[state]) {
  const [title, message] = stateMessages[state];
  detail.querySelectorAll('.record-heading,.section,.action,.sample-note').forEach(node => node.remove());
  const note = document.createElement('section');
  note.className = 'state-note';
  note.setAttribute('aria-live', 'polite');
  const heading = document.createElement('h1');
  heading.textContent = title;
  const copy = document.createElement('p');
  copy.textContent = message;
  const link = document.createElement('a');
  link.href = state === 'session' ? 'sign-in.html' : state === 'error' ? 'policy-detail-coverage.html' : 'policies.html';
  link.textContent = state === 'session' ? 'Sign in' : state === 'error' ? 'Retry' : 'Back to policies';
  note.append(heading, copy, link);
  detail.querySelector('.preview-label').before(note);
}
