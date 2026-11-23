const params = new URLSearchParams(location.search);
const state = params.get('state');
const policy = params.get('policy');
const detail = document.querySelector('#detail');
const examples = {
  secure: { id: 'POL-MALI-001', name: 'Secure Future Plan', amount: 'THB 750,000', effective: '1 June 2024', expiry: '31 May 2034', frequency: 'Annual', beneficiary: 'Pim S.', title: 'Secure Future Plan synthetic policy' },
  classic: { id: 'POL-NARIN-002', name: 'Classic Life Plan', amount: 'THB 500,000', effective: '1 January 2015', expiry: '1 January 2025', frequency: 'Annual', beneficiary: 'Arisa K.', title: 'Classic Life Plan synthetic policy' }
};
if (examples[policy]) {
  const item = examples[policy];
  detail.querySelector('.page-title').textContent = item.name;
  detail.querySelector('.record-heading .intro').textContent = item.id;
  detail.querySelector('#product-heading + .facts').children[2].querySelector('dd').textContent = item.name;
  detail.querySelector('#product-heading + .facts + .source').textContent = `Source: ${item.title}, version v1, section product`;
  const coverage = detail.querySelector('#coverage-heading + .term-list');
  coverage.children[0].querySelector('.term-heading span').textContent = item.amount;
  coverage.children[0].querySelector('.source').textContent = `Source: ${item.title}, version v1, section coverage.life`;
  coverage.children[1].remove();
  const exclusions = detail.querySelector('#exclusions-heading + .term-list');
  exclusions.children[0].querySelector('.source').textContent = `Source: ${item.title}, version v1, section exclusions.life`;
  exclusions.children[1].remove();
  const facts = detail.querySelector('#facts-heading + .facts');
  facts.children[0].querySelector('dd').textContent = item.effective;
  facts.children[1].querySelector('dd').textContent = item.expiry;
  facts.children[2].querySelector('dd').textContent = item.frequency;
  detail.querySelector('.beneficiary-list').innerHTML = `<li class="beneficiary"><div><strong>${item.beneficiary}</strong><span>Primary beneficiary</span></div><span class="allocation">100%</span></li>`;
}
if (policy === 'classic') {
  document.querySelector('#status').textContent = 'Expired';
  document.querySelector('#status').classList.add('expired');
  document.querySelector('#request-action').innerHTML = '<p class="action-label">Request unavailable</p><p>This policy has expired. You can’t request a change for it.</p>';
  detail.querySelector('#coverage-heading').textContent = 'Coverage listed in this expired synthetic policy';
}
if (state === 'unresolved') {
  document.querySelector('#second-coverage').classList.add('unresolved');
  document.querySelector('#second-coverage .term-heading span').textContent = 'Unresolved';
  document.querySelector('#second-coverage .source').textContent = 'The available wording conflicts on this amount. Relevant source: Family Protection Plan synthetic policy, version v1, section coverage.accidental-death.';
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
