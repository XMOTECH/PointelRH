import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LuminaLogo } from '@/components/ui/LuminaLogo';
import { mobileMenuVariants } from '../animations/landing.animations';
import type { NavLink } from '../types/landing.types';

interface NavbarProps {
  links: NavLink[];
}

function handleSmoothScroll(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export function Navbar({ links }: NavbarProps) {
  const navigate = useNavigate();
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-outline-variant">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5">
          <LuminaLogo variant="horizontal" size="sm" showTagline={false} />
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleSmoothScroll(e, l.href)}
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Espace Client
          </button>
          <Button size="sm" onClick={() => navigate('/login?intent=demo')}>
            Demander une demo <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-on-surface-variant p-2" onClick={() => setMobileNav(!mobileNav)}>
          {mobileNav ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileNav && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
            className="md:hidden border-t border-outline-variant bg-surface-container-lowest px-6 py-4 space-y-4 overflow-hidden"
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  handleSmoothScroll(e, l.href);
                  setMobileNav(false);
                }}
                className="block text-sm font-medium text-on-surface-variant"
              >
                {l.label}
              </a>
            ))}
            <hr className="border-outline-variant" />
            <button
              onClick={() => navigate('/login')}
              className="w-full text-left text-sm font-semibold text-on-surface-variant"
            >
              Espace Client
            </button>
            <Button className="w-full" onClick={() => navigate('/login?intent=demo')}>
              Demander une demo <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
