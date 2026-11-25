const change = document.querySelector('#change');
const params = new URLSearchParams(location.search);
const chosen = params.get('change');
if (['frequency', 'beneficiary', 'address', 'rider'].includes(chosen))
  change.value = chosen;
const show = () =>
  document.querySelectorAll('[data-change]').forEach((part) => {
    part.hidden = part.dataset.change !== change.value;
  });
change.addEventListener('change', show);
show();
const frequency = document.querySelector('#frequency');
frequency.addEventListener('change', () => {
  document.querySelector('#frequency-preview').textContent = frequency.value;
});
const updateTotal = () => {
  const values = [
    ...document.querySelectorAll('#beneficiary-fields input[type="number"]'),
  ];
  const total = values.reduce(
    (sum, input) => sum + (Number(input.value) || 0),
    0,
  );
  document.querySelector('#allocation-total').textContent = `${total}%`;
  document.querySelector('#allocation-state').textContent =
    total === 100 ? 'Exactly 100%' : total < 100 ? 'Under 100%' : 'Over 100%';
};
document
  .querySelector('#beneficiary-fields')
  .addEventListener('input', updateTotal);
let nextBeneficiary = 3;
document.querySelector('#add-beneficiary').addEventListener('click', () => {
  const number = nextBeneficiary++;
  const row = document.createElement('div');
  row.className = 'fr17-beneficiary';
  row.innerHTML = `<div class="fr17-field"><label for="beneficiary-${number}">Beneficiary ${number}</label><input id="beneficiary-${number}" /></div><div class="fr17-field"><label for="percent-${number}">Allocation %</label><input id="percent-${number}" type="number" min="0" max="100" value="0" /></div><button class="fr17-remove" type="button">Remove beneficiary ${number}</button>`;
  row.querySelector('button').addEventListener('click', () => {
    row.remove();
    updateTotal();
  });
  document.querySelector('#beneficiary-rows').append(row);
  row.querySelector('input').focus();
  updateTotal();
});
const state = params.get('state');
if (state) {
  const messages = {
    invalid: 'Enter a valid requested value before recording.',
    expired: 'This policy is expired. Change requests are unavailable.',
    error:
      'Could not record the request. Your entries remain available; try again.',
  };
  if (messages[state]) {
    const note = document.createElement('p');
    note.className = 'fr17-error';
    note.setAttribute('role', 'alert');
    note.textContent = messages[state];
    document.querySelector('form').prepend(note);
    if (state === 'expired')
      document.querySelector('form button[type="submit"]').disabled = true;
  }
}
