const status = new URLSearchParams(location.search).get('status');
if (status === 'expired') {
  document.querySelector('#product').textContent = 'Classic Life Plan';
  document.querySelector('#policy-id').textContent = 'POL-NARIN-002';
  document.querySelector('#status').textContent = 'Expired';
  document.querySelector('#status').classList.add('expired');
  document.querySelector('#expiry').textContent = '31 December 2023';
}
if (status === 'unavailable' || status === 'loading') {
  document.querySelector('.record-heading').replaceWith(Object.assign(document.createElement('h1'), { className: 'page-title', textContent: status === 'loading' ? 'Loading policy details…' : 'This policy is unavailable.' }));
  document.querySelectorAll('.section').forEach(section => section.remove());
}
