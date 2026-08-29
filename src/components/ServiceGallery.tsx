import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import FadeImage from './FadeImage';
import { lenisRef } from '@/lib/lenis';

/** Image gallery for service subpages (account listings): a main shot with a
    thumbnail strip below — one thumb per image, so the strip grows/shrinks
    with the gallery. Switching remounts the main FadeImage (keyed by src), so
    the fade-in replays on every swap. Hovering the main image shows prev/next
    controls (with >1 image); clicking it opens a lightbox (blurred backdrop,
    arrows + X + click-outside + Escape to close). */
export default function ServiceGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const cur = Math.min(active, images.length - 1);
  const multi = images.length > 1;
  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  // Lightbox: Escape/arrows, and hold the page's smooth scroll while open
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    const lenis = lenisRef.current;
    lenis?.stop();
    return () => {
      window.removeEventListener('keydown', onKey);
      lenis?.start();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, images.length]);

  const arrowBtn =
    'flex cursor-pointer items-center justify-center rounded-full border border-navy-700/70 bg-navy-900/80 text-slate-300 transition-all hover:border-cyan-500/50 hover:text-cyan-400';
  /** Side-of-image placement (desktop lightbox / main shot) */
  const arrowSide = 'absolute top-1/2 z-10 -translate-y-1/2 h-9 w-9';

  return (
    <div>
      {/* Main shot — click opens the lightbox; hover zoom + side controls.
          The hover zoom lives on the inner wrapper, NOT the image: the arrows
          are siblings, so hovering them doesn't zoom, and switching images
          while hovered keeps the wrapper's scale — the incoming image's
          reveal plays smoothly inside instead of an instant re-zoom */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`${alt} — open gallery image ${cur + 1} fullscreen`}
        onClick={() => setLightbox(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setLightbox(true);
        }}
        className="card-surface group relative aspect-[2/1] cursor-zoom-in overflow-hidden rounded-[5px]"
      >
        <div className="h-full w-full transition-transform duration-500 hover:scale-[1.03]">
          <FadeImage
            key={images[cur]}
            src={images[cur]}
            alt={alt}
            className="h-full w-full"
            imgClassName="object-cover"
          />
        </div>
        {multi && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className={`${arrowBtn} ${arrowSide} left-3 opacity-0 group-hover:opacity-100 max-sm:opacity-100`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className={`${arrowBtn} ${arrowSide} right-3 opacity-0 group-hover:opacity-100 max-sm:opacity-100`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails — one per image; slight zoom on hover */}
      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
        {images.map((img, i) => (
          <button
            key={img}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Gallery image ${i + 1}`}
            aria-pressed={i === cur}
            className={`aspect-[2/1] w-24 shrink-0 cursor-pointer overflow-hidden rounded-[5px] border transition-all duration-300 ${
              i === cur
                ? 'border-cyan-500/70'
                : 'border-navy-700/70 opacity-50 hover:border-navy-600 hover:opacity-100'
            }`}
          >
            <img
              src={img}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
            />
          </button>
        ))}
      </div>

      {/* Lightbox — darkened + blurred page behind; X, arrows, click-outside
          and Escape all close it. Portaled to <body>: the gallery lives inside
          a Reveal, whose transform would trap position (position:fixed anchors
          to transformed ancestors), clipping the overlay  to the gallery box */}
      {lightbox &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${alt} — image ${cur + 1} of ${images.length}`}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/85 backdrop-blur-md"
          >
          <button
            type="button"
            aria-label="Close gallery"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-navy-700/70 bg-navy-900/80 text-slate-300 transition-all hover:border-cyan-500/50 hover:text-cyan-400"
          >
            <X className="h-5 w-5" />
          </button>
          {multi && (
            <>
              {/* Desktop: side arrows; mobile: controls sit below the image */}
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className={`${arrowBtn} ${arrowSide} left-4 h-11 w-11 max-sm:hidden`}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className={`${arrowBtn} ${arrowSide} right-4 h-11 w-11 max-sm:hidden`}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <div className="flex max-h-full flex-col items-center">
            {/* touch-pinch-zoom enables pinch zoom on mobile */}
            <img
              src={images[cur]}
              alt={alt}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-[90vw] cursor-default touch-pinch-zoom rounded-[5px] object-contain max-sm:max-h-[70vh]"
            />
            {multi && (
              <div className="mt-3 flex items-center justify-center gap-3 sm:hidden">
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className={`${arrowBtn} h-11 w-11`}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className={`${arrowBtn} h-11 w-11`}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
