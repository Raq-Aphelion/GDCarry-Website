/** Visual effects for the externally-injected Live Helper Chat widget.
    The LHC wrapper renders its own DOM with heavy inline `!important` styles
    and rewrites its CHILD elements on every interaction — so child-level
    overrides get wiped. All durable effects therefore live on the top-level
    container (#lhc_container_v2), which LHC never restyles: transforming it
    makes its fixed-position children (badge + chat window) position relative
    to it, so they move together and new windows open in the shifted spot.

    - Badge hover animation (style injected into the status widget's shadow root)
    - Smooth open/close animation for the chat window (MutationObserver on the
      display toggle, animated via inline opacity/transform)
    - Cart-aware offset via the container: on desktop everything shifts left
      by the cart width; on mobile everything fades out. */

const WIDGET_ID = 'lhc_widget_v2';
const BADGE_ID = 'lhc_status_widget_v2';
const CONTAINER_ID = 'lhc_container_v2';

type LhcEl = HTMLElement & { dataset: DOMStringMap & { gdOrderFlow?: string } };

const getWidget = () => document.getElementById(WIDGET_ID) as LhcEl | null;
const getBadge = () => document.getElementById(BADGE_ID) as LhcEl | null;
const getContainer = () => document.getElementById(CONTAINER_ID) as HTMLElement | null;

/* ---------------------------------------------------------------- badge fx */

/** Injects the hover animation into the badge's shadow root. Re-run by the
    ensure loop because LHC recreates the status widget (and its shadow root)
    on reloadWidget, wiping the first injection. */
function ensureBadgeHoverStyle() {
  const root = getBadge()?.shadowRoot;
  if (!root || root.getElementById('gd-badge-fx')) return;
  const style = document.createElement('style');
  style.id = 'gd-badge-fx';
  style.textContent = `
#status-icon {
  transition: transform .25s ease, box-shadow .25s ease !important;
}
/* The icon and its container are pointer-events:none — hover only reaches
   the host element, so the hover state must come from :host. */
:host(:hover) #status-icon {
  transform: scale(1.1) !important;
}`;
  root.appendChild(style);
}

/* ------------------------------------------------------ open/close motion */

let closeAnimating = false;

function animateOpen(el: LhcEl) {
  el.style.setProperty('opacity', '0', 'important');
  el.style.setProperty('transform', 'translateY(16px)', 'important');
  requestAnimationFrame(() => {
    el.style.setProperty('transition', 'opacity .35s ease, transform .35s ease', 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('transform', 'translateY(0px)', 'important');
    setTimeout(() => el.style.setProperty('transition', 'none', 'important'), 400);
  });
}

function animateClose(el: LhcEl) {
  closeAnimating = true;
  // Override LHC's display:none so the close animation can actually play
  el.style.setProperty('display', 'block', 'important');
  el.style.setProperty('transition', 'opacity .3s ease, transform .3s ease', 'important');
  requestAnimationFrame(() => {
    el.style.setProperty('opacity', '0', 'important');
    el.style.setProperty('transform', 'translateY(16px)', 'important');
  });
  setTimeout(() => {
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('transform', 'none', 'important');
    el.style.setProperty('transition', 'none', 'important');
    closeAnimating = false;
  }, 320);
}

/** Watches an element's display toggle and animates it. LHC recreates its
    elements on reloadWidget, so observers re-attach via the ensure loop. */
function watchDisplay(el: LhcEl) {
  let prev = getComputedStyle(el).display;
  new MutationObserver(() => {
    if (closeAnimating) return;
    const now = getComputedStyle(el).display;
    if (now === prev) return;
    prev = now;
    if (el.dataset.gdOrderFlow) return;
    if (now === 'block') animateOpen(el);
    else animateClose(el);
  }).observe(el, { attributes: true, attributeFilter: ['style'] });
}

/* ------------------------------------------------------------ cart offset */

let cartOpen = false;

/** Applies (or relaxes) the cart offset on the LHC container. Idempotent —
    the ensure loop re-applies after LHC recreates the container. */
function applyContainerOffset() {
  const container = getContainer();
  if (!container) return;
  // Transforming the container pulls the fixed-position badge/window into the
  // container's stacking context — but with position:static its inline
  // z-index:999999999 is ignored, dropping the chat below the cart overlay
  // (z-90). position:relative activates that z-index and keeps the chat on
  // top. (LHC set the z-index but never positioned the element.)
  container.style.setProperty('position', 'relative', 'important');
  const desktop = window.matchMedia('(min-width: 1024px)').matches;
  if (desktop) {
    // Quick push, stays ahead of the cart drawer's 300ms slide
    container.style.setProperty('transition', 'transform .15s ease-out', 'important');
    container.style.setProperty('transform', cartOpen ? 'translateX(-448px)' : 'none', 'important');
  } else {
    container.style.setProperty('transition', 'opacity .05s ease-out', 'important');
    container.style.setProperty('opacity', cartOpen ? '0' : '1', 'important');
    container.style.setProperty('pointer-events', cartOpen ? 'none' : 'auto', 'important');
  }
}

/** Called by the cart drawer whenever its open state changes. */
export function setLhcCartOffset(open: boolean) {
  cartOpen = open;
  applyContainerOffset();
}

/* ----------------------------------------------------------------- engine */

const observed = new WeakSet<HTMLElement>();

function ensureWatchers() {
  [getWidget(), getBadge()].forEach((el) => {
    if (el && !observed.has(el)) {
      observed.add(el);
      watchDisplay(el);
    }
  });
}

/** Mobile only: square corners on the chat window (LHC inlines a 12px radius,
    so re-apply every tick as it can reset it on (re)load). */
function ensureSquareCorners() {
  const widget = getWidget();
  if (!widget) return;
  if (window.matchMedia('(max-width: 1023px)').matches) {
    widget.style.setProperty('border-radius', '0', 'important');
  }
}

/** Called once from LiveChatWidget after the embed script is injected. */
export function initLhcWidgetFx() {
  const tick = () => {
    ensureBadgeHoverStyle();
    ensureWatchers();
    ensureSquareCorners();
    if (cartOpen) applyContainerOffset(); // re-apply if LHC recreated the container
  };
  tick();
  setInterval(tick, 1000);
}
