'use client';

import type { FooterBlockProps } from '@/lib/builder/block-types';
import type { WorkspaceBrandSettings } from '@/types/database';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
} from 'lucide-react';

interface FooterBlockComponentProps {
  props: FooterBlockProps;
  brand: WorkspaceBrandSettings | null;
}

const getSocialIcon = (platform: string) => {
  switch (platform) {
    case 'linkedin':
      return <Linkedin className="h-5 w-5" />;
    case 'github':
      return <Github className="h-5 w-5" />;
    case 'website':
      return <Globe className="h-5 w-5" />;
    default:
      return <Globe className="h-5 w-5" />;
  }
};

export function FooterBlock({
  props,
  brand,
}: FooterBlockComponentProps) {
  const {
    contacts = [],
    layout = 'simple',
    ctaText,
    ctaUrl,
    socialLinks = [],
    copyrightText = '© 2024 Company Name',
  } = props;

  const primaryColor = brand?.colors?.primary || '#0062ff';
  const backgroundColor = brand?.colors?.background || '#ffffff';
  const textColor = brand?.colors?.text || '#1a1a1a';

  // Simple layout: contacts + copyright in one row
  if (layout === 'simple') {
    return (
      <div
        className="w-full py-8 px-6 border-t"
        style={{
          backgroundColor,
          fontFamily: brand?.typography?.bodyFont || 'inherit',
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {contacts.map((contact, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 hover:opacity-70"
                    style={{ color: primaryColor }}
                  >
                    <Mail className="h-4 w-4" />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 hover:opacity-70"
                    style={{ color: primaryColor }}
                  >
                    <Phone className="h-4 w-4" />
                    {contact.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm" style={{ color: textColor, opacity: 0.7 }}>{copyrightText}</p>
        </div>
      </div>
    );
  }

  // With CTA layout: contacts left + CTA right + copyright bottom
  if (layout === 'with_cta') {
    return (
      <div
        className="w-full py-8 px-6 border-t"
        style={{
          backgroundColor,
          fontFamily: brand?.typography?.bodyFont || 'inherit',
        }}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {contacts.map((contact, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 hover:opacity-70"
                      style={{ color: primaryColor }}
                    >
                      <Mail className="h-4 w-4" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-2 hover:opacity-70"
                      style={{ color: primaryColor }}
                    >
                      <Phone className="h-4 w-4" />
                      {contact.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
            {ctaText && ctaUrl && (
              <Button
                asChild
                style={{
                  backgroundColor: primaryColor,
                  color: '#ffffff',
                }}
              >
                <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                  {ctaText}
                </a>
              </Button>
            )}
          </div>
          <p className="text-sm text-center" style={{ color: textColor, opacity: 0.7 }}>
            {copyrightText}
          </p>
        </div>
      </div>
    );
  }

  // Full layout: logo + contacts + social + copyright (multi-column)
  return (
    <div
      className="w-full py-12 px-6 border-t"
      style={{
        backgroundColor,
        fontFamily: brand?.typography?.bodyFont || 'inherit',
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo/Brand */}
        <div className="space-y-4">
          {brand?.logoUrl && (
            <img
              src={brand.logoUrl}
              alt="Logo"
              className="h-8 w-auto"
            />
          )}
          <p className="text-sm" style={{ color: textColor, opacity: 0.7 }}>{copyrightText}</p>
        </div>

        {/* Contacts */}
        <div className="space-y-3" style={{ color: textColor }}>
          <h4
            className="font-semibold"
            style={{
              color: primaryColor,
              fontFamily: brand?.typography?.headingFont || 'inherit',
            }}
          >
            Контакты
          </h4>
          {contacts.map((contact, index) => (
            <div key={index} className="space-y-2 text-sm">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2 hover:opacity-70"
                  style={{ color: primaryColor }}
                >
                  <Mail className="h-4 w-4" />
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2 hover:opacity-70"
                  style={{ color: primaryColor }}
                >
                  <Phone className="h-4 w-4" />
                  {contact.phone}
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="space-y-3">
            <h4
              className="font-semibold"
              style={{
                color: primaryColor,
                fontFamily: brand?.typography?.headingFont || 'inherit',
              }}
            >
              Мы в соцсетях
            </h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70"
                  style={{ color: primaryColor }}
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
