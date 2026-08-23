import { useEffect, useRef } from 'react';

/**
 * Pointer drag-to-scroll for horizontal carousels. Works with touch, mouse
 * and pen. The track should carry `touch-pan-y` so vertical page scrolling
 * stays native while horizontal dragging is handled here. Clicks after a
 * real drag are swallowed so cards don't navigate accidentally.
 *
 * Releasing a fast drag keeps the track gliding with decaying velocity
 * (momentum) until friction stops it or the scroll edge is reached. A new
 * pointerdown cancels the glide immediately.
 *
 * Optional callbacks: `onDragStart` fires once the drag passes the deadzone,
 * `onDragEnd` on pointerup/pointercancel after such a drag. With `manual`
 * set, the hook never touches `scrollLeft` itself and instead reports the
 * cumulative drag delta through `onDragMove(dx)` (e.g. transform-driven
 * marquees drive their own offset from it); the momentum glide keeps
 * reporting through `onDragMove` too.
 */
export default function useDragScroll<T extends HTMLElement = HTMLDivElement>(opts?: {
  onDragStart?: () => void;
  onDragMove?: (dx: number) => void;
  onDragEnd?: () => void;
  manual?: boolean;
}) {
  const ref = useRef<T>(null);
  // Latest callbacks, so the listeners below subscribe only once
  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let down = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;
    // Momentum: smoothed pointer velocity (px/ms) and the post-release glide
    let vx = 0;
    let lastX = 0;
    let lastT = 0;
    let lastDx = 0;
    let glideRaf = 0;

    const stopGlide = () => {
      if (glideRaf) cancelAnimationFrame(glideRaf);
      glideRaf = 0;
    };

    // After release, keep scrolling with decaying velocity — the flick.
    const startGlide = () => {
      let v = vx;
      let dx = lastDx; // manual mode keeps reporting the cumulative delta
      let prev = performance.now();
      const step = (now: number) => {
        const dt = Math.min(now - prev, 50); // clamp tab-switch jumps
        prev = now;
        v *= Math.exp(-0.0035 * dt); // friction
        if (Math.abs(v) < 0.02) {
          glideRaf = 0;
          return;
        }
        if (optsRef.current?.manual) {
          dx += v * dt;
          optsRef.current.onDragMove?.(dx);
        } else {
          const max = el.scrollWidth - el.clientWidth;
          const next = el.scrollLeft - v * dt;
          el.scrollLeft = next;
          if (next <= 0 || next >= max) {
            glideRaf = 0;
            return; // hit the edge
          }
        }
        glideRaf = requestAnimationFrame(step);
      };
      glideRaf = requestAnimationFrame(step);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      stopGlide();
      down = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      vx = 0;
      lastX = e.clientX;
      lastT = performance.now();
    };
    // Links/images inside the track would otherwise start a native
    // drag-and-drop and cancel the pointer stream mid-drag.
    const onDragStart = (e: DragEvent) => e.preventDefault();
    const onPointerMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        optsRef.current?.onDragStart?.();
      }
      if (moved) {
        const now = performance.now();
        const dt = now - lastT;
        if (dt > 0) vx = vx * 0.6 + ((e.clientX - lastX) / dt) * 0.4;
        lastX = e.clientX;
        lastT = now;
        lastDx = dx;
        if (optsRef.current?.manual) optsRef.current.onDragMove?.(dx);
        else el.scrollLeft = startScroll - dx;
        e.preventDefault();
      }
    };
    const onPointerUp = () => {
      if (down && moved) {
        optsRef.current?.onDragEnd?.();
        // Only fling when the pointer was still moving at release
        if (Math.abs(vx) > 0.08 && performance.now() - lastT < 100) startGlide();
      }
      down = false;
    };
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('dragstart', onDragStart);
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('click', onClickCapture, true);
    return () => {
      stopGlide();
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('dragstart', onDragStart);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  return ref;
}
