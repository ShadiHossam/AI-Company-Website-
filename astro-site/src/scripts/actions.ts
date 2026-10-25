// Delegated replacement for inline on* attributes, which a CSP without
// 'unsafe-inline' refuses to run. Markup declares what to call instead:
//
//   data-action="openModal:this"     click  -> window.openModal(el)
//   data-action="toggleMenu"         click  -> window.toggleMenu()
//   data-action="contactStep" data-args="[2]"   -> window.contactStep(2)
//   data-action="handleOverlayClick:event"      -> window.handleOverlayClick(event)
//   data-change="updateStatus:this"  change -> window.updateStatus(el)
//   data-input="updateSlug:value"    input  -> window.updateSlug(el.value)
//   data-action="deleteJob:data.jobId"      -> window.deleteJob(el.dataset.jobId)
//
// Only the nearest element carrying the attribute runs, so a nested
// data-action="$stop" keeps a click from also reaching an outer handler.
// Names starting with "$" are built-ins (see BUILTINS).
// data-onerror="hide" | "hide-parent" on <img> replaces the inline onerror.

type Handler = (...args: unknown[]) => unknown;

const BUILTINS: Record<string, (el: HTMLElement, e: Event, args: unknown[]) => void> = {
  $stop: () => {},
  $removeParent: (el) => el.parentElement?.remove(),
  $submitForm: (el) => (el as HTMLInputElement).form?.submit(),
  $closeDialog: (_el, _e, [id]) => (document.getElementById(String(id)) as HTMLDialogElement | null)?.close(),
  $copy: (el) => { void navigator.clipboard?.writeText(el.dataset.copy ?? ''); },
};

function run(el: HTMLElement, spec: string, e: Event) {
  const [name, arg] = spec.split(':');
  let args: unknown[] = [];
  if (el.dataset.args) {
    try { args = JSON.parse(el.dataset.args); } catch { args = []; }
  } else if (arg === 'this') {
    args = [el];
  } else if (arg === 'event') {
    args = [e];
  } else if (arg === 'value') {
    args = [(el as HTMLInputElement).value];
  } else if (arg?.startsWith('data.')) {
    args = [el.dataset[arg.slice(5)]];
  }

  const builtin = BUILTINS[name];
  if (builtin) return builtin(el, e, args);
  const fn = (window as unknown as Record<string, Handler | undefined>)[name];
  if (typeof fn === 'function') fn.apply(el, args);
  else console.warn(`[actions] no handler "${name}"`);
}

function listen(type: string, attr: string) {
  document.addEventListener(type, (e) => {
    const el = (e.target as Element | null)?.closest?.(`[${attr}]`) as HTMLElement | null;
    if (!el) return;
    const spec = el.getAttribute(attr);
    if (spec) run(el, spec, e);
  });
}

listen('click', 'data-action');
listen('change', 'data-change');
listen('input', 'data-input');

// Image fallbacks. error events don't bubble, so this listens in the capture
// phase, and also checks images that already failed before this module ran.
function imgFailed(img: HTMLImageElement) {
  const mode = img.dataset.onerror;
  if (mode === 'hide') img.style.display = 'none';
  else if (mode === 'hide-parent' && img.parentElement) img.parentElement.style.display = 'none';
}
document.addEventListener('error', (e) => {
  const t = e.target;
  if (t instanceof HTMLImageElement && t.dataset.onerror) imgFailed(t);
}, true);
document.querySelectorAll<HTMLImageElement>('img[data-onerror]').forEach((img) => {
  if (img.complete && img.naturalWidth === 0) imgFailed(img);
});
