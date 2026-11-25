const state = new URLSearchParams(location.search).get('state');
const content = document.getElementById('list-content');
if (state === 'loading')
  content.innerHTML =
    '<p class="fr16-state" role="status">Loading your policies…</p>';
if (state === 'empty')
  content.innerHTML =
    '<p class="fr16-state" role="status">No policies are linked to this account.</p>';
if (state === 'error')
  content.innerHTML =
    '<div class="fr16-state" role="alert"><p>Could not load your policies. Try again.</p><a href="fr-16-policy-list.html">Try again</a></div>';
if (state === 'ended')
  content.innerHTML =
    '<div class="fr16-state" role="status"><p>Your session ended. Sign in again to view your policies.</p><a href="fr-16-sign-in.html?state=ended">Sign in</a></div>';
