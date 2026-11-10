const message = document.querySelector('#auth-message');
const password = document.querySelector('#password');
const form = document.querySelector('#auth-form');

function showState(state) {
  const content = {
    invalid: ['Sign-in failed. Check your account ID and password.', false],
    expired: ['Your session ended. Sign in again to continue.', true],
    'signed-out': ['You signed out.', true],
  }[state];

  message.hidden = !content;
  message.textContent = content ? content[0] : '';
  message.classList.toggle('info', Boolean(content && content[1]));
  if (state === 'invalid') password.value = '';
}

document.querySelectorAll('[data-state]').forEach((button) => {
  button.addEventListener('click', () => showState(button.dataset.state));
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  showState('invalid');
});
