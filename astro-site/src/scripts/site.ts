/* Behavioral JS only — no DOM injection, no placeholder hydration */

function toggleServicesDropdown() {
  const btn = document.getElementById('services-btn');
  const menu = document.getElementById('services-menu');
  if (!btn || !menu) return;
  const isOpen = menu.classList.contains('open');
  menu.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
}

function toggleIndustriesDropdown() {
  const btn = document.getElementById('industries-btn');
  const menu = document.getElementById('industries-menu');
  if (!btn || !menu) return;
  const isOpen = menu.classList.contains('open');
  menu.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
}

document.addEventListener('click', function(e) {
  const sBtn = document.getElementById('services-btn');
  const sMenu = document.getElementById('services-menu');
  if (sBtn && sMenu && !sBtn.contains(e.target as Node) && !sMenu.contains(e.target as Node)) {
    sMenu.classList.remove('open');
    sBtn.classList.remove('open');
    sBtn.setAttribute('aria-expanded', 'false');
  }
  const iBtn = document.getElementById('industries-btn');
  const iMenu = document.getElementById('industries-menu');
  if (iBtn && iMenu && !iBtn.contains(e.target as Node) && !iMenu.contains(e.target as Node)) {
    iMenu.classList.remove('open');
    iBtn.classList.remove('open');
    iBtn.setAttribute('aria-expanded', 'false');
  }
});

// Escape closes whichever nav dropdown is open and returns focus to its toggle button.
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return;
  const sBtn = document.getElementById('services-btn');
  const sMenu = document.getElementById('services-menu');
  if (sMenu?.classList.contains('open')) {
    sMenu.classList.remove('open');
    sBtn?.classList.remove('open');
    sBtn?.setAttribute('aria-expanded', 'false');
    sBtn?.focus();
    return;
  }
  const iBtn = document.getElementById('industries-btn');
  const iMenu = document.getElementById('industries-menu');
  if (iMenu?.classList.contains('open')) {
    iMenu.classList.remove('open');
    iBtn?.classList.remove('open');
    iBtn?.setAttribute('aria-expanded', 'false');
    iBtn?.focus();
  }
});

function toggleMenu() {
  const m = document.getElementById('mobile-menu');
  const btn = document.getElementById('hamburger');
  if (!m || !btn) return;
  const isOpen = m.classList.contains('open');
  m.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
  document.getElementById('ham-icon')?.classList.toggle('hidden', !isOpen);
  document.getElementById('close-icon')?.classList.toggle('hidden', isOpen);
}

let isArabic = false;
function toggleLang() {
  isArabic = !isArabic;
  document.body.classList.toggle('rtl', isArabic);
  document.documentElement.setAttribute('lang', isArabic ? 'ar' : 'en');
  document.documentElement.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
}

// Capture UTM params into sessionStorage on page load
(function captureUTMs() {
  const params = new URLSearchParams(window.location.search);
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(k => {
    const v = params.get(k);
    if (v) sessionStorage.setItem(k, v);
  });
})();

// Element that had focus before the modal opened — restored on close so keyboard
// users land back where they were instead of at the top of the page.
let modalTriggerEl: HTMLElement | null = null;

function getModalFocusable(): HTMLElement[] {
  const box = document.querySelector('#modal .modal-box');
  if (!box) return [];
  return Array.from(
    box.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter(elFocusable => elFocusable.offsetParent !== null);
}

function openModal(el?: HTMLElement | Event) {
  const modal = document.getElementById('modal');
  if (!modal) return;
  // Resolve source from data-source attribute or calling element
  let source = 'unknown';
  if (el instanceof HTMLElement) {
    source = el.dataset.source ?? el.closest('[data-source]')?.getAttribute('data-source') ?? 'unknown';
  }
  const sourceField = document.getElementById('modal-source-field') as HTMLInputElement | null;
  if (sourceField) sourceField.value = source;
  modalTriggerEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Move keyboard focus into the dialog — aria-modal="true" only holds up if focus
  // actually goes there instead of staying on the trigger behind the overlay.
  getModalFocusable()[0]?.focus();
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  // Undo the success-screen swap from the Calendly listener so reopening starts clean on step 1.
  modal.querySelector('#step-success')?.classList.add('hidden');
  const ind = modal.querySelector('#step-indicator') as HTMLElement | null;
  if (ind) ind.style.display = '';
  goToStep(1);
  modalTriggerEl?.focus();
  modalTriggerEl = null;
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === document.getElementById('modal')) closeModal();
}

