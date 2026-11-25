const sections = [...document.querySelectorAll('[data-state]')];
const buttons = [...document.querySelectorAll('[data-preview]')];
const count = document.querySelector('.fr18-section-head span');
const secondRecord = document.querySelector('[data-second-record]');

function show(state) {
  for (const section of sections)
    section.hidden = section.dataset.state !== state && !(section.dataset.state === 'multiple' && state === 'one');
  for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.preview === state));
  secondRecord.hidden = state === 'one';
  count.textContent = state === 'one' ? '1 record' : '2 records';
}

for (const button of buttons) button.addEventListener('click', () => show(button.dataset.preview));
document.querySelector('#fr18-retry').addEventListener('click', () => show('multiple'));
show(new URLSearchParams(location.search).get('state') || 'multiple');
