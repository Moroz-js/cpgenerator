// Block Registry for the Proposal Builder
// Defines metadata and default props for all block types

import {
  BlockType,
  BlockProps,
  HeroBlockProps,
  CasesBlockProps,
  TimelineBlockProps,
  TeamEstimateBlockProps,
  PaymentBlockProps,
  FAQBlockProps,
  FooterBlockProps,
  TextBlockProps,
  GalleryBlockProps,
} from './block-types';

// ============================================================================
// Block Categories
// ============================================================================

export enum BlockCategory {
  INTRO = 'intro',
  CASES = 'cases',
  TIMELINE = 'timeline',
  ESTIMATE = 'estimate',
  FAQ = 'faq',
  FOOTER = 'footer',
  CONTENT = 'content',
}

// ============================================================================
// Block Definition Interface
// ============================================================================

export interface BlockDefinition {
  id: BlockType;
  category: BlockCategory;
  label: string;
  description: string;
  icon?: string; // Icon name or emoji
  defaultProps: BlockProps;
}

// ============================================================================
// Block Definitions
// ============================================================================

export const blockDefinitions: BlockDefinition[] = [
  // ========== INTRO ==========
  {
    id: BlockType.HERO_SIMPLE,
    category: BlockCategory.INTRO,
    label: 'Hero Section',
    description: 'Главный заголовок с подзаголовком и CTA кнопкой',
    icon: '🎯',
    defaultProps: {
      title: 'Добро пожаловать',
      subtitle: 'Мы создаем выдающиеся решения для вашего бизнеса',
      ctaLabel: 'Начать',
      clientName: '',
    } as HeroBlockProps,
  },

  // ========== CASES ==========
  {
    id: BlockType.CASES_GRID,
    category: BlockCategory.CASES,
    label: 'Cases Grid',
    description: 'Сетка кейсов с карточками',
    icon: '📱',
    defaultProps: {
      layout: 'grid',
      caseIds: [],
      showTags: true,
      showLinks: true,
    } as CasesBlockProps,
  },
  {
    id: BlockType.CASES_SLIDER,
    category: BlockCategory.CASES,
    label: 'Cases Slider',
    description: 'Слайдер с кейсами',
    icon: '🎠',
    defaultProps: {
      layout: 'slider',
      caseIds: [],
      showTags: true,
      showLinks: true,
    } as CasesBlockProps,
  },
  {
    id: BlockType.CASES_ROW,
    category: BlockCategory.CASES,
    label: 'Cases Row',
    description: 'Горизонтальный ряд кейсов',
    icon: '➡️',
    defaultProps: {
      layout: 'row',
      caseIds: [],
      showTags: true,
      showLinks: false,
    } as CasesBlockProps,
  },

  // ========== TIMELINE ==========
  {
    id: BlockType.TIMELINE_LINEAR,
    category: BlockCategory.TIMELINE,
    label: 'Linear Timeline',
    description: 'Линейный таймлайн проекта',
    icon: '📅',
    defaultProps: {
      variant: 'linear',
      items: [
        {
          title: 'Этап 1',
          date: '',
          description: 'Описание этапа',
        },
      ],
    } as TimelineBlockProps,
  },
  {
    id: BlockType.TIMELINE_VERTICAL,
    category: BlockCategory.TIMELINE,
    label: 'Vertical Timeline',
    description: 'Вертикальный таймлайн',
    icon: '⬇️',
    defaultProps: {
      variant: 'vertical',
      items: [
        {
          title: 'Этап 1',
          date: '',
          description: 'Описание этапа',
        },
      ],
    } as TimelineBlockProps,
  },
  {
    id: BlockType.TIMELINE_PHASES,
    category: BlockCategory.TIMELINE,
    label: 'Timeline Phases',
    description: 'Таймлайн с фазами проекта',
    icon: '🔄',
    defaultProps: {
      variant: 'phases',
      items: [
        {
          title: 'Фаза 1',
          date: '',
          description: 'Описание фазы',
        },
      ],
    } as TimelineBlockProps,
  },

  // ========== ESTIMATE ==========
  {
    id: BlockType.TEAM_ESTIMATE,
    category: BlockCategory.ESTIMATE,
    label: 'Team Estimate',
    description: 'Оценка команды с расчетом стоимости',
    icon: '👥',
    defaultProps: {
      members: [
        {
          role: 'Frontend Developer',
          qty: 1,
          rate: 5000,
        },
      ],
      currency: 'RUB',
      showTotal: true,
    } as TeamEstimateBlockProps,
  },
  {
    id: BlockType.PAYMENT_SCHEDULE,
    category: BlockCategory.ESTIMATE,
    label: 'Payment Schedule',
    description: 'График платежей',
    icon: '💰',
    defaultProps: {
      items: [
        {
          label: 'Первый платеж',
          date: '',
          amount: 0,
        },
      ],
      currency: 'RUB',
    } as PaymentBlockProps,
  },

  // ========== FAQ ==========
  {
    id: BlockType.FAQ_ACCORDION,
    category: BlockCategory.FAQ,
    label: 'FAQ Accordion',
    description: 'FAQ в виде аккордеона',
    icon: '❓',
    defaultProps: {
      faqItemIds: [],
      layout: 'accordion',
    } as FAQBlockProps,
  },
  {
    id: BlockType.FAQ_LIST,
    category: BlockCategory.FAQ,
    label: 'FAQ List',
    description: 'FAQ в виде списка',
    icon: '📋',
    defaultProps: {
      faqItemIds: [],
      layout: 'list',
    } as FAQBlockProps,
  },

  // ========== FOOTER ==========
  {
    id: BlockType.CONTACTS_FOOTER,
    category: BlockCategory.FOOTER,
    label: 'Footer',
    description: 'Футер с контактами и соцсетями',
    icon: '📞',
    defaultProps: {
      contacts: [
        {
          email: '',
          phone: '',
        },
      ],
      layout: 'simple',
      copyrightText: '© 2024 Company Name',
    } as FooterBlockProps,
  },

  // ========== CONTENT ==========
  {
    id: BlockType.TEXT,
    category: BlockCategory.CONTENT,
    label: 'Text Block',
    description: 'Текстовый блок с форматированием',
    icon: '📝',
    defaultProps: {
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Начните вводить текст...',
              },
            ],
          },
        ],
      },
      align: 'left',
    } as TextBlockProps,
  },
  {
    id: BlockType.GALLERY,
    category: BlockCategory.CONTENT,
    label: 'Image Gallery',
    description: 'Галерея изображений (до 12 изображений)',
    icon: '🖼️',
    defaultProps: {
      imageUrls: [],
    } as GalleryBlockProps,
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get block definition by block type
 */
export function getBlockDefinition(blockType: BlockType): BlockDefinition | undefined {
  return blockDefinitions.find((def) => def.id === blockType);
}

/**
 * Get all blocks in a specific category
 */
export function getBlocksByCategory(category: BlockCategory): BlockDefinition[] {
  return blockDefinitions.filter((def) => def.category === category);
}

/**
 * Get all available categories
 */
export function getAllCategories(): BlockCategory[] {
  return Object.values(BlockCategory);
}

/**
 * Get category label for display
 */
export function getCategoryLabel(category: BlockCategory): string {
  const labels: Record<BlockCategory, string> = {
    [BlockCategory.INTRO]: 'Вступление',
    [BlockCategory.CASES]: 'Кейсы',
    [BlockCategory.TIMELINE]: 'Таймлайн',
    [BlockCategory.ESTIMATE]: 'Оценка и оплата',
    [BlockCategory.FAQ]: 'FAQ',
    [BlockCategory.FOOTER]: 'Футер',
    [BlockCategory.CONTENT]: 'Контент',
  };
  return labels[category];
}

/**
 * Get default props for a block type
 */
export function getDefaultProps(blockType: BlockType): BlockProps | undefined {
  const definition = getBlockDefinition(blockType);
  return definition?.defaultProps;
}

/**
 * Validate if a block type exists
 */
export function isValidBlockType(blockType: string): blockType is BlockType {
  return blockDefinitions.some((def) => def.id === blockType);
}
