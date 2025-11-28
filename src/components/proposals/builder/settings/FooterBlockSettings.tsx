'use client';

import { useState } from 'react';
import type { ProposalBlock } from '@/types/database';
import type { ContactItem, SocialLink } from '@/lib/builder/block-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus } from 'lucide-react';

interface FooterBlockSettingsProps {
  block: ProposalBlock;
  onUpdate: (blockId: string, props: Record<string, unknown>) => Promise<void>;
}

const SOCIAL_PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'website', label: 'Website' },
] as const;

export function FooterBlockSettings({
  block,
  onUpdate,
}: FooterBlockSettingsProps) {
  const blockProps = block.props as {
    contacts?: ContactItem[];
    layout?: 'simple' | 'with_cta' | 'full';
    ctaText?: string;
    ctaUrl?: string;
    socialLinks?: SocialLink[];
    copyrightText?: string;
  };

  const [layout, setLayout] = useState<'simple' | 'with_cta' | 'full'>(
    blockProps.layout || 'simple'
  );
  const [contacts, setContacts] = useState<ContactItem[]>(
    blockProps.contacts || []
  );
  const [ctaText, setCtaText] = useState(blockProps.ctaText || '');
  const [ctaUrl, setCtaUrl] = useState(blockProps.ctaUrl || '');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    blockProps.socialLinks || []
  );
  const [copyrightText, setCopyrightText] = useState(
    blockProps.copyrightText || '© 2024 Company Name'
  );

  const updateBlock = (updates: Partial<typeof blockProps>) => {
    onUpdate(block.id, {
      contacts,
      layout,
      ctaText,
      ctaUrl,
      socialLinks,
      copyrightText,
      ...updates,
    });
  };

  const handleLayoutChange = (value: string) => {
    const newLayout = value as 'simple' | 'with_cta' | 'full';
    setLayout(newLayout);
    updateBlock({ layout: newLayout });
  };

  const handleAddContact = () => {
    const newContacts = [...contacts, { email: '', phone: '' }];
    setContacts(newContacts);
    updateBlock({ contacts: newContacts });
  };

  const handleUpdateContact = (
    index: number,
    field: keyof ContactItem,
    value: string
  ) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
    updateBlock({ contacts: newContacts });
  };

  const handleDeleteContact = (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    setContacts(newContacts);
    updateBlock({ contacts: newContacts });
  };

  const handleToggleSocial = (platform: string) => {
    const exists = socialLinks.find((link) => link.platform === platform);
    let newSocialLinks: SocialLink[];

    if (exists) {
      newSocialLinks = socialLinks.filter((link) => link.platform !== platform);
    } else {
      newSocialLinks = [
        ...socialLinks,
        { platform: platform as SocialLink['platform'], url: '' },
      ];
    }

    setSocialLinks(newSocialLinks);
    updateBlock({ socialLinks: newSocialLinks });
  };

  const handleUpdateSocialUrl = (platform: string, url: string) => {
    const newSocialLinks = socialLinks.map((link) =>
      link.platform === platform ? { ...link, url } : link
    );
    setSocialLinks(newSocialLinks);
    updateBlock({ socialLinks: newSocialLinks });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold">Footer / Контакты</h3>

        {/* Layout */}
        <div className="space-y-2">
          <Label>Вид отображения</Label>
          <RadioGroup value={layout} onValueChange={handleLayoutChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="simple" id="simple" />
              <Label htmlFor="simple" className="cursor-pointer">
                Простой (контакты + копирайт)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="with_cta" id="with_cta" />
              <Label htmlFor="with_cta" className="cursor-pointer">
                С кнопкой CTA
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="full" id="full" />
              <Label htmlFor="full" className="cursor-pointer">
                Полный (логотип + контакты + соцсети)
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Contacts */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Контакты</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddContact}
          >
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>

        {contacts.map((contact, index) => (
          <div
            key={index}
            className="space-y-3 p-4 border rounded-lg bg-muted/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Контакт #{index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteContact(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={contact.email || ''}
                onChange={(e) =>
                  handleUpdateContact(index, 'email', e.target.value)
                }
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Телефон</Label>
              <Input
                type="tel"
                value={contact.phone || ''}
                onChange={(e) =>
                  handleUpdateContact(index, 'phone', e.target.value)
                }
                placeholder="+7 (999) 123-45-67"
              />
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section (only for with_cta layout) */}
      {layout === 'with_cta' && (
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium">Кнопка призыва к действию</h4>

          <div className="space-y-2">
            <Label>Текст кнопки</Label>
            <Input
              value={ctaText}
              onChange={(e) => {
                setCtaText(e.target.value);
                updateBlock({ ctaText: e.target.value });
              }}
              placeholder="Связаться с нами"
            />
          </div>

          <div className="space-y-2">
            <Label>Ссылка</Label>
            <Input
              type="url"
              value={ctaUrl}
              onChange={(e) => {
                setCtaUrl(e.target.value);
                updateBlock({ ctaUrl: e.target.value });
              }}
              placeholder="https://example.com/contact"
            />
          </div>
        </div>
      )}

      {/* Social Links (only for full layout) */}
      {layout === 'full' && (
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium">Социальные сети</h4>

          {SOCIAL_PLATFORMS.map((platform) => {
            const link = socialLinks.find((l) => l.platform === platform.value);
            const isChecked = !!link;

            return (
              <div key={platform.value} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => handleToggleSocial(platform.value)}
                  />
                  <Label className="cursor-pointer">{platform.label}</Label>
                </div>

                {isChecked && (
                  <Input
                    type="url"
                    value={link?.url || ''}
                    onChange={(e) =>
                      handleUpdateSocialUrl(platform.value, e.target.value)
                    }
                    placeholder={`https://${platform.value}.com/...`}
                    className="ml-6"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Copyright */}
      <div className="space-y-2 pt-4 border-t">
        <Label>Копирайт</Label>
        <Input
          value={copyrightText}
          onChange={(e) => {
            setCopyrightText(e.target.value);
            updateBlock({ copyrightText: e.target.value });
          }}
          placeholder="© 2024 Company Name"
        />
      </div>
    </div>
  );
}
