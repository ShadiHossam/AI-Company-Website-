(function() {
  var consent = localStorage.getItem('cookie_consent');

  window.hasCookieConsent = function() { return localStorage.getItem('cookie_consent') === 'accepted' || localStorage.getItem('cookie_consent') === 'customized'; };
  window.getCookiePrefs = function() {
    try { return JSON.parse(localStorage.getItem('cookie_prefs') || '{}'); } catch(e) { return {}; }
  };

  window.openCookieSettings = function() {
    var existing = document.getElementById('cookie-consent');
    if (existing) { existing.remove(); }
    buildCard();
    var c = document.getElementById('cookie-consent');
    requestAnimationFrame(function() {
      c.style.opacity = '1';
      c.style.transform = 'translateY(0)';
    });
  };

  if (consent === 'accepted' || consent === 'declined' || consent === 'customized') return;

  /* ── Card ── */
  function buildCard() {
    var card = document.createElement('div');
    card.id = 'cookie-consent';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', 'Cookie preferences');
    card.style.cssText = [
      'position:fixed;bottom:24px;left:24px;width:340px;max-width:calc(100vw - 48px)',
      'background:#00253b',
      'border:1px solid rgba(0,227,253,0.25);border-radius:16px;padding:22px 22px 20px',
      'z-index:9999;box-shadow:0 24px 64px rgba(0,0,0,0.45)',
      'color:#e2e8f0;font-family:inherit',
      'transform:translateY(20px);opacity:0;transition:opacity .3s ease,transform .3s ease'
    ].join(';');

    card.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;" aria-hidden="true">' +
          '<circle cx="12" cy="12" r="10" fill="rgba(0,227,253,0.12)" stroke="#00e3fd" stroke-width="1.5"/>' +
          '<circle cx="8.5" cy="10" r="1.5" fill="#00e3fd"/>' +
          '<circle cx="14" cy="8" r="1" fill="#00e3fd"/>' +
          '<circle cx="15" cy="14" r="1.5" fill="#00e3fd"/>' +
          '<circle cx="10" cy="15" r="1" fill="#00e3fd"/>' +
        '</svg>' +
        '<span style="font-size:0.9375rem;font-weight:700;color:#fff;letter-spacing:-0.01em;">Cookie Preferences</span>' +
      '</div>' +
      '<p id="cookie-consent-desc" style="margin:0 0 18px;font-size:0.8rem;line-height:1.65;color:rgba(255,255,255,0.50);">' +
        'We use cookies to analyse traffic &amp; improve your experience. ' +
        '<a href="/privacy" style="color:#00e3fd;text-decoration:none;border-bottom:1px solid rgba(0,227,253,0.35);">Privacy Policy</a>' +
      '</p>' +
      '<button id="accept-cookies" style="width:100%;background:linear-gradient(135deg,#00e3fd 0%,#00aacc 100%);color:#00253b;border:none;border-radius:8px;padding:10px 0;font-weight:700;cursor:pointer;font-size:0.875rem;margin-bottom:8px;transition:opacity .2s;">Accept All</button>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
        '<button id="customize-cookies" style="background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.75);border:1px solid rgba(255,255,255,0.14);border-radius:8px;padding:9px 0;font-weight:600;cursor:pointer;font-size:0.8125rem;transition:background .2s;">Customize</button>' +
        '<button id="decline-cookies" style="background:transparent;color:rgba(255,255,255,0.35);border:1px solid rgba(255,255,255,0.10);border-radius:8px;padding:9px 0;font-weight:600;cursor:pointer;font-size:0.8125rem;transition:color .2s;">Decline All</button>' +
      '</div>';

    document.body.appendChild(card);
    bindButtons();
  }

  function getCard() { return document.getElementById('cookie-consent'); }

  buildCard();
  requestAnimationFrame(function() {
    var c = getCard();
    c.style.opacity = '1';
    c.style.transform = 'translateY(0)';
  });

  /* ── Customize panel (inline, replaces card content) ── */
  function showCustomize() {
    var card = getCard();
    var prefs = window.getCookiePrefs();
    var analyticsOn = prefs.analytics !== false;
    var marketingOn = prefs.marketing !== false;

    card.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
        '<span style="font-size:0.9375rem;font-weight:700;color:#fff;">Manage Cookies</span>' +
        '<button id="cookie-back" aria-label="Back" style="background:none;border:none;color:rgba(255,255,255,0.35);cursor:pointer;font-size:1rem;padding:2px 6px;line-height:1;">&#8592; Back</button>' +
      '</div>' +
      buildRow('Essential', 'Required for the site to function.', false, true) +
      buildRow('Analytics', 'Help us understand how visitors use the site.', true, analyticsOn) +
      buildRow('Marketing', 'Used to show relevant ads and content.', true, marketingOn) +
      '<button id="save-cookie-prefs" style="width:100%;margin-top:18px;background:linear-gradient(135deg,#00e3fd 0%,#00aacc 100%);color:#00253b;border:none;border-radius:8px;padding:10px 0;font-weight:700;cursor:pointer;font-size:0.875rem;">Save Preferences</button>';

    /* wire up toggles */
    ['Analytics','Marketing'].forEach(function(name) {
      var lbl = getCard().querySelector('[data-toggle="' + name + '"]');
      if (!lbl) return;
      var cb = lbl.querySelector('input');
      var track = lbl.querySelector('.ck-track');
      var thumb = lbl.querySelector('.ck-thumb');
      function sync() {
        track.style.background = cb.checked ? '#00e3fd' : 'rgba(255,255,255,0.12)';
        thumb.style.transform  = cb.checked ? 'translateX(16px)' : 'none';
      }
      lbl.addEventListener('click', function(e) { e.preventDefault(); cb.checked = !cb.checked; sync(); });
      sync();
    });

    document.getElementById('cookie-back').onclick = function() { rebuildCard(); };
    document.getElementById('save-cookie-prefs').onclick = function() {
      var aCb = getCard().querySelector('[data-toggle="Analytics"] input');
      var mCb = getCard().querySelector('[data-toggle="Marketing"] input');
      localStorage.setItem('cookie_prefs', JSON.stringify({
        analytics: aCb ? aCb.checked : true,
        marketing: mCb ? mCb.checked : true
      }));
      dismiss('customized');
    };
  }

  function buildRow(label, desc, toggleable, checked) {
    return '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);">' +
      '<div style="flex:1;">' +
        '<div style="font-size:0.8125rem;font-weight:600;color:rgba(255,255,255,0.85);margin-bottom:2px;">' + label +
          (toggleable ? '' : ' <span style="font-size:0.68rem;background:rgba(0,227,253,0.15);color:#00e3fd;border-radius:4px;padding:1px 6px;font-weight:600;">Always on</span>') +
        '</div>' +
        '<div style="font-size:0.75rem;color:rgba(255,255,255,0.40);line-height:1.5;">' + desc + '</div>' +
      '</div>' +
      (toggleable
        ? '<label data-toggle="' + label + '" style="position:relative;display:inline-block;width:38px;height:22px;flex-shrink:0;margin-top:3px;cursor:pointer;">' +
            '<input type="checkbox"' + (checked ? ' checked' : '') + ' style="opacity:0;width:0;height:0;position:absolute;">' +
            '<span class="ck-track" style="position:absolute;inset:0;background:rgba(255,255,255,0.12);border-radius:22px;transition:background .25s;"></span>' +
            '<span class="ck-thumb" style="position:absolute;top:3px;left:3px;width:16px;height:16px;background:#fff;border-radius:50%;transition:transform .25s;pointer-events:none;"></span>' +
          '</label>'
        : '<span style="width:38px;flex-shrink:0;display:inline-block;"></span>') +
    '</div>';
  }

  function rebuildCard() {
    getCard().innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;" aria-hidden="true">' +
          '<circle cx="12" cy="12" r="10" fill="rgba(0,227,253,0.12)" stroke="#00e3fd" stroke-width="1.5"/>' +
          '<circle cx="8.5" cy="10" r="1.5" fill="#00e3fd"/><circle cx="14" cy="8" r="1" fill="#00e3fd"/>' +
          '<circle cx="15" cy="14" r="1.5" fill="#00e3fd"/><circle cx="10" cy="15" r="1" fill="#00e3fd"/>' +
        '</svg>' +
        '<span style="font-size:0.9375rem;font-weight:700;color:#fff;letter-spacing:-0.01em;">Cookie Preferences</span>' +
      '</div>' +
      '<p style="margin:0 0 18px;font-size:0.8rem;line-height:1.65;color:rgba(255,255,255,0.50);">' +
        'We use cookies to analyse traffic &amp; improve your experience. ' +
        '<a href="/privacy" style="color:#00e3fd;text-decoration:none;border-bottom:1px solid rgba(0,227,253,0.35);">Privacy Policy</a>' +
      '</p>' +
      '<button id="accept-cookies" style="width:100%;background:linear-gradient(135deg,#00e3fd 0%,#00aacc 100%);color:#00253b;border:none;border-radius:8px;padding:10px 0;font-weight:700;cursor:pointer;font-size:0.875rem;margin-bottom:8px;">Accept All</button>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
        '<button id="customize-cookies" style="background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.75);border:1px solid rgba(255,255,255,0.14);border-radius:8px;padding:9px 0;font-weight:600;cursor:pointer;font-size:0.8125rem;">Customize</button>' +
        '<button id="decline-cookies" style="background:transparent;color:rgba(255,255,255,0.35);border:1px solid rgba(255,255,255,0.10);border-radius:8px;padding:9px 0;font-weight:600;cursor:pointer;font-size:0.8125rem;">Decline All</button>' +
      '</div>';
    bindButtons();
  }

  function dismiss(choice) {
    var card = getCard();
    card.style.opacity = '0';
    card.style.transform = 'translateY(12px)';
    setTimeout(function() { if (getCard()) getCard().remove(); }, 300);
    localStorage.setItem('cookie_consent', choice);
    window.dispatchEvent(new CustomEvent('cookieConsent', { detail: { accepted: choice !== 'declined' } }));
  }

  function bindButtons() {
    document.getElementById('accept-cookies').onclick = function() { dismiss('accepted'); };
    document.getElementById('decline-cookies').onclick = function() { dismiss('declined'); };
    document.getElementById('customize-cookies').onclick = showCustomize;
  }

})();
