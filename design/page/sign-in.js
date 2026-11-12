const notice = document.querySelector('#session-notice');
const error = document.querySelector('#form-error');
const password = document.querySelector('#password');
const form = document.querySelector('#sign-in-form');
const submit = document.querySelector('#submit');
const account = document.querySelector('#account-id');

function showState(state) {
  notice.hidden = true;
  error.hidden = true;
  if (state === 'invalid') {
    error.textContent = 'Sign-in failed. Check your account ID and password.';
    error.hidden = false;
  }
  for (const field of [account, password]) {
    if (state === 'invalid') field.setAttribute('aria-describedby', 'form-error');
    else field.removeAttribute('aria-describedby');
  }
  if (state === 'expired' || state === 'signed-out') {
    notice.textContent = state === 'expired'
      ? 'Your session ended. Sign in again to continue.'
      : 'You signed out.';
    notice.hidden = false;
  }
  document.querySelectorAll('[data-state]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.state === state));
  });
}

document.querySelectorAll('[data-state]').forEach((button) => {
  button.addEventListener('click', () => showState(button.dataset.state));
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (submit.disabled) return;
  showState('initial');
  submit.disabled = true;
  submit.textContent = 'Signing in…';
  window.setTimeout(() => {
    submit.disabled = false;
    submit.textContent = 'Sign in';
    password.value = '';
    showState('invalid');
    error.focus();
  }, 500);
});
