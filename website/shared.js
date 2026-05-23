/* ── Shared components: Navbar, Footer, Modal, Scripts ── */
/* Include this file in every page via <script src="../shared.js"></script> */

// ─── COMPANY LAUNCH CONFIGURATION ───
// Change these details to instantly configure the branding across the entire site!
const COMPANY_CONFIG = {
  name: "Aegis AI",                   // Your Company Name
  domain: "aegisai.ae",               // Your Domain Name (.ae suggested)
  phone: "+971 4 321 8888",           // Your Dubai Phone/Office Number
  whatsapp: "971501234567",           // Your WhatsApp Business number (digits only, e.g. 97150xxxxxxx)
  email: "hello@aegisai.ae",          // Your Contact Email address
  linkedinSlug: "aegis-ai-dubai"      // Your LinkedIn company profile slug
};


/* Determine relative path prefix — works on both file:// and http:// */
const PATH = (function () {
  const p = window.location.pathname;
  if (/\/(pages|services|industries|products|blog)\//.test(p)) return '../';
  return './';
})();

/* ─── Inject Navbar ─── */
document.addEventListener('DOMContentLoaded', () => {

  /* Inject nav-link styles into <head> */
  const navStyle = document.createElement('style');
  navStyle.textContent = `
    .nav-link { color: rgba(255,255,255,0.60); font-weight: 500; transition: color .2s; text-decoration: none; }
    .nav-link:hover { color: #FFFFFF; }
    .mobile-nav-link { color: rgba(255,255,255,0.70); font-weight: 500; text-decoration: none; font-size: 1rem; display: block; }
    .mobile-nav-link:hover { color: #FFFFFF; }
    .lang-btn-dark { display:flex; align-items:center; gap:.375rem; font-size:.875rem; font-weight:600; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:100px; padding:.375rem .875rem; color:rgba(255,255,255,0.70); cursor:pointer; transition:background .2s,color .2s; }
    .lang-btn-dark:hover { background:rgba(255,255,255,0.10); color:#FFFFFF; }
    .meeting-option { border:1px solid rgba(255,255,255,0.10); border-radius:.75rem; cursor:pointer; text-align:center; padding:.75rem .5rem; transition:border-color .2s,background .2s; }
    .meeting-option:hover { border-color:rgba(37,99,235,0.40); background:rgba(37,99,235,0.06); }
  `;
  document.head.appendChild(navStyle);

  const nav = document.getElementById('navbar');
  if (nav) {
    nav.innerHTML = `
    <div class="container flex items-center justify-between h-18 py-3">
      <a href="${PATH}index.html" class="flex items-center gap-2 cursor-pointer" aria-label="Home">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background:linear-gradient(135deg,#2563EB,#0EA5E9);">
          <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>
        </div>
        <span class="font-bold text-xl text-white">[COMPANY NAME]</span>
      </a>
      <div class="hidden md:flex items-center gap-7">
        <a href="${PATH}pages/services.html"       class="nav-link text-sm">Services</a>
        <a href="${PATH}pages/products.html"      class="nav-link text-sm">Products</a>
        <a href="${PATH}pages/about.html"         class="nav-link text-sm">About</a>
        <a href="${PATH}pages/blog.html"          class="nav-link text-sm">Blog</a>
      </div>
      <div class="hidden md:flex items-center gap-3">
        <button onclick="toggleLang()" id="lang-btn" class="lang-btn-dark" style="display: none !important;" aria-label="Switch language">
          <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4" stroke="currentColor" stroke-width="2"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
          <span id="lang-label">EN | عربي</span>
        </button>
        <button onclick="openModal()" class="btn-primary text-sm py-2.5 px-5">Contact Sales</button>
      </div>
      <button id="hamburger" onclick="toggleMenu()" class="md:hidden p-2 rounded-lg cursor-pointer" style="background:rgba(255,255,255,0.06);" aria-label="Open menu" aria-expanded="false">
        <svg id="ham-icon" viewBox="0 0 24 24" fill="none" class="w-6 h-6" stroke="rgba(255,255,255,0.80)" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        <svg id="close-icon" viewBox="0 0 24 24" fill="none" class="w-6 h-6 hidden" stroke="rgba(255,255,255,0.80)" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div id="mobile-menu" class="md:hidden" style="border-top:1px solid rgba(255,255,255,0.06);background:rgba(9,9,11,0.98);">
      <div class="container py-4 flex flex-col gap-4">
        <a href="${PATH}pages/services.html"  onclick="toggleMenu()" class="mobile-nav-link">Services</a>
        <a href="${PATH}pages/products.html"  onclick="toggleMenu()" class="mobile-nav-link">Products</a>
        <a href="${PATH}pages/about.html"     onclick="toggleMenu()" class="mobile-nav-link">About</a>
        <a href="${PATH}pages/blog.html"      onclick="toggleMenu()" class="mobile-nav-link">Blog</a>
        <div class="flex gap-3 pt-2">
          <button onclick="toggleLang()" class="lang-btn-dark flex-1 justify-center" style="display: none !important;">EN | عربي</button>
          <button onclick="openModal()" class="flex-1 btn-primary justify-center text-sm py-2.5">Contact Sales</button>
        </div>
      </div>
    </div>`;
  }

  /* ─── Inject Footer ─── */
  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.innerHTML = `
    <div class="container py-16">
      <div class="grid md:grid-cols-4 gap-10 mb-12">
        <div class="md:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:linear-gradient(135deg,#2563EB,#0EA5E9);">
              <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12"/></svg>
            </div>
            <span class="text-white font-bold text-lg">[COMPANY NAME]</span>
          </div>
          <p class="text-white/40 text-sm leading-relaxed mb-5">We don't just build AI for you — we make your business AI-ready.</p>
            <a href="https://www.linkedin.com/company/[COMPANY-SLUG]" class="w-9 h-9 rounded-lg bg-white/5 hover:bg-indigo-500/20 flex items-center justify-center transition-colors cursor-pointer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4" stroke="rgba(255,255,255,0.60)" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="https://wa.me/971XXXXXXXXX" class="w-9 h-9 rounded-lg bg-white/5 hover:bg-green-500/20 flex items-center justify-center transition-colors cursor-pointer" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4" stroke="rgba(255,255,255,0.60)" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
            </a>
          </div>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Services</h4>
          <ul class="space-y-2.5">
            <li><a href="${PATH}services/custom-ai-development.html" class="text-white/45 hover:text-white text-sm transition-colors cursor-pointer">Custom AI Development</a></li>
            <li><a href="${PATH}services/ai-training.html"           class="text-white/45 hover:text-white text-sm transition-colors cursor-pointer">AI Training & Workshops</a></li>
            <li><a href="${PATH}services/ai-strategy.html"           class="text-white/45 hover:text-white text-sm transition-colors cursor-pointer">AI Strategy Consulting</a></li>
            <li><a href="${PATH}pages/pricing.html"                  class="text-white/45 hover:text-white text-sm transition-colors cursor-pointer">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Industries</h4>
          <ul class="space-y-2.5">
            <li><a href="${PATH}industries/real-estate.html"   class="text-white/45 hover:text-white text-sm transition-colors cursor-pointer">AI for Real Estate</a></li>
            <li><a href="${PATH}industries/retail.html"        class="text-white/45 hover:text-white text-sm transition-colors cursor-pointer">AI for Retail</a></li>
            <li><a href="${PATH}industries/hospitality.html"   class="text-white/45 hover:text-white text-sm transition-colors cursor-pointer">AI for Hospitality</a></li>
            <li><a href="${PATH}industries/logistics.html"     class="text-white/45 hover:text-white text-sm transition-colors cursor-pointer">AI for Logistics</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Contact</h4>
          <ul class="space-y-3">
            <li class="flex items-start gap-2.5">
              <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4 flex-shrink-0 mt-0.5" stroke="#60A5FA" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 10a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>
              <span class="text-white/45 text-sm">+971 XX XXX XXXX</span>
            </li>
            <li class="flex items-start gap-2.5">
              <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4 flex-shrink-0 mt-0.5" stroke="#60A5FA" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span class="text-white/45 text-sm">hello@[domain].ae</span>
            </li>
            <li class="flex items-start gap-2.5">
              <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4 flex-shrink-0 mt-0.5" stroke="#60A5FA" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span class="text-white/45 text-sm">Dubai, UAE</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style="border-top:1px solid rgba(255,255,255,0.08);">
        <p class="text-white/30 text-sm">© 2025 [COMPANY NAME]. All rights reserved. Dubai, UAE.</p>
        <div class="flex gap-5">
          <a href="${PATH}pages/privacy.html" class="text-white/30 hover:text-white/60 text-sm transition-colors cursor-pointer">Privacy Policy</a>
          <a href="${PATH}pages/terms.html"   class="text-white/30 hover:text-white/60 text-sm transition-colors cursor-pointer">Terms of Service</a>
        </div>
      </div>
    </div>`;
  }

  /* ─── Inject Modal ─── */
  const modalHTML = `
  <div id="modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" onclick="handleOverlayClick(event)">
    <div class="modal-box">
      <div class="flex items-center justify-between p-6" style="border-bottom:1px solid rgba(255,255,255,0.08);">
        <div>
          <h2 id="modal-title" class="text-xl font-bold text-white">Book Your Free Consultation</h2>
          <p class="text-sm mt-0.5" style="color:rgba(255,255,255,0.45);">30-minute strategy call · No sales pressure</p>
        </div>
        <button onclick="closeModal()" class="w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer" style="background:rgba(255,255,255,0.08);" onmouseover="this.style.background='rgba(255,255,255,0.14)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4" stroke="rgba(255,255,255,0.60)" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="px-6 pt-5 pb-0" id="step-indicator">
        <div class="flex items-center">
          <div class="step-dot active" id="dot-1">1</div>
          <div class="step-line" id="line-1"></div>
          <div class="step-dot inactive" id="dot-2">2</div>
          <div class="step-line" id="line-2"></div>
          <div class="step-dot inactive" id="dot-3">3</div>
        </div>
        <div class="flex justify-between mt-1.5 text-xs font-medium" style="color:rgba(255,255,255,0.40);">
          <span>About You</span><span>Your Business</span><span>Schedule</span>
        </div>
      </div>
      <!-- Step 1 -->
      <div id="step-1" class="p-6">
        <h3 class="font-bold text-white mb-5">Tell us about yourself</h3>
        <div class="space-y-4">
          <div class="grid sm:grid-cols-2 gap-4">
            <div><label class="form-label" for="full-name">Full Name <span class="text-red-400">*</span></label><input id="full-name" type="text" class="form-input" placeholder="Ahmed Al Mansouri" required /></div>
            <div><label class="form-label" for="company">Company Name <span class="text-red-400">*</span></label><input id="company" type="text" class="form-input" placeholder="Your Company LLC" required /></div>
          </div>
          <div><label class="form-label" for="email">Email Address <span class="text-red-400">*</span></label><input id="email" type="email" class="form-input" placeholder="ahmed@company.ae" required /></div>
          <div><label class="form-label" for="whatsapp">WhatsApp Number <span class="text-red-400">*</span></label>
            <div class="flex"><span class="flex items-center px-3 text-sm font-medium" style="border:1px solid rgba(255,255,255,0.10);border-right:none;border-radius:8px 0 0 8px;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.50);">+971</span><input id="whatsapp" type="tel" class="form-input" style="border-radius:0 8px 8px 0;" placeholder="50 123 4567" required /></div>
          </div>
          <div><label class="form-label" for="job-title">Job Title / Role</label><input id="job-title" type="text" class="form-input" placeholder="CEO, Operations Manager…" /></div>
        </div>
        <div class="mt-6 flex justify-end"><button onclick="goToStep(2)" class="btn-primary">Continue <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button></div>
      </div>
      <!-- Step 2 -->
      <div id="step-2" class="p-6 hidden">
        <h3 class="font-bold text-white mb-5">Tell us about your business</h3>
        <div class="space-y-4">
          <div class="grid sm:grid-cols-2 gap-4">
            <div><label class="form-label" for="industry">Industry <span class="text-red-400">*</span></label>
              <select id="industry" class="form-select" required><option value="">Select…</option><option>Real Estate & Property</option><option>Retail & E-commerce</option><option>Hospitality & Tourism</option><option>Logistics & Supply Chain</option><option>Healthcare</option><option>Finance & Banking</option><option>Other</option></select>
            </div>
            <div><label class="form-label" for="company-size">Company Size</label>
              <select id="company-size" class="form-select"><option value="">Select…</option><option>1–20 employees</option><option>21–100 employees</option><option>101–500 employees</option><option>500+ employees</option></select>
            </div>
          </div>
          <div><label class="form-label" for="challenge">Main challenge <span class="text-red-400">*</span></label><textarea id="challenge" class="form-textarea" rows="3" placeholder="e.g. We spend too much time on manual tasks…" required></textarea></div>
          <div><label class="form-label" for="budget">Budget Range</label>
            <select id="budget" class="form-select"><option value="">Select…</option><option>Exploring — no budget set</option><option>AED 10,000 – 50,000</option><option>AED 50,000 – 200,000</option><option>AED 200,000+</option></select>
          </div>
          <div><label class="form-label">Tried AI tools before?</label>
            <div class="flex gap-3 mt-1">
              <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="ai-exp" value="yes" style="accent-color:#2563EB"/> <span class="text-sm" style="color:rgba(255,255,255,0.70);">Yes</span></label>
              <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="ai-exp" value="no"  style="accent-color:#2563EB"/> <span class="text-sm" style="color:rgba(255,255,255,0.70);">No</span></label>
              <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="ai-exp" value="some" style="accent-color:#2563EB"/> <span class="text-sm" style="color:rgba(255,255,255,0.70);">We use some</span></label>
            </div>
          </div>
        </div>
        <div class="mt-6 flex justify-between"><button onclick="goToStep(1)" class="btn-outline-sky text-sm py-2.5 px-5">← Back</button><button onclick="goToStep(3)" class="btn-primary">Continue <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button></div>
      </div>
      <!-- Step 3 -->
      <div id="step-3" class="p-6 hidden">
        <h3 class="font-bold text-white mb-5">Schedule your call</h3>
        <div class="space-y-4">
          <div><label class="form-label">Meeting type</label>
            <div class="grid grid-cols-3 gap-2 mt-1">
              <label class="meeting-option flex flex-col items-center gap-1.5"><input type="radio" name="meeting-type" value="video" style="accent-color:#2563EB" checked/><svg viewBox="0 0 24 24" fill="none" class="w-5 h-5" stroke="#60A5FA" stroke-width="1.8"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg><span class="text-xs font-medium" style="color:rgba(255,255,255,0.70);">Video Call</span></label>
              <label class="meeting-option flex flex-col items-center gap-1.5"><input type="radio" name="meeting-type" value="inperson" style="accent-color:#2563EB"/><svg viewBox="0 0 24 24" fill="none" class="w-5 h-5" stroke="#60A5FA" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/></svg><span class="text-xs font-medium" style="color:rgba(255,255,255,0.70);">In-Person Dubai</span></label>
              <label class="meeting-option flex flex-col items-center gap-1.5"><input type="radio" name="meeting-type" value="phone" style="accent-color:#2563EB"/><svg viewBox="0 0 24 24" fill="none" class="w-5 h-5" stroke="#60A5FA" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 10a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg><span class="text-xs font-medium" style="color:rgba(255,255,255,0.70);">Phone Call</span></label>
            </div>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div><label class="form-label" for="pref-date">Preferred Date</label><input id="pref-date" type="date" class="form-input" /></div>
            <div><label class="form-label" for="pref-time">Preferred Time</label>
              <select id="pref-time" class="form-select"><option value="">Select…</option><option>Morning (9am–12pm)</option><option>Afternoon (12pm–5pm)</option><option>Evening (5pm–7pm)</option></select>
            </div>
          </div>
          <div><label class="form-label" for="notes">Additional notes (optional)</label><textarea id="notes" class="form-textarea" rows="2" placeholder="Any questions or topics you'd like to cover…"></textarea></div>
          <div class="flex items-start gap-3 rounded-xl p-3.5" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.20);">
            <svg viewBox="0 0 24 24" fill="#F59E0B" class="w-5 h-5 flex-shrink-0 mt-0.5"><path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.25C17.25 21.15 21 16.25 21 11V5l-9-4z"/></svg>
            <p class="text-xs leading-relaxed" style="color:#FDE68A;"><strong>100% Risk-Free:</strong> If we build something you're not happy with, you get a full refund. No questions asked.</p>
          </div>
        </div>
        <div class="mt-6 flex justify-between"><button onclick="goToStep(2)" class="btn-outline-sky text-sm py-2.5 px-5">← Back</button><button onclick="submitForm()" class="btn-primary">Confirm Booking <svg viewBox="0 0 24 24" fill="#F59E0B" class="w-4 h-4"><path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.25C17.25 21.15 21 16.25 21 11V5l-9-4z"/></svg></button></div>
      </div>
      <!-- Success -->
      <div id="step-success" class="p-8 text-center hidden">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style="background:rgba(34,197,94,0.12);"><svg viewBox="0 0 24 24" fill="none" class="w-8 h-8" stroke="#4ADE80" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg></div>
        <h3 class="text-2xl font-bold text-white mb-3">You're Booked!</h3>
        <p class="mb-2" style="color:rgba(255,255,255,0.65);">We'll reach out within <strong class="text-white">4 hours</strong> to confirm your slot.</p>
        <p class="text-sm mb-6" style="color:rgba(255,255,255,0.40);">Check your WhatsApp and email for confirmation.</p>
        <div class="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium mb-6" style="background:rgba(245,158,11,0.10);color:#FDE68A;">
          <svg viewBox="0 0 24 24" fill="#F59E0B" class="w-4 h-4"><path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.25C17.25 21.15 21 16.25 21 11V5l-9-4z"/></svg>
          Your consultation is 100% free — no commitment required.
        </div>
        <button onclick="closeModal()" class="btn-outline-sky w-full justify-center">Close</button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  /* Navbar scroll */
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
  });

  /* Reduced motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-aos]').forEach(el => el.removeAttribute('data-aos'));
  }

  // ─── Hydrate all placeholders across the document ───
  const hydratePlaceholders = (rootNode) => {
    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false);
    let currentNode = walker.nextNode();
    while (currentNode) {
      if (currentNode.nodeType === Node.TEXT_NODE) {
        let text = currentNode.nodeValue;
        if (text.includes('[COMPANY NAME]')) text = text.replaceAll('[COMPANY NAME]', COMPANY_CONFIG.name);
        if (text.includes('hello@[DOMAIN].ae')) text = text.replaceAll('hello@[DOMAIN].ae', COMPANY_CONFIG.email);
        if (text.includes('hello@[domain].ae')) text = text.replaceAll('hello@[domain].ae', COMPANY_CONFIG.email);
        if (text.includes('[DOMAIN].ae')) text = text.replaceAll('[DOMAIN].ae', COMPANY_CONFIG.domain);
        if (text.includes('[domain].ae')) text = text.replaceAll('[domain].ae', COMPANY_CONFIG.domain);
        if (text.includes('[DOMAIN]')) text = text.replaceAll('[DOMAIN]', COMPANY_CONFIG.domain);
        if (text.includes('[domain]')) text = text.replaceAll('[domain]', COMPANY_CONFIG.domain);
        if (text.includes('+971XXXXXXXXX')) text = text.replaceAll('+971XXXXXXXXX', COMPANY_CONFIG.phone);
        if (text.includes('+971 XX XXX XXXX')) text = text.replaceAll('+971 XX XXX XXXX', COMPANY_CONFIG.phone);
        currentNode.nodeValue = text;
      } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < currentNode.attributes.length; i++) {
          const attr = currentNode.attributes[i];
          if (
            attr.value.includes('[COMPANY NAME]') || 
            attr.value.includes('[DOMAIN]') || 
            attr.value.includes('[domain]') || 
            attr.value.includes('[COMPANY-SLUG]') || 
            attr.value.includes('971XXXXXXXXX') ||
            attr.value.includes('+971 XX XXX XXXX') ||
            attr.value.includes('hello@[DOMAIN].ae') ||
            attr.value.includes('hello@[domain].ae')
          ) {
            attr.value = attr.value
              .replaceAll('[COMPANY NAME]', COMPANY_CONFIG.name)
              .replaceAll('hello@[DOMAIN].ae', COMPANY_CONFIG.email)
              .replaceAll('hello@[domain].ae', COMPANY_CONFIG.email)
              .replaceAll('[DOMAIN].ae', COMPANY_CONFIG.domain)
              .replaceAll('[domain].ae', COMPANY_CONFIG.domain)
              .replaceAll('[DOMAIN]', COMPANY_CONFIG.domain)
              .replaceAll('[domain]', COMPANY_CONFIG.domain)
              .replaceAll('[COMPANY-SLUG]', COMPANY_CONFIG.linkedinSlug)
              .replaceAll('971XXXXXXXXX', COMPANY_CONFIG.whatsapp)
              .replaceAll('+971 XX XXX XXXX', COMPANY_CONFIG.phone);
          }
        }
      }
      currentNode = walker.nextNode();
    }
  };

  // Run hydration on head, body and title
  document.title = document.title
    .replaceAll('[COMPANY NAME]', COMPANY_CONFIG.name)
    .replaceAll('[DOMAIN].ae', COMPANY_CONFIG.domain)
    .replaceAll('[domain].ae', COMPANY_CONFIG.domain)
    .replaceAll('[DOMAIN]', COMPANY_CONFIG.domain)
    .replaceAll('[domain]', COMPANY_CONFIG.domain);

  hydratePlaceholders(document.documentElement);

  // Update LD-JSON schema scripts
  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      let content = script.textContent;
      if (
        content.includes('[COMPANY NAME]') || 
        content.includes('[DOMAIN]') || 
        content.includes('[domain]') || 
        content.includes('[COMPANY-SLUG]') ||
        content.includes('+971XXXXXXXXX') ||
        content.includes('hello@[DOMAIN].ae') ||
        content.includes('hello@[domain].ae')
      ) {
        script.textContent = content
          .replaceAll('[COMPANY NAME]', COMPANY_CONFIG.name)
          .replaceAll('hello@[DOMAIN].ae', COMPANY_CONFIG.email)
          .replaceAll('hello@[domain].ae', COMPANY_CONFIG.email)
          .replaceAll('[DOMAIN].ae', COMPANY_CONFIG.domain)
          .replaceAll('[domain].ae', COMPANY_CONFIG.domain)
          .replaceAll('[DOMAIN]', COMPANY_CONFIG.domain)
          .replaceAll('[domain]', COMPANY_CONFIG.domain)
          .replaceAll('[COMPANY-SLUG]', COMPANY_CONFIG.linkedinSlug)
          .replaceAll('+971XXXXXXXXX', COMPANY_CONFIG.phone);
      }
    } catch(e) {}
  });
});

/* ─── Shared functions ─── */
function toggleMenu() {
  const m = document.getElementById('mobile-menu');
  const btn = document.getElementById('hamburger');
  const isOpen = m.classList.contains('open');
  m.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
  document.getElementById('ham-icon').classList.toggle('hidden', !isOpen);
  document.getElementById('close-icon').classList.toggle('hidden', isOpen);
}

let isArabic = false;
function toggleLang() {
  isArabic = !isArabic;
  document.body.classList.toggle('rtl', isArabic);
  document.documentElement.setAttribute('lang', isArabic ? 'ar' : 'en');
  document.documentElement.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
  const lbl = document.getElementById('lang-label');
  if (lbl) lbl.textContent = isArabic ? 'عربي | EN' : 'EN | عربي';
}

function openModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  const today = new Date().toISOString().split('T')[0];
  const dateEl = document.getElementById('pref-date');
  if (dateEl) dateEl.min = today;
}
function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
function handleOverlayClick(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

let currentStep = 1;
function goToStep(n) {
  document.getElementById('step-' + currentStep).classList.add('hidden');
  [1,2,3].forEach(i => {
    const dot = document.getElementById('dot-' + i);
    dot.classList.remove('active','done','inactive');
    if (i < n) dot.classList.add('done');
    else if (i === n) dot.classList.add('active');
    else dot.classList.add('inactive');
  });
  [1,2].forEach(i => document.getElementById('line-' + i).classList.toggle('done', i < n));
  currentStep = n;
  document.getElementById('step-' + n).classList.remove('hidden');
}

function submitForm() {
  const data = {
    name: document.getElementById('full-name')?.value,
    company: document.getElementById('company')?.value,
    email: document.getElementById('email')?.value,
    whatsapp: document.getElementById('whatsapp')?.value,
    jobTitle: document.getElementById('job-title')?.value,
    industry: document.getElementById('industry')?.value,
    companySize: document.getElementById('company-size')?.value,
    challenge: document.getElementById('challenge')?.value,
    budget: document.getElementById('budget')?.value,
    meetingType: document.querySelector('input[name="meeting-type"]:checked')?.value,
    prefDate: document.getElementById('pref-date')?.value,
    prefTime: document.getElementById('pref-time')?.value,
    notes: document.getElementById('notes')?.value,
  };
  console.log('Booking:', data);
  document.getElementById('step-3').classList.add('hidden');
  document.getElementById('step-success').classList.remove('hidden');
  const ind = document.getElementById('step-indicator');
  if (ind) ind.style.display = 'none';
}
