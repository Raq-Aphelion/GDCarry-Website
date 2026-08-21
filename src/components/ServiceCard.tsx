import { Link, useNavigate } from 'react-router';
import FadeImage from './FadeImage';
import { serviceLink, type Service } from '@/data/games';
import { SERVICE_TAG_ICONS } from '@/data/serviceIcons';
import { useCurrency } from '@/context/CurrencyContext';
import { usePricing } from '@/context/PricingContext';
import cardPlaceholder from '@/assets/images/service-cards/ffxiv/ffxiv-blank.webp';

/**
 * Flat service block: the image fills the whole card as a background and
 * fades out behind the text at the bottom. The whole card links through to
 * the service's dedicated subpage, or to its category page otherwise.
 */
export default function ServiceCard({
  service,
  categoryLabel,
  categoryHref,
}: {
  service: Service;
  categoryLabel?: string;
  categoryHref?: string;
}) {
  const navigate = useNavigate();
  const { format } = useCurrency();
  const { priceOf } = usePricing();
  const price = priceOf(service.id, service.price);
  // Per-service tag icons replace the diamond bullets when defined
  const [DeliveryIcon, DescIcon, NoteIcon] = SERVICE_TAG_ICONS[service.id] ?? [];

  return (
    <Link
      to={serviceLink(service.id)}
      className="group relative flex h-full min-h-[300px] w-full max-w-[280px] flex-col overflow-hidden rounded-[5px] bg-navy-850 text-left transition-all duration-300 max-sm:mx-auto sm:min-h-[340px] lg:min-h-[380px]"
      aria-label={service.name}
    >
      {/* Category pill — same style as DiscountTag, pinned inside the card's
          top-right corner. Links to the category (a span, not a nested <a>:
          the whole card is already a link) */}
      {categoryLabel && (
        <span
          role={categoryHref ? 'link' : undefined}
          onClick={
            categoryHref
              ? (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(categoryHref);
                }
              : undefined
          }
          className={`absolute right-2 top-2 z-10 max-w-[calc(100%-1rem)] truncate rounded-[3px] bg-cyan-600 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-navy-900 shadow-[0_2px_8px_rgb(0_0_0/0.45)] ${
            categoryHref ? 'cursor-pointer transition-colors hover:bg-cyan-400' : ''
          }`}
        >
          {categoryLabel}
        </span>
      )}
      {/* Background image, faded behind the text */}
      <div className="absolute -inset-px">
        <FadeImage
          src={service.image}
          alt=""
          className="h-full w-full"
          imgClassName="object-top transition-transform duration-500 group-hover:scale-105"
          placeholder={cardPlaceholder}
        />
      </div>
      <div className="absolute -inset-px bg-gradient-to-t from-navy-800 from-[33%] via-navy-800/70 via-[45%] to-transparent to-[60%]" />

      {/* Content */}
      <div className="relative flex flex-1 flex-col justify-end p-4">
        <h3 className="truncate font-display text-sm font-bold text-white transition-colors group-hover:text-cyan-400">
          {service.name}
        </h3>

        <ul className="mt-2.5 space-y-1.5 text-xs">
          <li className="flex items-center gap-2">
            {DeliveryIcon ? (
              <DeliveryIcon className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
            ) : (
              <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-cyan-500" />
            )}
            <span className="truncate font-medium text-cyan-400">{service.tag1}</span>
          </li>
          <li className="flex items-center gap-2">
            {DescIcon ? (
              <DescIcon className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
            ) : (
              <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-slate-500" />
            )}
            <span className="truncate text-slate-300">{service.tag2}</span>
          </li>
          <li className="flex items-center gap-2">
            {NoteIcon ? (
              <NoteIcon className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
            ) : (
              <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-slate-500" />
            )}
            <span className="truncate text-slate-300">{service.tag3 ?? 'Hand-played · Money-back guarantee'}</span>
          </li>
        </ul>

        <p className={`mt-4 flex items-baseline gap-1.5 text-xs text-slate-400 ${price > 0 ? '' : 'invisible'}`}>
          From
          <span className="font-display text-lg font-bold text-white">{price > 0 ? format(price) : '0'}</span>
        </p>
      </div>
    </Link>
  );
}
