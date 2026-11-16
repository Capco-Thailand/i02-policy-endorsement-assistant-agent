const form = document.querySelector('#sign-in-form');
const message = document.querySelector('#message');
const account = document.querySelector('#account');
const password = document.querySelector('#password');
const errors = { account: document.querySelector('#account-error'), password: document.querySelector('#password-error') };
function showMessage(text, info = false) {
  message.textContent = text;
  message.hidden = !text;
  message.classList.toggle('info', info);
  if (text) message.focus();
}
function clearErrors() {
  for (const [name, error] of Object.entries(errors)) {
    error.hidden = true;
    document.querySelector(`#${name}`).removeAttribute('aria-invalid');
  }
}
form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors();
  showMessage('');
  for (const field of [account, password]) {
    if (!field.value.trim()) {
      errors[field.name].hidden = false;
      field.setAttribute('aria-invalid', 'true');
      field.focus();
      return;
    }
  }
  password.value = '';
  showMessage("We couldn't sign you in. Check your details and try again.");
});
document.querySelectorAll('[data-state]').forEach((button) => button.addEventListener('click', () => {
  clearErrors();
  const states = {
    initial: ['', false],
    invalid: ["We couldn't sign you in. Check your details and try again.", false],
    expired: ['Your session ended. Sign in again.', true],
    unavailable: ['Sign-in is temporarily unavailable. Try again later.', true],
  };
  const [text, info] = states[button.dataset.state];
  showMessage(text, info);
}));
