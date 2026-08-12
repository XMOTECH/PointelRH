import type { LucideIcon } from 'lucide-react';

export interface NavLink {
  label: string;
  href: string;
}

export interface Pillar {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  text: string;
}

export interface Plan {
  name: string;
  desc: string;
  price: string;
  unit: string;
  popular?: boolean;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Metric {
  value: string;
  label: string;
}

export interface FooterLinkGroup {
  heading: string;
  links: { label: string; href: string }[];
}

export interface SocialLink {
  name: string;
  href: string;
  spriteId: string;
}
