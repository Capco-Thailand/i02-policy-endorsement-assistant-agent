const type = document.querySelector('#change-type');
const form = document.querySelector('#request-form');
const rows = document.querySelector('#beneficiary-rows');
const allocationError = document.querySelector('#allocation-error');
const formError = document.querySelector('#form-error');
let nextBeneficiaryId = 2;

if (new URLSearchParams(location.search).get('status') === 'expired') {
  document.querySelector('#policy-status').textContent = 'Expired';
  form.hidden = true;
  document.querySelector('#expired-state').hidden = false;
}

type.addEventListener('change', () => {
  document.querySelectorAll('[data-type]').forEach((section) => {
    const active = section.dataset.type === type.value;
    section.hidden = !active;
    section.disabled = !active;
  });
  allocationError.hidden = true;
  formError.hidden = true;
});

document.querySelector('#add-beneficiary').addEventListener('click', () => {
  const index = nextBeneficiaryId++;
  const row = document.createElement('div');
  row.className = 'beneficiary-row';
  row.innerHTML = `<p><label for="beneficiary-${index}">Beneficiary name</label><input id="beneficiary-${index}" name="beneficiaryName" required></p><p><label for="allocation-${index}">Allocation %</label><input id="allocation-${index}" name="allocation" type="number" min="0" max="100" step="any" required></p><button type="button" class="remove-beneficiary">Remove</button>`;
  rows.append(row);
  row.querySelector('input').focus();
});

rows.addEventListener('click', (event) => {
  if (!event.target.matches('.remove-beneficiary') || rows.children.length === 1) return;
  event.target.closest('.beneficiary-row').remove();
  allocationError.hidden = true;
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  allocationError.hidden = true;
  formError.hidden = true;
  if (!form.reportValidity()) return;
  if (type.value === 'BENEFICIARY') {
    const allocations = [...rows.querySelectorAll('[name="allocation"]')].map((input) => Number(input.value));
    const total = allocations.reduce((sum, amount) => sum + amount, 0);
    if (allocations.some((amount) => !Number.isFinite(amount) || amount <= 0) || Math.abs(total - 100) > 1e-9) {
      allocationError.hidden = false;
      allocationError.setAttribute('tabindex', '-1');
      allocationError.focus();
      return;
    }
  }
  form.hidden = true;
  const confirmation = document.querySelector('#confirmation');
  confirmation.hidden = false;
  confirmation.focus();
});
