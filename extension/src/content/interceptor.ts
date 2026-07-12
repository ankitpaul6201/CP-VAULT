// This script is injected directly into the webpage context (main window context)
// It intercepts Fetch and XHR requests and relays relevant network payloads back to the content script.

(function () {
  const XHR = XMLHttpRequest.prototype;
  const send = XHR.send;
  const open = XHR.open;

  // Intercept XMLHttpRequest
  XHR.open = function (_method, url) {
    (this as any)._url = url;
    return open.apply(this, arguments as any);
  };

  XHR.send = function (_postData) {
    this.addEventListener('load', function () {
      try {
        const url = (this as any)._url;
        if (url && isTargetUrl(url.toString())) {
          dispatchPayload(url.toString(), this.responseText);
        }
      } catch (err) {
        // Suppress errors to not impact page performance
      }
    });
    return send.apply(this, arguments as any);
  };

  // Intercept Fetch API
  const originalFetch = window.fetch;
  window.fetch = async function (resource, _config) {
    const response = await originalFetch.apply(this, arguments as any);
    const clone = response.clone();
    
    try {
      let url = '';
      if (typeof resource === 'string') {
        url = resource;
      } else if (resource instanceof URL) {
        url = resource.toString();
      } else if (resource && typeof resource === 'object' && 'url' in resource) {
        url = (resource as Request).url;
      } else if (resource) {
        url = String(resource);
      }

      if (url && isTargetUrl(url)) {
        clone.text().then(text => {
          dispatchPayload(url, text);
        });
      }
    } catch (err) {
      // Suppress
    }

    return response;
  };

  function isTargetUrl(url: string): boolean {
    return (
      url.includes('/graphql') || // LeetCode GraphQL
      url.includes('/api/submissions-detail/') || // CodeChef API
      url.includes('/rest/contests/') || // HackerRank submissions
      url.includes('/submissions')
    );
  }

  function dispatchPayload(url: string, responseText: string) {
    window.postMessage({
      source: 'cp-vault-interceptor',
      url,
      responseText
    }, '*');
  }
})();