document.addEventListener('keydown', (e: KeyboardEvent) => {
  const modal = document.getElementById('modal');
  if (!modal || !modal.classList.contains('open')) return;
  if (e.key === 'Escape') { closeModal(); return; }
  // Trap Tab focus inside the open modal so keyboard users can't tab into the page behind it.
  if (e.key === 'Tab') {
    const focusable = getModalFocusable();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

// The modal's step divs aren't a real <form>, so the `required` attribute on
// its inputs never triggers native browser validation on its own — enforce it
// here before letting the user advance past a step with empty required fields.
function validateStep(n: number): boolean {
  const container = document.querySelector('#modal #step-' + n);
  if (!container) return true;
  const fields = container.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input[required], select[required], textarea[required]'
  );
  for (const field of fields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }
  return true;
}

let currentStep = 1;
function goToStep(n: number) {
  if (n > currentStep && !validateStep(currentStep)) return;
  document.querySelector('#modal #step-' + currentStep)?.classList.add('hidden');
  [1, 2, 3].forEach(i => {
    const dot = document.getElementById('dot-' + i);
    if (!dot) return;
    dot.classList.remove('active', 'done', 'inactive');
    if (i < n) dot.classList.add('done');
    else if (i === n) dot.classList.add('active');
    else dot.classList.add('inactive');
  });
  [1, 2].forEach(i => document.getElementById('line-' + i)?.classList.toggle('done', i < n));
  currentStep = n;
  document.querySelector('#modal #step-' + n)?.classList.remove('hidden');
}

// Submits the qualification data collected in steps 1-2, then reveals the Calendly
// widget in step 3. Best-effort: scheduling shouldn't be blocked by a CRM hiccup, so a
// failed submit doesn't stop the user from reaching the calendar.
async function continueToSchedule() {
  if (!validateStep(2)) return;
  const btn = document.querySelector('#modal [onclick="continueToSchedule()"]') as HTMLButtonElement | null;
  if (btn) btn.disabled = true;

  const waVal = (document.getElementById('whatsapp') as HTMLInputElement)?.value ?? '';
  const countryCode = (document.getElementById('country-code') as HTMLSelectElement)?.value ?? '+971';
  const payload = {
    full_name:      (document.getElementById('full-name') as HTMLInputElement)?.value?.trim() ?? '',
    company_name:   (document.getElementById('company') as HTMLInputElement)?.value?.trim() ?? '',
    work_email:     (document.getElementById('email') as HTMLInputElement)?.value?.trim() ?? '',
    whatsapp:       countryCode + waVal.replace(/^0+/, '').replace(/\D/g, ''),
    job_title:      (document.getElementById('job-title') as HTMLInputElement)?.value?.trim() ?? '',
    industry:       (document.getElementById('industry') as HTMLSelectElement)?.value ?? '',
    company_size:   (document.getElementById('company-size') as HTMLSelectElement)?.value ?? '',
    main_challenge: (document.getElementById('challenge') as HTMLTextAreaElement)?.value?.trim() ?? '',
    budget_range:   (document.getElementById('budget') as HTMLSelectElement)?.value ?? '',
    ai_experience:  (document.querySelector('input[name="ai-exp"]:checked') as HTMLInputElement)?.value ?? '',
    notes:          (document.getElementById('notes') as HTMLTextAreaElement)?.value?.trim() ?? '',
    source:         'modal',
    page_source:    (document.getElementById('modal-source-field') as HTMLInputElement)?.value ?? 'unknown',
    utm_source:     sessionStorage.getItem('utm_source') ?? '',
    utm_medium:     sessionStorage.getItem('utm_medium') ?? '',
    utm_campaign:   sessionStorage.getItem('utm_campaign') ?? '',
    website:        (document.getElementById('modal-honeypot') as HTMLInputElement)?.value ?? '',
  };

  try {
    await fetch('/api/submit-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silent — Calendly scheduling still proceeds even if the CRM lead write failed.
  }
  goToStep(3);
  if (btn) btn.disabled = false;
}

// Calendly posts this message to the parent window once a slot is actually booked.
// Scoped to the sitewide modal only — the /contact page's own embedded widget listens
// for the same event independently, guarding on whether the modal is open so the two
// success screens (which share DOM ids on that page) don't both fire at once.
window.addEventListener('message', (e: MessageEvent) => {
  if (!e.origin.includes('calendly.com')) return;
  if ((e.data as { event?: string })?.event !== 'calendly.event_scheduled') return;
  const modal = document.getElementById('modal');
  if (!modal?.classList.contains('open')) return;
  modal.querySelector('#step-3')?.classList.add('hidden');
  modal.querySelector('#step-success')?.classList.remove('hidden');
  const ind = modal.querySelector('#step-indicator') as HTMLElement | null;
  if (ind) ind.style.display = 'none';
});

window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 20);
});

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('[data-aos]').forEach(el => el.removeAttribute('data-aos'));
}

