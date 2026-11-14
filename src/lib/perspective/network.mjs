export const PORTAL_REQUEST_TIMEOUT_MS = 20000;
export const CONNECTION_TIMEOUT_MESSAGE = 'The connection is taking too long. Check your internet connection and try again.';

// Bound authentication and read-only JSON requests. Mission writes and photo uploads keep their existing behavior.
export function createPortalFetch({ fetcher = (input, init) => globalThis.fetch(input, init), timeoutMs = PORTAL_REQUEST_TIMEOUT_MS } = {}) {
  return async function portalFetch(input, init = {}) {
    const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
    const method = (init.method || input.method || 'GET').toUpperCase();
    if (!url.pathname.startsWith('/auth/v1/') && !(url.pathname.startsWith('/rest/v1/') && ['GET','HEAD'].includes(method)))
      return fetcher(input, init);
    const parent = init.signal || input.signal;
    const controller = new AbortController();
    let timedOut = false;
    const cancel = () => controller.abort(parent.reason);
    if (parent?.aborted) cancel();
    else parent?.addEventListener('abort', cancel, { once: true });
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
    try {
      const response = await fetcher(input, { ...init, signal: controller.signal });
      // Keep the deadline through JSON body delivery, not just receipt of headers.
      const body = method === 'HEAD' || [204,205,304].includes(response.status) ? null : await response.arrayBuffer();
      const headers = new Headers(response.headers);
      headers.delete('content-encoding');
      headers.delete('content-length');
      return new Response(body, { status: response.status, statusText: response.statusText, headers });
    } catch (error) {
      if (timedOut) { const failure = new Error(CONNECTION_TIMEOUT_MESSAGE); failure.name = 'TimeoutError'; throw failure; }
      throw error;
    } finally {
      clearTimeout(timer);
      parent?.removeEventListener('abort', cancel);
    }
  };
}
