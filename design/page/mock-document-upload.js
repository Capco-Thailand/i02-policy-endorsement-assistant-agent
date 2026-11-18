const file = document.getElementById('document');
const button = document.getElementById('upload');
const result = document.getElementById('result');
file.addEventListener('change', () => { button.disabled = !file.files?.length; result.textContent = ''; });
button.addEventListener('click', () => {
  if (!file.files?.length) return;
  result.textContent = 'Uploading synthetic file…';
  button.disabled = true;
  setTimeout(() => { result.textContent = 'RECEIVED_MOCK — Synthetic file received for demonstration only. Its contents and suitability were not verified.'; }, 400);
});
