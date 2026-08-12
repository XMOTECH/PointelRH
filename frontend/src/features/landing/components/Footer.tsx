import { SocialIcon } from './SocialIcon';
import type { FooterLinkGroup, SocialLink } from '../types/landing.types';

interface FooterProps {
  linkGroups: FooterLinkGroup[];
  socialLinks: SocialLink[];
}

function handleSmoothScroll(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (href.startsWith('#') && href !== '#') {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

export function Footer({ linkGroups, socialLinks }: FooterProps) {
  return (
    <footer className="bg-on-surface pt-16 pb-8 px-6 border-t border-surface-container-lowest/10">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
        {/* Brand column */}
        <div className="col-span-2 lg:col-span-2">
          <a href="/" className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-on-primary font-bold font-space text-sm">L</span>
            </div>
            <span className="font-space font-bold text-xl text-surface-container-lowest">
              Lumina <span className="text-primary">RH</span>
            </span>
          </a>
          <p className="text-surface-container-highest/60 font-medium text-sm leading-relaxed max-w-sm">
            La plateforme SIRH B2B concue pour centraliser le pointage, optimiser la planification et
            automatiser la gestion des temps.
          </p>
        </div>

        {/* Link groups */}
        {linkGroups.map((group) => (
          <div key={group.heading}>
            <h4 className="text-surface-container-lowest font-semibold mb-4">{group.heading}</h4>
            <ul className="space-y-3">
              {group.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                    className="text-surface-container-highest/60 hover:text-surface-container-lowest transition-colors text-sm font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-surface-container-lowest/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-surface-container-highest/40 text-sm font-medium">
          &copy; {new Date().getFullYear()} LuminaRH. Tous droits reserves.
        </p>
        <div className="flex gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.name}
              className="w-9 h-9 rounded-full bg-surface-container-lowest/10 flex items-center justify-center hover:bg-surface-container-lowest/20 transition-colors text-surface-container-highest"
            >
              <SocialIcon spriteId={link.spriteId} size={16} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
