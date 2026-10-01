/* GitHub Pages is static; this adapter keeps the existing shared demo API. */
(() => {
  const backend = 'https://rocket-education-knowledge-hub.zackus522.chatgpt.site';
  const originalFetch = window.fetch.bind(window);
  const map = (value, outgoing = false) => {
    if (Array.isArray(value)) return value.map(v => map(v, outgoing));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,map(v,outgoing)]));
    if (typeof value !== 'string') return value;
    if (outgoing && value.startsWith(backend + '/')) return value.slice(backend.length);
    if (!outgoing && /^\/(?:brand|api\/files|files)\//.test(value)) return backend + value;
    return value;
  };
  window.fetch = async (input, init) => {
    const original = input instanceof Request ? input.url : String(input);
    const url = new URL(original, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith('/api/')) return originalFetch(input, init);
    const options = {...init};
    if (typeof options.body === 'string') options.body = JSON.stringify(map(JSON.parse(options.body),true));
    const response = await originalFetch(backend + url.pathname + url.search, options);
    if (!response.headers.get('content-type')?.includes('application/json')) return response;
    return new Response(JSON.stringify(map(await response.json())),{status:response.status,statusText:response.statusText,headers:response.headers});
  };
})();
