(function () {
  const trackEvent = (eventName, params = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href.startsWith('tel:')) {
      trackEvent('phone_click', { link_url: href, page_path: window.location.pathname });
    } else if (href.startsWith('mailto:')) {
      trackEvent('email_click', { link_url: href, page_path: window.location.pathname });
    } else if (href.includes('create-your-offer')) {
      trackEvent('offer_cta_click', { link_url: link.href, page_path: window.location.pathname, link_text: (link.textContent || '').trim() });
    }
  });

  const pathname = window.location.pathname.split('/').pop() || 'index.html';
  if (pathname === 'create-your-offer.html') {
    return;
  }

  const PROFILE_STORAGE_KEY = 'fchb-profile';
  const LEAD_DRAFT_STORAGE_KEY = 'fchb-lead-draft';
  const EXIT_INTENT_STORAGE_KEY = 'fchb-exit-intent-dismissed';
  const EXIT_INTENT_DEMO_QUERY_KEY = 'demoExitIntent';
  const VALID_SITUATIONS = {
    'major-repairs-needed': 'Major Repairs Needed',
    'foreclosure-pressure': 'Foreclosure Pressure',
    'inherited-property': 'Inherited Property',
    'unwanted-rental': 'Unwanted Rental',
    'urgent-timeline': 'Urgent Timeline',
    'probate-complexity': 'Probate Complexity',
    'divorce-transition': 'Divorce Transition',
    'vacant-home-costs': 'Vacant Home Costs'
  };

  const promptMap = {
    'major-repairs-needed': 'We will review the repair-heavy details before we call.',
    'foreclosure-pressure': 'We will prepare the fastest realistic next step for your timeline.',
    'inherited-property': 'We will tailor the callback around the estate and property condition.',
    'unwanted-rental': 'We will prepare around tenants, turnover, and your exit timeline.',
    'urgent-timeline': 'We will focus on speed, certainty, and the quickest realistic next move.',
    'probate-complexity': 'We will prepare a probate-aware next-step conversation.',
    'divorce-transition': 'We will keep the next-step conversation clear and low-pressure.',
    'vacant-home-costs': 'We will focus on holding-cost relief and a clean exit path.'
  };

  const readJson = (key) => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const writeJson = (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage is a convenience only.
    }
  };

  const readSessionFlag = (key) => {
    try {
      return window.sessionStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  };

  const writeSessionFlag = (key) => {
    try {
      window.sessionStorage.setItem(key, '1');
    } catch {
      // Session storage is a convenience only.
    }
  };

  const submitLeadCapture = async (payload) => {
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
      let errorMessage = 'We could not confirm your submission yet.';

      try {
        const payload = await response.json();
        if (payload && typeof payload.error === 'string' && payload.error.trim()) {
          errorMessage = payload.error.trim();
        }
      } catch {
        // Use the default message.
      }

      throw new Error(errorMessage);
    }

    return response.json().catch(() => ({ ok: true }));
  };

  const buildWidget = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const storedProfile = readJson(PROFILE_STORAGE_KEY) || {};
    const zip = (searchParams.get('zip') || storedProfile.zip || '').trim();
    const situation = (searchParams.get('situation') || storedProfile.situation || '').trim();

    if (!/^\d{5}$/.test(zip) || !VALID_SITUATIONS[situation]) {
      return null;
    }

    const cityInfo = typeof window.resolveFloridaCityByZip === 'function'
      ? window.resolveFloridaCityByZip(zip)
      : null;
    const cityName = cityInfo?.cityDisplayName || 'your area';
    const situationLabel = VALID_SITUATIONS[situation];
    const draft = readJson(LEAD_DRAFT_STORAGE_KEY) || {};

    const widget = document.createElement('aside');
    widget.className = 'sticky-lead-widget';
    widget.setAttribute('aria-label', 'Sticky lead capture');
    widget.innerHTML = `
    <div class="sticky-lead-shell" data-step="1">
      <div class="sticky-lead-top">
        <p class="sticky-lead-kicker">Step 2 of 2</p>
        <button class="sticky-lead-close" type="button" aria-label="Minimize step 2 form">Minimize</button>
      </div>
      <h3 class="sticky-lead-title">Continue with ${situationLabel} in ${cityName}</h3>
      <p class="sticky-lead-copy">${promptMap[situation]}</p>

      <form class="sticky-lead-form" novalidate>
        <section class="sticky-lead-page" data-page="1">
          <label for="sticky-lead-name">Full Name</label>
          <input id="sticky-lead-name" name="name" type="text" autocomplete="name" placeholder="Your name" value="${typeof draft.name === 'string' ? draft.name.replace(/"/g, '&quot;') : ''}" required />

          <label for="sticky-lead-phone">Phone Number</label>
          <input id="sticky-lead-phone" name="phone" type="tel" autocomplete="tel" placeholder="(407) 349-7118" value="${typeof draft.phone === 'string' ? draft.phone.replace(/"/g, '&quot;') : ''}" required />

          <div class="sticky-lead-nav">
            <button class="btn btn-primary sticky-lead-next" type="button">Next</button>
          </div>
        </section>

        <section class="sticky-lead-page" data-page="2" hidden>
          <label for="sticky-lead-address">Property Address</label>
          <input id="sticky-lead-address" name="address" type="text" autocomplete="street-address" placeholder="Street, City" value="${typeof draft.address === 'string' ? draft.address.replace(/"/g, '&quot;') : ''}" required />

          <label for="sticky-lead-timeline">Selling Timeline</label>
          <select id="sticky-lead-timeline" name="timeline" required>
            <option value="" ${!draft.timeline ? 'selected' : ''} disabled>Select timeline</option>
            <option value="asap" ${draft.timeline === 'asap' ? 'selected' : ''}>As soon as possible</option>
            <option value="30-days" ${draft.timeline === '30-days' ? 'selected' : ''}>Within 30 days</option>
            <option value="60-days" ${draft.timeline === '60-days' ? 'selected' : ''}>Within 60 days</option>
            <option value="flexible" ${draft.timeline === 'flexible' ? 'selected' : ''}>I'm flexible</option>
          </select>

          <div class="sticky-lead-context">
            <p><strong>ZIP:</strong> ${zip}</p>
            <p><strong>Situation:</strong> ${situationLabel}</p>
          </div>

          <div class="sticky-lead-nav sticky-lead-nav-split">
            <button class="btn btn-outline sticky-lead-back" type="button">Back</button>
            <button class="btn btn-primary sticky-lead-continue" type="button">Continue</button>
          </div>
          <a class="sticky-lead-call" href="tel:+1-407-349-7118" title="Call Florida Cash House Buyers now about ${situationLabel}">Call Instead</a>
        </section>

      <p class="sticky-lead-feedback" aria-live="polite"></p>
      </form>
    </div>
    <button class="sticky-lead-reopen" type="button" hidden>Open Step 2</button>
  `;
    document.body.appendChild(widget);

    const shell = widget.querySelector('.sticky-lead-shell');
    const feedback = widget.querySelector('.sticky-lead-feedback');
    const nextButton = widget.querySelector('.sticky-lead-next');
    const backButton = widget.querySelector('.sticky-lead-back');
    const continueButton = widget.querySelector('.sticky-lead-continue');
    const closeButton = widget.querySelector('.sticky-lead-close');
    const reopenButton = widget.querySelector('.sticky-lead-reopen');
    const nameInput = widget.querySelector('#sticky-lead-name');
    const phoneInput = widget.querySelector('#sticky-lead-phone');
    const addressInput = widget.querySelector('#sticky-lead-address');
    const timelineInput = widget.querySelector('#sticky-lead-timeline');

    const setStep = (step) => {
      shell.dataset.step = String(step);
      widget.querySelectorAll('.sticky-lead-page').forEach((page) => {
        page.hidden = page.dataset.page !== String(step);
      });
      feedback.textContent = '';
    };

    const persistDraft = () => {
      writeJson(LEAD_DRAFT_STORAGE_KEY, {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        address: addressInput.value.trim(),
        timeline: timelineInput.value,
        zip,
        situation
      });
    };

    const goToOfferPage = () => {
      persistDraft();

      const targetUrl = new URL('create-your-offer.html', window.location.href);
      targetUrl.searchParams.set('zip', zip);
      targetUrl.searchParams.set('situation', situation);
      window.location.href = targetUrl.toString();
    };

    nextButton.addEventListener('click', () => {
      if (!nameInput.value.trim() || !phoneInput.value.trim()) {
        feedback.textContent = 'Enter your name and phone number to continue.';
        return;
      }

      persistDraft();
      setStep(2);
    });

    backButton.addEventListener('click', () => {
      persistDraft();
      setStep(1);
    });

    continueButton.addEventListener('click', async () => {
      if (!addressInput.value.trim() || !timelineInput.value) {
        feedback.textContent = 'Enter the property address and timeline to continue.';
        return;
      }

      continueButton.disabled = true;
      continueButton.textContent = 'Sending...';
      feedback.textContent = 'Sending your details to Felix now...';

      try {
        trackEvent('lead_form_submit', { form_name: 'Sticky Lead Widget', page_path: window.location.pathname });
        await submitLeadCapture({
          source: 'sticky-lead-widget',
          formName: 'Sticky Lead Widget',
          fields: {
            full_name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            property_address: addressInput.value.trim(),
            selling_timeline: timelineInput.value,
            zip,
            situation: situationLabel
          }
        });

        trackEvent('generate_lead', { form_name: 'Sticky Lead Widget', page_path: window.location.pathname, situation: situationLabel, zip });
        feedback.textContent = 'Submitted. Felix received your details. Opening the detailed offer page...';
        window.setTimeout(() => {
          goToOfferPage();
        }, 900);
      } catch (error) {
        trackEvent('lead_form_error', { form_name: 'Sticky Lead Widget', page_path: window.location.pathname });
        feedback.textContent = error && error.message
          ? `${error.message} Please try again or call (407) 349-7118.`
          : 'We could not confirm your submission. Please try again or call (407) 349-7118.';
        continueButton.disabled = false;
        continueButton.textContent = 'Continue';
      }
    });

    closeButton.addEventListener('click', () => {
      shell.hidden = true;
      reopenButton.hidden = false;
    });

    reopenButton.addEventListener('click', () => {
      shell.hidden = false;
      reopenButton.hidden = true;
    });

    [nameInput, phoneInput, addressInput, timelineInput].forEach((input) => {
      input.addEventListener('input', persistDraft);
      input.addEventListener('change', persistDraft);
    });

    return widget;
  };

  const buildExitIntentPopup = () => {
    if (readSessionFlag(EXIT_INTENT_STORAGE_KEY)) {
      return null;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const isDemoMode = searchParams.get(EXIT_INTENT_DEMO_QUERY_KEY) === '1';

    const storedProfile = readJson(PROFILE_STORAGE_KEY) || {};
    const situation = VALID_SITUATIONS[storedProfile.situation]
      ? storedProfile.situation
      : '';
    const situationLabel = situation ? VALID_SITUATIONS[situation] : 'selling your house';
    const prompt = situation
      ? promptMap[situation]
      : 'Samuel can walk you through the next step and tell you whether a direct sale makes sense.';

    const overlay = document.createElement('div');
    overlay.className = 'exit-intent-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="exit-intent-dialog" role="dialog" aria-modal="true" aria-labelledby="exit-intent-title">
        <button class="exit-intent-close" type="button" aria-label="Close exit intent popup">Close</button>
        <div class="exit-intent-media">
          <img src="images/We buy Head shot.png" alt="Samuel Colón" />
        </div>
        <div class="exit-intent-copy">
          <p class="exit-intent-kicker">Before You Go</p>
          <h3 id="exit-intent-title">Talk to Samuel before you leave.</h3>
          <p class="exit-intent-text">If you have questions about ${situationLabel}, this is the fastest way to get a real answer from our team.</p>
          <p class="exit-intent-note">${prompt}</p>
          <div class="exit-intent-actions">
            <a class="btn btn-primary" href="tel:+1-407-349-7118" title="Call Samuel now at 407-349-7118">Call Samuel Now</a>
            <button class="btn btn-outline exit-intent-dismiss" type="button">Keep Browsing</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeButton = overlay.querySelector('.exit-intent-close');
    const dismissButton = overlay.querySelector('.exit-intent-dismiss');

    const closePopup = () => {
      overlay.hidden = true;
      writeSessionFlag(EXIT_INTENT_STORAGE_KEY);
    };

    const showPopup = () => {
      if (readSessionFlag(EXIT_INTENT_STORAGE_KEY) || overlay.hidden === false) {
        return;
      }

      overlay.hidden = false;
    };

    closeButton.addEventListener('click', closePopup);
    dismissButton.addEventListener('click', closePopup);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closePopup();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay.hidden === false) {
        closePopup();
      }
    });

    let armed = true;
    document.addEventListener('mouseout', (event) => {
      if (!armed || readSessionFlag(EXIT_INTENT_STORAGE_KEY)) {
        return;
      }

      if (event.clientY > 12) {
        return;
      }

      if (event.relatedTarget || event.toElement) {
        return;
      }

      armed = false;
      showPopup();
    });

    if (isDemoMode) {
      const demoButton = document.createElement('button');
      demoButton.type = 'button';
      demoButton.className = 'exit-intent-demo-button';
      demoButton.textContent = 'Show Exit Popup';
      demoButton.setAttribute('aria-label', 'Show exit intent popup demo');
      demoButton.addEventListener('click', () => {
        overlay.hidden = false;
      });
      document.body.appendChild(demoButton);
    }

    return overlay;
  };

  const mountWidget = () => {
    const existing = document.querySelector('.sticky-lead-widget');
    if (existing) {
      existing.remove();
    }
    buildWidget();
  };

  mountWidget();
  buildExitIntentPopup();
  window.addEventListener('fchb:profile-updated', mountWidget);
})();
