const form = document.querySelector('#request-form');
const change = document.querySelector('#change');
const result = document.querySelector('#result');
const types = ['beneficiary', 'address', 'frequency', 'rider'];
change.addEventListener('change', () => {
  for (const type of types) {
    const section = document.getElementById(type);
    const active = type === change.value;
    section.classList.toggle('hidden', !active);
    for (const input of section.querySelectorAll('input, select, textarea')) input.required = active;
  }
});
form.addEventListener('submit', event => {
  event.preventDefault();
  result.classList.remove('hidden');
  result.textContent = 'Preview only: a submitted request would receive a request ID and remain pending checks. Coverage is unchanged.';
  result.focus();
});
