const form = document.querySelector('#sign-in-form');
const message = document.querySelector('#form-message');
const account = document.querySelector('#account-id');
const password = document.querySelector('#password');
const submit = document.querySelector('#submit');

function showMessage(text, info = false) {
  message.textContent = text;
  message.classList.toggle('info', info);
  message.hidden = !text;
  if (text) message.focus();
}

function clearErrors() {
  for (const field of [account, password]) {
    field.removeAttribute('aria-invalid');
    document.querySelector(`#${field.id === 'account-id' ? 'account' : 'password'}-error`).hidden = true;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors();
  showMessage('');
  for (const field of [account, password]) {
    if (!field.value.trim()) {
      field.setAttribute('aria-invalid', 'true');
      document.querySelector(`#${field.id === 'account-id' ? 'account' : 'password'}-error`).hidden = false;
      field.focus();
      return;
    }
  }
  submit.disabled = true;
  submit.textContent = 'Signing in…';
  window.setTimeout(() => {
    submit.disabled = false;
    submit.textContent = 'Sign in';
    password.value = '';
    showMessage('Mockup only. No session was created.', true);
  }, 500);
});

document.querySelectorAll('[data-state]').forEach((button) => {
  button.addEventListener('click', () => {
    clearErrors();
    const state = button.dataset.state;
    const copy = {
      invalid: "We couldn't sign you in. Check your details and try again.",
      expired: 'Your session ended. Sign in again.',
      unavailable: 'Sign-in is temporarily unavailable. Try again shortly.',
      reset: '',
    };
    if (state === 'invalid' || state === 'expired') password.value = '';
    showMessage(copy[state], state === 'expired');
  });
});
