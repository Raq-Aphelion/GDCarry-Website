import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// YouTube-style hover tooltip for truncated text: instead of wiring a tooltip
// into every component that uses `truncate`/`line-clamp`, one global listener
// finds the element under the cursor whose text is ACTUALLY clipped
// (scrollWidth/scrollHeight exceed the box) and shows its full text in a
// floating block. Mounted once in App — covers every current and future
// truncation site with zero per-component changes.

const SHOW_DELAY_MS = 250;
const VIEWPORT_MARGIN = 8;

interface TipState {
  text: string;
  anchorLeft: number;
  top: number;
  above: boolean;
}

// Deepest-first: the innermost clipped element owns the tooltip.
function findTruncated(start: Element | null): HTMLElement | null {
  let el = start as HTMLElement | null;
  while (el && el !== document.body) {
    const style = getComputedStyle(el);
    const ellipsized =
      style.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1;
    // Restrict the multi-line check to real line-clamp boxes — plain
    // overflow-hidden containers would false-positive on every hover.
    const clamped =
      style.webkitLineClamp !== 'none' &&
      style.webkitLineClamp !== '' &&
      el.scrollHeight > el.clientHeight + 1;
    if (ellipsized || clamped) return el;
    el = el.parentElement;
  }
  return null;
}

export default function TruncationTooltip() {
  const [tip, setTip] = useState<TipState | null>(null);
  const [left, setLeft] = useState(0);
  const tipNodeRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeElRef = useRef<HTMLElement | null>(null);

  // Clamp horizontally against the tooltip's REAL rendered width, not its
  // max-width — short tooltips near the right edge would otherwise be
  // shoved far left of their anchor. Runs before paint, so no flicker.
  useLayoutEffect(() => {
    if (!tip || !tipNodeRef.current) return;
    const width = tipNodeRef.current.offsetWidth;
    const maxLeft = Math.max(window.innerWidth - width - VIEWPORT_MARGIN, VIEWPORT_MARGIN);
    setLeft(Math.min(Math.max(tip.anchorLeft, VIEWPORT_MARGIN), maxLeft));
  }, [tip]);

  useEffect(() => {
    const cancelTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    const hide = () => {
      cancelTimer();
      activeElRef.current = null;
      setTip(null);
    };
    const showFor = (el: HTMLElement) => {
      const text = el.textContent?.trim();
      if (!text) return;
      const rect = el.getBoundingClientRect();
      // Prefer below the element (like YouTube); flip above when there is
      // more room up there than down.
      const above =
        window.innerHeight - rect.bottom < 48 &&
        rect.top > window.innerHeight - rect.bottom;
      setTip({
        text,
        anchorLeft: rect.left,
        top: above ? rect.top - 6 : rect.bottom + 6,
        above,
      });
    };

    const onPointerOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = findTruncated(e.target as Element);
      if (el === activeElRef.current) return; // moving inside the same element
      cancelTimer();
      setTip(null);
      activeElRef.current = el;
      if (el) timerRef.current = setTimeout(() => showFor(el), SHOW_DELAY_MS);
    };

    document.addEventListener('pointerover', onPointerOver);
    document.documentElement.addEventListener('pointerleave', hide);
    document.addEventListener('pointerdown', hide);
    window.addEventListener('resize', hide);
    // Capture: the page scrolls inside #page-scroll, and scroll events from
    // nested containers don't bubble.
    document.addEventListener('scroll', hide, true);
    return () => {
      cancelTimer();
      document.removeEventListener('pointerover', onPointerOver);
      document.documentElement.removeEventListener('pointerleave', hide);
      document.removeEventListener('pointerdown', hide);
      window.removeEventListener('resize', hide);
      document.removeEventListener('scroll', hide, true);
    };
  }, []);

  if (!tip) return null;

  return createPortal(
    <div
      ref={tipNodeRef}
      role="tooltip"
      className="pointer-events-none fixed z-[100] max-w-xs animate-in fade-in-0 zoom-in-95 rounded-md border border-cyan-500/25 bg-navy-800/95 px-3 py-1.5 text-xs leading-relaxed text-slate-200 shadow-xl shadow-navy-950/60 backdrop-blur-sm"
      style={{
        left,
        top: tip.top,
        transform: tip.above ? 'translateY(-100%)' : undefined,
      }}
    >
      {tip.text}
    </div>,
    document.body,
  );
}
