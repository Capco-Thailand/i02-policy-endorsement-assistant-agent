const form = document.querySelector('#request-form');
const status = document.querySelector('#policy-status');
const expired = document.querySelector('#expired');
const confirmation = document.querySelector('#confirmation');
const error = document.querySelector('#error-summary');
const beneficiaryList = document.querySelector('#beneficiaries');
const total = document.querySelector('#allocation-total');
const selectedType = () => form.querySelector('input[name="changeType"]:checked')?.value;
function showType(type) {
  document.querySelectorAll('.request-fields').forEach((group) => group.hidden = group.dataset.type !== type);
  document.querySelector(`.request-fields[data-type="${type}"] h2`)?.focus();
}
form.querySelectorAll('input[name="changeType"]').forEach((input) => input.addEventListener('change', () => showType(input.value)));
function updateTotal() {
  const amount = [...beneficiaryList.querySelectorAll('input[name="allocation"]')].reduce((sum, input) => sum + (Number(input.value) || 0), 0);
  total.textContent = `Total allocation: ${amount}%`;
}
beneficiaryList.addEventListener('input', updateTotal);
beneficiaryList.addEventListener('click', (event) => {
  if (!event.target.matches('.remove-row')) return;
  event.target.closest('.beneficiary-row').remove();
  updateTotal();
});
document.querySelector('#add-beneficiary').addEventListener('click', () => {
  const row = beneficiaryList.firstElementChild?.cloneNode(true) || (() => { const node = document.createElement('div'); node.className = 'beneficiary-row'; node.innerHTML = '<label>Name <input name="beneficiaryName"></label><label>Allocation % <input name="allocation" type="number" min="1" max="100" step="1"></label><button type="button" class="remove-row">Remove</button>'; return node; })();
  row.querySelectorAll('input').forEach((input) => input.value = '');
  beneficiaryList.append(row);
  row.querySelector('input').focus();
  updateTotal();
});
function showError(message, field) {
  error.textContent = message;
  error.hidden = false;
  if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); } else error.focus();
}
form.addEventListener('submit', (event) => {
  event.preventDefault();
  error.hidden = true;
  form.querySelectorAll('[aria-invalid]').forEach((field) => field.removeAttribute('aria-invalid'));
  const type = selectedType();
  if (!type) return showError('Choose a change type.', form.querySelector('input[name="changeType"]'));
  if (type === 'BENEFICIARY') {
    const rows = [...beneficiaryList.querySelectorAll('.beneficiary-row')];
    if (!rows.length) return showError('Add at least one beneficiary.');
    for (const row of rows) {
      const name = row.querySelector('input[name="beneficiaryName"]');
      const amount = row.querySelector('input[name="allocation"]');
      if (!name.value.trim()) return showError('Enter every beneficiary name.', name);
      if (!Number.isInteger(Number(amount.value)) || Number(amount.value) <= 0) return showError('Enter a positive whole allocation percentage.', amount);
    }
    if (Number(total.textContent.match(/\d+/)?.[0]) !== 100) return showError('Beneficiary allocations must total 100%.');
  }
  if (type === 'ADDRESS' && !form.elements.address.value.trim()) return showError('Enter a correspondence address.', form.elements.address);
  if (type === 'FREQUENCY' && !form.elements.frequency.value) return showError('Choose a payment frequency.', form.elements.frequency);
  if (type === 'RIDER' && !form.querySelector('input[name="riderAction"]:checked')) return showError('Choose whether to add or remove the rider.');
  if (!form.elements.effectiveDate.value) return showError('Choose a requested effective date.', form.elements.effectiveDate);
  form.hidden = true;
  confirmation.hidden = false;
  confirmation.focus();
});
document.querySelectorAll('[data-preview]').forEach((button) => button.addEventListener('click', () => {
  const state = button.dataset.preview;
  const isExpired = state === 'expired';
  status.textContent = isExpired ? 'Expired' : 'Active';
  status.classList.toggle('expired', isExpired);
  expired.hidden = !isExpired;
  confirmation.hidden = state !== 'recorded';
  form.hidden = state !== 'active';
}));
