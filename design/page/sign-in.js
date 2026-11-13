const form = document.querySelector('#sign-in');
const signedOut = document.querySelector('#signed-out');
const signedIn = document.querySelector('#signed-in');
const error = document.querySelector('#error');
const policies = {
  alice: [{ name: 'Family Protection', id: 'POL-001', status: 'Active' }],
  bob: [{ name: 'Future Secure', id: 'POL-002', status: 'Active' }],
};
function returnToSignIn(message) {
  signedIn.hidden = true;
  signedOut.hidden = false;
  form.reset();
  error.hidden = !message;
  if (message) error.textContent = message;
  document.querySelector('#title').focus();
}
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const account = form.querySelector('#account').value.trim().toLowerCase();
  error.hidden = true;
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  button.textContent = 'Signing in…';
  window.setTimeout(() => {
    button.disabled = false;
    button.textContent = 'Sign in';
    if (form.querySelector('#password').value !== 'demo' || !policies[account]) {
      error.textContent = 'Account ID or password is incorrect.';
      error.hidden = false;
      error.focus();
      return;
    }
    document.querySelector('#customer-name').textContent = `Signed in as ${account === 'alice' ? 'Alice' : 'Bob'}`;
    document.querySelector('#policy-list').replaceChildren();
    for (const policy of policies[account]) {
      const row = document.createElement('div');
      row.className = 'policy-row';
      row.textContent = `${policy.name} · ${policy.id} · ${policy.status}`;
      document.querySelector('#policy-list').append(row);
    }
    signedOut.hidden = true;
    signedIn.hidden = false;
    document.querySelector('#policies-title').focus();
  }, 250);
});
document.querySelector('#sign-out').addEventListener('click', () => returnToSignIn(''));
document.querySelector('#expire').addEventListener('click', () => returnToSignIn('Your session expired. Sign in again.'));
