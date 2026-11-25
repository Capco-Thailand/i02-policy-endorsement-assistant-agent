const params = new URLSearchParams(location.search);
const state = params.get('state');
const message = document.getElementById('signin-state');
if (state === 'ended' || state === 'invalid' || state === 'error') {
  message.hidden = false;
  message.textContent =
    state === 'ended'
      ? 'Your session ended. Sign in again.'
      : state === 'invalid'
        ? 'Account ID or password was not recognized. Try again.'
        : 'Sign-in is unavailable. Try again later.';
  message.setAttribute('role', state === 'ended' ? 'status' : 'alert');
}
document.getElementById('signin-form').addEventListener('submit', (event) => {
  event.preventDefault();
  let firstInvalid;
  for (const name of ['account', 'password']) {
    const input = document.getElementById(name);
    const error = document.getElementById(`${name}-error`);
    error.hidden = Boolean(input.value.trim());
    input.setAttribute('aria-invalid', String(!error.hidden));
    if (!error.hidden && !firstInvalid) firstInvalid = input;
  }
  if (firstInvalid) firstInvalid.focus();
  else {
    message.hidden = false;
    message.textContent = 'This is a static preview. No session was created.';
    message.setAttribute('role', 'status');
  }
});