// Progressive-enhancement scroll reveal: tags common content blocks with
// .js-reveal (CSS-only fade/rise) and flips .is-visible as they enter view.
// No-op under prefers-reduced-motion; never hides content if JS fails
// because the reveal class is only ever added here, not in markup.
(function initScrollReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const selectors = [
    '.section-header', '.service-card', '.pain-card', '.industry-card',
    '.process-step', '.testimonial-card', '.faq-item', '.compare-wrap',
    '.cta-band', '.card', '.surface-card'
  ];
  const targets = document.querySelectorAll<HTMLElement>(selectors.join(','));
  if (!targets.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      el.style.transitionDelay = `${Math.min(i % 3, 2) * 80}ms`;
      requestAnimationFrame(() => el.classList.add('is-visible'));
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  targets.forEach((el) => { el.classList.add('js-reveal'); io.observe(el); });
})();

function subscribeToMailchimp(email: string, onSuccess: () => void) {
  // Mailchimp URL is stored in site_config and rendered into the page as a data attribute
  const mailchimpURL = document.getElementById('newsletter-mailchimp-url')?.dataset?.url ?? '';
  if (mailchimpURL && mailchimpURL !== 'YOUR_MAILCHIMP_AUDIENCE_POST_URL') {
    const data = new FormData();
    data.append('EMAIL', email);
    fetch(mailchimpURL, { method: 'POST', body: data, mode: 'no-cors' }).catch(() => {});
  }
  onSuccess();
}

function handleNewsletterSubmit(event: Event) {
  event.preventDefault();
  const email = (document.getElementById('newsletter-email') as HTMLInputElement)?.value;
  subscribeToMailchimp(email, () => {
    document.getElementById('newsletter-form-wrap')?.classList.add('hidden');
    document.getElementById('newsletter-success')?.classList.remove('hidden');
  });
}

function handleFooterNewsletterSubmit(event: Event) {
  event.preventDefault();
  const email = (document.getElementById('footer-newsletter-email') as HTMLInputElement)?.value;
  subscribeToMailchimp(email, () => {
    document.getElementById('footer-newsletter-form')?.classList.add('hidden');
    document.getElementById('footer-newsletter-success')?.classList.remove('hidden');
  });
}

function toggleFaq(btn: HTMLElement) {
  const body = btn.nextElementSibling as HTMLElement | null;
  const icon = btn.querySelector('.faq-icon');
  if (!body) return;
  const open = body.classList.toggle('open');
  icon?.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', String(open));
}

/* Expose to inline onclick handlers */
declare global {
  interface Window {
    toggleServicesDropdown: typeof toggleServicesDropdown;
    toggleIndustriesDropdown: typeof toggleIndustriesDropdown;
    toggleMenu: typeof toggleMenu;
    toggleLang: typeof toggleLang;
    openModal: typeof openModal;
    closeModal: typeof closeModal;
    handleOverlayClick: typeof handleOverlayClick;
    goToStep: typeof goToStep;
    continueToSchedule: typeof continueToSchedule;
    handleNewsletterSubmit: typeof handleNewsletterSubmit;
    handleFooterNewsletterSubmit: typeof handleFooterNewsletterSubmit;
    toggleFaq: typeof toggleFaq;
  }
}

Object.assign(window, {
  toggleServicesDropdown,
  toggleIndustriesDropdown,
  toggleMenu,
  toggleLang,
  openModal,
  closeModal,
  handleOverlayClick,
  goToStep,
  continueToSchedule,
  handleNewsletterSubmit,
  handleFooterNewsletterSubmit,
  toggleFaq,
});
