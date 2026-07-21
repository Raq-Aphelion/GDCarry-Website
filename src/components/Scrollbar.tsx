import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Custom overlay scrollbar (desktop-style pill floating over content).
 *
 * The native scrollbar of the target container is hidden via CSS; this thumb
 * floats over the content instead, so it never takes layout space — no
 * gutter, no arrow buttons, fully transparent track. It mirrors the target
 * scroller's geometry and supports dragging and track-click paging like a
 * native scrollbar. Used for the main page scroller (fixed, below the
 * navbar) and for the cart item list (absolute, inside the drawer).
 */
/** Vertical breathing room for the pill: 2px top + 2px bottom, so it never
    visually touches the navbar or the bottom edge of its container. */
const INSET_Y = 4;

export function OverlayScrollbar({
  scroller,
  className = '',
}: {
  scroller: HTMLElement | null;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ h: number; t: number } | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!scroller || !track) return;

    let raf = 0;
    let hideTimer = 0;

    const update = () => {
      const { scrollHeight, clientHeight, scrollTop } = scroller;
      const trackH = track.clientHeight - INSET_Y; // padded travel area
      if (scrollHeight <= clientHeight + 1 || trackH <= 0) {
        setThumb(null);
        return;
      }
      const h = Math.max(40, Math.round((clientHeight / scrollHeight) * trackH));
      const maxScroll = scrollHeight - clientHeight;
      const t = Math.round((Math.min(scrollTop, maxScroll) / maxScroll) * (trackH - h));
      setThumb({ h, t });
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
      setActive(true);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setActive(false), 900);
    };

    update();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    const ro = new ResizeObserver(update);
    ro.observe(scroller);
    Array.from(scroller.children).forEach((c) => ro.observe(c));
    // ResizeObserver misses added/removed children (e.g. cart lines), which
    // change scrollHeight without resizing anything being observed.
    const mo = new MutationObserver(update);
    mo.observe(scroller, { childList: true, subtree: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      ro.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
    };
  }, [scroller]);

  // Drag the thumb: map pointer travel to scroll range. Smooth scrolling is
  // suspended for the duration so the content follows the pointer 1:1.
  const onThumbPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const track = trackRef.current;
      if (!scroller || !track || !thumb) return;
      const startY = e.clientY;
      const startScroll = scroller.scrollTop;
      const scrollRange = scroller.scrollHeight - scroller.clientHeight;
      const thumbRange = track.clientHeight - INSET_Y - thumb.h;
      if (thumbRange <= 0) return;
      const prevBehavior = scroller.style.scrollBehavior;
      scroller.style.scrollBehavior = 'auto';
      setActive(true);
      const onMove = (ev: PointerEvent) => {
        scroller.scrollTop = startScroll + ((ev.clientY - startY) / thumbRange) * scrollRange;
      };
      const onUp = () => {
        scroller.style.scrollBehavior = prevBehavior;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [scroller, thumb],
  );

  // Click the empty track: page up/down toward the click point.
  const onTrackPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.target !== trackRef.current) return;
      const track = trackRef.current;
      if (!scroller || !track || !thumb) return;
      const y = e.clientY - track.getBoundingClientRect().top;
      const dir = y < thumb.t ? -1 : 1;
      scroller.scrollBy({ top: dir * scroller.clientHeight * 0.9 });
    },
    [scroller, thumb],
  );

  return (
    <div
      ref={trackRef}
      onPointerDown={onTrackPointerDown}
      aria-hidden
      className={`cursor-pointer select-none py-0.5 transition-opacity duration-300 ${
        active ? 'opacity-100' : 'opacity-50 hover:opacity-100'
      } ${className}`}
    >
      {thumb && (
        <div
          onPointerDown={onThumbPointerDown}
          style={{ height: thumb.h, transform: `translateY(${thumb.t}px)` }}
          className="w-full rounded-full bg-[rgb(var(--scroll-thumb)_/_0.8)] transition-colors duration-200 hover:bg-[rgb(var(--scroll-thumb-hover))]"
        />
      )}
    </div>
  );
}

/** The page-wide instance: overlays #page-scroll, starting below the navbar. */
export default function Scrollbar() {
  const [scroller, setScroller] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setScroller(document.getElementById('page-scroll'));
  }, []);
  return (
    <OverlayScrollbar
      scroller={scroller}
      className="page-scrollbar fixed bottom-0 right-0 top-16 z-40 hidden w-2.5 lg:block"
    />
  );
}
