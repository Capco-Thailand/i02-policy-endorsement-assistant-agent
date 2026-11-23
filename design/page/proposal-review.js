const rejectDialog = document.querySelector('#reject-dialog');
const result = document.querySelector('#decision-result');
const actions = document.querySelector('#decision-actions');
const now = () => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
function recordDecision(decision) {
  result.hidden = false;
  result.classList.toggle('rejected', decision === 'REJECTED');
  result.textContent = `${decision === 'APPROVED' ? 'Approved' : 'Rejected'} · decision recorded ${now()}. Your underlying policy remains unchanged.`;
  actions.hidden = true;
}
document.querySelector('#approve').addEventListener('click', () => recordDecision('APPROVED'));
document.querySelector('#reject').addEventListener('click', () => rejectDialog.showModal());
document.querySelector('#cancel-reject').addEventListener('click', () => rejectDialog.close());
document.querySelector('#confirm-reject').addEventListener('click', () => { rejectDialog.close(); recordDecision('REJECTED'); });
rejectDialog.addEventListener('close', () => { if (!actions.hidden) document.querySelector('#reject').focus(); });

const recorded = new URLSearchParams(window.location.search);
if (recorded.get('decision') === 'APPROVED' || recorded.get('decision') === 'REJECTED') {
  const decision = recorded.get('decision');
  const timestamp = recorded.get('recorded');
  document.querySelector('.review-status').textContent = decision;
  recordDecision(decision);
  if (timestamp) result.textContent = `${decision} · decision recorded ${new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp))}. Your underlying policy remains unchanged.`;
}
