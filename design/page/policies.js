const state = new URLSearchParams(location.search).get('state');
const list = document.querySelector('.policy-list');
if (state === 'empty' || state === 'error' || state === 'loading') {
  const copy = { empty: 'No policies are linked to this account.', error: "We couldn't load your policies. Try again.", loading: 'Loading your policies…' };
  list.replaceWith(Object.assign(document.createElement('p'), { className: 'empty-note', textContent: copy[state] }));
  document.querySelector('.record-count').textContent = '';
}
