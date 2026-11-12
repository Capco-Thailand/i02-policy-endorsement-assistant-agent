export function safeDestination(destination: string | undefined): string {
  if (
    !destination ||
    !destination.startsWith('/') ||
    destination.startsWith('//') ||
    destination.includes('\\')
  ) {
    return '/policies';
  }
  try {
    const target = new URL(destination, 'http://pea.local');
    if (target.origin !== 'http://pea.local') return '/policies';
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return '/policies';
  }
}
