'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BrandSettings {
  logoUrl?: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    bodyFont: string;
  };
  components: {
    cardRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    shadowSize: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  };
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
}

const DEFAULT_SETTINGS: BrandSettings = {
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    background: '#FFFFFF',
    text: '#1F2937',
  },
  typography: {
    fontFamily: 'Inter',
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },
  components: {
    cardRadius: 'md',
    shadowSize: 'md',
  },
  seo: {
    title: '',
    description: '',
    ogImage: '',
  },
};

const RADIUS_MAP = {
  none: '0px',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
};

const SHADOW_MAP = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

interface BrandPreviewProps {
  workspaceId: string;
}

// Helper function to determine if a color is light or dark
function isLightColor(color: string): boolean {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
}

// Get contrasting background color for cards
function getContrastColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#FFFFFF' : '#1F2937';
}

// Get contrasting text color for cards
function getContrastTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#1F2937' : '#F9FAFB';
}

export function BrandPreview() {
  const [settings, setSettings] = useState<BrandSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Listen for changes from the form
    const channel = new BroadcastChannel('brand-settings');
    channel.onmessage = (event) => {
      setSettings(event.data);
    };

    return () => channel.close();
  }, []);

  // Load Google Fonts dynamically
  useEffect(() => {
    const fonts = new Set([
      settings.typography.fontFamily,
      settings.typography.headingFont,
      settings.typography.bodyFont,
    ]);

    // Create font link
    const fontFamilies = Array.from(fonts)
      .map(font => font.replace(/ /g, '+'))
      .join('&family=');
    
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;
    link.rel = 'stylesheet';
    
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [settings.typography]);

  const cardRadius = RADIUS_MAP[settings.components.cardRadius];
  const shadowSize = SHADOW_MAP[settings.components.shadowSize];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <p className="text-sm text-gray-600">
          See how your brand settings will look in proposals
        </p>
      </CardHeader>
      <CardContent>
        <div 
          className="p-6 space-y-6 border-2 border-dashed border-gray-300 rounded-lg"
          style={{
            backgroundColor: settings.colors.background,
            color: settings.colors.text,
            fontFamily: `'${settings.typography.bodyFont}', sans-serif`,
          }}
        >
          {/* Logo */}
          {settings.logoUrl && (
            <div className="mb-6">
              <img 
                src={settings.logoUrl} 
                alt="Logo" 
                className="h-12 object-contain"
              />
            </div>
          )}

          {/* Hero Section */}
          <div className="space-y-3">
            <h1 
              className="text-3xl font-bold"
              style={{
                fontFamily: `'${settings.typography.headingFont}', sans-serif`,
                color: settings.colors.primary,
              }}
            >
              Commercial Proposal
            </h1>
            <p 
              className="text-lg"
              style={{
                fontFamily: `'${settings.typography.bodyFont}', sans-serif`,
                color: settings.colors.text,
              }}
            >
              Professional proposal for your business needs
            </p>
          </div>

          {/* Sample Card */}
          <div 
            className="p-4"
            style={{
              backgroundColor: getContrastColor(settings.colors.background),
              borderRadius: cardRadius,
              boxShadow: shadowSize,
              border: `1px solid ${settings.colors.text}20`,
            }}
          >
            <h3 
              className="text-lg font-semibold mb-2"
              style={{
                fontFamily: `'${settings.typography.headingFont}', sans-serif`,
                color: getContrastTextColor(settings.colors.background),
              }}
            >
              Project Overview
            </h3>
            <p 
              className="text-sm mb-4"
              style={{
                fontFamily: `'${settings.typography.bodyFont}', sans-serif`,
                color: getContrastTextColor(settings.colors.background),
              }}
            >
              This is a sample card showing how your content will appear with the selected brand settings.
            </p>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded text-white text-sm font-medium"
                style={{
                  backgroundColor: settings.colors.primary,
                  borderRadius: cardRadius,
                }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded text-white text-sm font-medium"
                style={{
                  backgroundColor: settings.colors.secondary,
                  borderRadius: cardRadius,
                }}
              >
                Secondary Button
              </button>
            </div>
          </div>

          {/* Typography Samples */}
          <div className="space-y-2">
            <h2 
              className="text-2xl font-bold"
              style={{
                fontFamily: `'${settings.typography.headingFont}', sans-serif`,
                color: settings.colors.text,
              }}
            >
              Heading 2
            </h2>
            <h3 
              className="text-xl font-semibold"
              style={{
                fontFamily: `'${settings.typography.headingFont}', sans-serif`,
                color: settings.colors.text,
              }}
            >
              Heading 3
            </h3>
            <p 
              className="text-base"
              style={{
                fontFamily: `'${settings.typography.bodyFont}', sans-serif`,
                color: settings.colors.text,
              }}
            >
              Body text: Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          {/* Color Palette */}
          <div className="space-y-2">
            <p 
              className="text-sm font-medium"
              style={{
                fontFamily: `'${settings.typography.bodyFont}', sans-serif`,
                color: settings.colors.text,
              }}
            >
              Color Palette:
            </p>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <div 
                  className="h-12 rounded"
                  style={{ 
                    backgroundColor: settings.colors.primary,
                    borderRadius: cardRadius,
                  }}
                />
                <p className="text-xs text-center">Primary</p>
              </div>
              <div className="flex-1 space-y-1">
                <div 
                  className="h-12 rounded"
                  style={{ 
                    backgroundColor: settings.colors.secondary,
                    borderRadius: cardRadius,
                  }}
                />
                <p className="text-xs text-center">Secondary</p>
              </div>
              <div className="flex-1 space-y-1">
                <div 
                  className="h-12 rounded border"
                  style={{ 
                    backgroundColor: settings.colors.background,
                    borderRadius: cardRadius,
                  }}
                />
                <p className="text-xs text-center">Background</p>
              </div>
              <div className="flex-1 space-y-1">
                <div 
                  className="h-12 rounded"
                  style={{ 
                    backgroundColor: settings.colors.text,
                    borderRadius: cardRadius,
                  }}
                />
                <p className="text-xs text-center">Text</p>
              </div>
            </div>
          </div>

          {/* Component Styles Info */}
          <div 
            className="p-3 rounded text-sm"
            style={{
              backgroundColor: `${settings.colors.primary}10`,
              borderRadius: cardRadius,
              color: settings.colors.text,
            }}
          >
            <p className="font-medium mb-1">Component Settings:</p>
            <ul className="text-xs space-y-1">
              <li>• Border Radius: {settings.components.cardRadius}</li>
              <li>• Shadow Size: {settings.components.shadowSize}</li>
            </ul>
          </div>
        </div>

        {/* Font Loading Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Fonts are loaded from Google Fonts. 
            The preview shows how your selected fonts will appear in the final proposal.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
