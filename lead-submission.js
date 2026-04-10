(function () {
  async function submitLeadCapture(payload) {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      keepalive: true,
      body: JSON.stringify({
        source: payload.source,
        formName: payload.formName,
        pageUrl: window.location.href,
        pageTitle: document.title,
        submittedAt: new Date().toISOString(),
        fields: payload.fields || {}
      })
    });

    if (!response.ok) {
      let errorMessage = 'Lead submission failed.';

      try {
        const payload = await response.json();
        if (payload && typeof payload.error === 'string' && payload.error.trim()) {
          errorMessage = payload.error.trim();
        }
      } catch {
        // Fall back to the default message.
      }

      throw new Error(errorMessage);
    }

    return response.json().catch(() => ({ ok: true }));
  }

  window.submitLeadCapture = submitLeadCapture;
})();
