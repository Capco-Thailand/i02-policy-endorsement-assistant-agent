const form = document.querySelector('#sign-in-form');
const message = document.querySelector('#auth-message');
const password = document.querySelector('#password');
const submit = document.querySelector('#submit');
const states = {
  invalid: "We couldn't sign you in. Check your details and try again.",
  expired: 'Your session ended. Sign in again to continue.',
  unavailable: 'Sign-in is unavailable. Try again.',
};

function showState(state) {
  const pending = state === 'pending';
  submit.disabled = pending;
  submit.textContent = pending ? 'Signing in…' : 'Sign in';
  message.hidden = !states[state];
  message.textContent = states[state] || '';
  message.classList.toggle('info', state === 'expired');
  if (state === 'invalid' || state === 'unavailable') password.value = '';
  if (states[state]) message.focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  showState('invalid');
});

document.querySelectorAll('[data-state]').forEach((button) => {
  button.addEventListener('click', () => showState(button.dataset.state));
});
