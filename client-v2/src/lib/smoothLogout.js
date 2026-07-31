let logoutInProgress = false;

const wait = milliseconds => new Promise(resolve => window.setTimeout(resolve, milliseconds));

/** Shows the shared transition, completes the server request, then leaves cleanly. */
export async function smoothLogout(request, destination = '/') {
  if (logoutInProgress) return;
  logoutInProgress = true;
  window.dispatchEvent(new Event('wondertravel:logout-start'));

  const startedAt = performance.now();
  try {
    await request();
  } catch {
    // Session state is cleared locally by the auth endpoint even if the network fails.
  }

  const remaining = Math.max(0, 850 - (performance.now() - startedAt));
  if (remaining) await wait(remaining);
  window.location.replace(destination);
}
