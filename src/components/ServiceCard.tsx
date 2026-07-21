import { Link } from 'react-router';
import FadeImage from './FadeImage';
import { serviceLink, type Service } from '@/data/games';
import { useCurrency } from '@/context/CurrencyContext';
import { usePricing } from '@/context/PricingContext';

/**
 * Flat service block: the image fills the whole card as a background and
 * fades out behind the text at the bottom. The whole card links through to
 * the service's dedicated subpage, or to its category page otherwise.
 */
export default function ServiceCard({ service }: { service: Service }) {
  const { format } = useCurrency();
  const { priceOf } = usePricing();

  return (
    <Link
      to={serviceLink(service.id)}
      className="group relative flex h-full min-h-[380px] w-full max-w-[280px] flex-col overflow-hidden rounded-[5px] bg-navy-850 text-left transition-all duration-300 max-sm:mx-auto"
      aria-label={service.name}
    >
      {/* Background image, faded behind the text */}
      <div className="absolute -inset-px">
        <FadeImage
          src={service.image}
          alt=""
          className="h-full w-full"
          imgClassName="object-top transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="absolute -inset-px bg-gradient-to-t from-navy-800 from-[33%] via-navy-800/70 via-[45%] to-transparent to-[60%]" />

      {/* Content */}
      <div className="relative flex flex-1 flex-col justify-end p-4">
        <h3 className="font-display text-sm font-bold text-white transition-colors group-hover:text-cyan-400">
          {service.name}
        </h3>

        <ul className="mt-2.5 space-y-1.5 text-xs">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-cyan-500" />
            <span className="font-medium text-cyan-400">{service.delivery}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-slate-500" />
            <span className="line-clamp-1 text-slate-300">{service.description}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-slate-500" />
            <span className="text-slate-300">{service.note ?? 'Hand-played · Money-back guarantee'}</span>
          </li>
        </ul>

        <p className="mt-4 flex items-baseline gap-1.5 text-xs text-slate-400">
          From
          <span className="font-display text-lg font-bold text-white">{format(priceOf(service.id, service.price))}</span>
        </p>
      </div>
    </Link>
  );
}
