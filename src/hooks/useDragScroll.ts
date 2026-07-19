import { useEffect, useRef } from 'react';

/**
 * Pointer drag-to-scroll for horizontal carousels. Works with touch, mouse
 * and pen. The track should carry `touch-pan-y` so vertical page scrolling
 * stays native while horizontal dragging is handled here. Clicks after a
 * real drag are swallowed so cards don't navigate accidentally.
 */
export default function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let down = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    // Links/images inside the track would otherwise start a native
    // drag-and-drop and cancel the pointer stream mid-drag.
    const onDragStart = (e: DragEvent) => e.preventDefault();
    const onPointerMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) moved = true;
      if (moved) {
        el.scrollLeft = startScroll - dx;
        e.preventDefault();
      }
    };
    const onPointerUp = () => {
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
