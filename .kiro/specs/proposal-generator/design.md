# Документ проектирования

## Обзор

Система генерации коммерческих предложений — это full-stack веб-приложение, построенное на Next.js 16 и Supabase. Приложение использует серверные компоненты React для оптимальной производительности, Supabase для аутентификации, базы данных PostgreSQL и хранилища файлов, а также современные подходы к генерации PDF и управлению состоянием.

Архитектура следует принципам разделения ответственности с четким разграничением между клиентскими и серверными компонентами, использованием Server Actions для мутаций данных и оптимистичными обновлениями UI для улучшения пользовательского опыта.

## Архитектура

### Общая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App Router                    │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Server Components│  │ Client Components│                │
│  │  - Page layouts  │  │  - Forms         │                │
│  │  - Data fetching │  │  - Interactive UI│                │
│  └──────────────────┘  └──────────────────┘                │
│           │                      │                           │
│           └──────────┬───────────┘                           │
│                      │                                       │
│              ┌───────▼────────┐                             │
│              │ Server Actions │                             │
│              │  - Mutations   │                             │
│              │  - Validation  │                             │
│              └───────┬────────┘                             │
└──────────────────────┼──────────────────────────────────────┘
                       │
         ┌─────────────▼─────────────┐
         │      Supabase Client      │
         │  - Auth                   │
         │  - Database (PostgreSQL)  │
         │  - Storage                │
         └─────────────┬─────────────┘
                       │
         ┌─────────────▼─────────────┐
         │   External Services       │
         │  - Loom API               │
         │  - PDF Generation         │
         └───────────────────────────┘
```

### Слои приложения

1. **Presentation Layer (Next.js App Router)**
   - Server Components для статического контента и начальной загрузки данных
   - Client Components для интерактивных элементов (формы, редакторы)
   - Middleware для защиты маршрутов и проверки аутентификации

2. **Business Logic Layer (Server Actions & API Routes)**
   - Server Actions для мутаций данных
   - API Routes для внешних интеграций (webhooks, PDF generation)
   - Валидация данных с использованием Zod

3. **Data Access Layer (Supabase Client)**
   - Supabase Auth для управления пользователями
   - PostgreSQL через Supabase для хранения данных
   - Row Level Security (RLS) для изоляции данных воркспейсов
   - Supabase Storage для файлов и изображений

4. **External Services**
   - Loom API для встраивания видео
   - Puppeteer/Playwright для генерации PDF
   - Email service (Supabase Auth) для приглашений

## Компоненты и интерфейсы

### Основные модули

#### 1. Authentication Module

**Компоненты:**
- `LoginForm` (Client Component) - форма входа
- `SignUpForm` (Client Component) - форма регистрации
- `ResetPasswordForm` (Client Component) - форма сброса пароля
- `AuthProvider` (Client Component) - контекст аутентификации

**Server Actions:**
```typescript
// src/app/actions/auth.ts
async function signIn(email: string, password: string): Promise<Result<User>>
async function signUp(email: string, password: string): Promise<Result<User>>
async function signOut(): Promise<Result<void>>
async function resetPassword(email: string): Promise<Result<void>>
```

#### 2. Workspace Module

**Компоненты:**
- `WorkspaceSelector` (Client Component) - переключатель воркспейсов
- `WorkspaceSettings` (Server Component) - настройки воркспейса
- `InviteMemberForm` (Client Component) - форма приглашения
- `MemberList` (Server Component) - список участников

**Server Actions:**
```typescript
// src/app/actions/workspace.ts
async function createWorkspace(name: string): Promise<Result<Workspace>>
async function inviteMember(workspaceId: string, email: string): Promise<Result<Invitation>>
async function removeMember(workspaceId: string, userId: string): Promise<Result<void>>
async function acceptInvitation(token: string): Promise<Result<void>>
async function switchWorkspace(workspaceId: string): Promise<Result<void>>
```

#### 3. Case Library Module

**Компоненты:**
- `CaseList` (Server Component) - список кейсов
- `CaseCard` (Client Component) - карточка кейса
- `CaseEditor` (Client Component) - редактор кейса
- `CaseImageUploader` (Client Component) - загрузчик изображений

**Server Actions:**
```typescript
// src/app/actions/cases.ts
async function createCase(data: CaseInput): Promise<Result<Case>>
async function updateCase(id: string, data: CaseInput): Promise<Result<Case>>
async function deleteCase(id: string): Promise<Result<void>>
async function getCases(workspaceId: string, filters?: CaseFilters): Promise<Result<Case[]>>
async function uploadCaseImage(caseId: string, file: File): Promise<Result<string>>
```

#### 4. Proposal Module

**Компоненты:**
- `ProposalList` (Server Component) - список КП
- `ProposalEditor` (Client Component) - редактор КП
- `ProposalPreview` (Server Component) - превью КП
- `RichTextEditor` (Client Component) - rich-text редактор
- `TimelineEditor` (Client Component) - редактор таймлайна
- `TeamEstimateEditor` (Client Component) - редактор оценки команды
- `PaymentScheduleEditor` (Client Component) - редактор платежного календаря
- `CaseSelector` (Client Component) - выбор кейсов
- `LoomEmbedder` (Client Component) - встраивание Loom видео
- `PreviewAttachment` (Client Component) - прикрепление превью

**Server Actions:**
```typescript
// src/app/actions/proposals.ts
async function createProposal(workspaceId: string): Promise<Result<Proposal>>
async function updateProposal(id: string, data: ProposalInput): Promise<Result<Proposal>>
async function deleteProposal(id: string): Promise<Result<void>>
async function duplicateProposal(id: string): Promise<Result<Proposal>>
async function getProposals(workspaceId: string, filters?: ProposalFilters): Promise<Result<Proposal[]>>
async function autoSaveProposal(id: string, data: Partial<ProposalInput>): Promise<Result<void>>
```

#### 5. Public Link Module

**Компоненты:**
- `PublicProposalView` (Server Component) - публичный просмотр КП
- `PublicLinkGenerator` (Client Component) - генератор ссылок

**Server Actions:**
```typescript
// src/app/actions/public-links.ts
async function generatePublicLink(proposalId: string, slug: string): Promise<Result<PublicLink>>
async function deactivatePublicLink(linkId: string): Promise<Result<void>>
async function getPublicProposal(slug: string): Promise<Result<Proposal | null>>
```

#### 6. PDF Generation Module

**API Routes:**
```typescript
// src/app/api/pdf/generate/route.ts
async function POST(request: Request): Promise<Response>
// Генерирует PDF из HTML шаблона
```

**Компоненты:**
- `PDFTemplate` (Server Component) - шаблон для PDF
- `PDFDownloadButton` (Client Component) - кнопка скачивания

#### 7. Template Module

**Компоненты:**
- `TemplateList` (Server Component) - список шаблонов
- `TemplateCard` (Client Component) - карточка шаблона
- `TemplatePreview` (Server Component) - превью шаблона
- `CreateFromTemplateButton` (Client Component) - создание КП из шаблона

**Server Actions:**
```typescript
// src/app/actions/templates.ts
async function createTemplate(proposalId: string, name: string): Promise<Result<Template>>
async function updateTemplate(id: string, data: TemplateInput): Promise<Result<Template>>
async function deleteTemplate(id: string): Promise<Result<void>>
async function getTemplates(workspaceId: string): Promise<Result<Template[]>>
async function createProposalFromTemplate(templateId: string, workspaceId: string): Promise<Result<Proposal>>
```

#### 8. Comments Module

**Компоненты:**
- `CommentThread` (Client Component) - тред комментариев
- `CommentForm` (Client Component) - форма добавления комментария
- `CommentItem` (Client Component) - отдельный комментарий
- `CommentBadge` (Client Component) - индикатор количества комментариев

**Server Actions:**
```typescript
// src/app/actions/comments.ts
async function createComment(sectionId: string, content: string, parentId?: string): Promise<Result<Comment>>
async function updateComment(id: string, content: string): Promise<Result<Comment>>
async function deleteComment(id: string): Promise<Result<void>>
async function resolveComment(id: string): Promise<Result<Comment>>
async function getComments(sectionId: string): Promise<Result<Comment[]>>
```

#### 9. Collaboration Module

**Компоненты:**
- `ActiveUsers` (Client Component) - список активных пользователей
- `EditingIndicator` (Client Component) - индикатор редактирования раздела
- `PresenceProvider` (Client Component) - контекст присутствия пользователей
- `CollaborativeEditor` (Client Component) - редактор с поддержкой real-time

**Realtime Subscriptions:**
```typescript
// src/lib/realtime/presence.ts
function subscribeToProposalPresence(proposalId: string): RealtimeChannel
function broadcastPresence(proposalId: string, section: string): void
function subscribeToProposalChanges(proposalId: string, callback: (change: Change) => void): RealtimeChannel
function updatePresence(proposalId: string, sectionId?: string): Promise<void>
```

**Архитектура Real-time:**

Система использует Supabase Realtime для синхронизации изменений между пользователями:

1. **Presence Tracking**
   - Каждый пользователь отправляет heartbeat каждые 30 секунд
   - При открытии КП пользователь подписывается на канал присутствия
   - При редактировании раздела обновляется информация о текущем разделе
   - При закрытии КП или неактивности пользователь удаляется из списка

2. **Change Broadcasting**
   - Изменения в КП транслируются через Supabase Realtime
   - Используется optimistic UI для мгновенного отклика
   - Конфликты разрешаются по принципу "последний пишущий побеждает" (Last Write Wins)
   - Для критичных полей используется версионирование

3. **Offline Support**
   - Локальное хранение изменений при потере соединения
   - Автоматическая синхронизация при восстановлении
   - Индикатор статуса соединения для пользователя

4. **Conflict Resolution**
   - Разные разделы КП редактируются независимо
   - При одновременном редактировании одного раздела применяется LWW
   - Пользователь получает уведомление о конфликте

## Модели данных

### Database Schema (PostgreSQL)

```sql
-- Users (управляется Supabase Auth)
-- auth.users table

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace Members
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner' | 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'expired'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Cases
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  technologies JSONB DEFAULT '[]', -- Array of strings
  results TEXT,
  images JSONB DEFAULT '[]', -- Array of image URLs
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposals
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'sent' | 'accepted' | 'rejected'
  
  -- Content sections
  timeline JSONB, -- { start_date, end_date, milestones: [] }
  team_estimate JSONB, -- [{ role, hours, rate, total }]
  selected_cases JSONB DEFAULT '[]', -- Array of case IDs
  contacts JSONB, -- { email, phone, address }
  processes TEXT, -- Rich text
  tech_stack JSONB DEFAULT '[]', -- Array of technologies
  faq JSONB DEFAULT '[]', -- [{ question, answer }]
  payment_schedule JSONB DEFAULT '[]', -- [{ date, amount, description }]
  loom_videos JSONB DEFAULT '[]', -- [{ url, section }]
  
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_autosave TIMESTAMPTZ
);

-- Proposal Sections (для rich text с превью)
CREATE TABLE proposal_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- 'introduction' | 'approach' | 'custom'
  content JSONB NOT NULL, -- Rich text content with preview attachments
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preview Attachments
CREATE TABLE preview_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES proposal_sections(id) ON DELETE CASCADE,
  text_reference TEXT NOT NULL, -- Text that triggers the preview
  attachment_type TEXT NOT NULL, -- 'image' | 'link'
  attachment_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public Links
CREATE TABLE public_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ
);

-- Templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Template content (same structure as proposals)
  timeline JSONB,
  team_estimate JSONB,
  contacts JSONB,
  processes TEXT,
  tech_stack JSONB DEFAULT '[]',
  faq JSONB DEFAULT '[]',
  payment_schedule JSONB DEFAULT '[]',
  
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template Sections
CREATE TABLE template_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  content JSONB NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES proposal_sections(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Presence (для отслеживания активных пользователей)
CREATE TABLE presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id UUID REFERENCES proposal_sections(id) ON DELETE CASCADE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, user_id)
);

-- Indexes
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_cases_workspace ON cases(workspace_id);
CREATE INDEX idx_proposals_workspace ON proposals(workspace_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_public_links_slug ON public_links(slug);
CREATE INDEX idx_public_links_active ON public_links(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_templates_workspace ON templates(workspace_id);
CREATE INDEX idx_comments_section ON comments(section_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_resolved ON comments(is_resolved) WHERE is_resolved = FALSE;
CREATE INDEX idx_presence_proposal ON presence(proposal_id);
CREATE INDEX idx_presence_user ON presence(user_id);
```

### TypeScript Types

```typescript
// src/types/database.ts

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: string;
  user?: User;
}

export interface Case {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  technologies: string[];
  results?: string;
  images: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamEstimate {
  role: string;
  hours: number;
  rate: number;
  total: number;
}

export interface Timeline {
  startDate: string;
  endDate: string;
  milestones: Array<{
    title: string;
    date: string;
    description?: string;
  }>;
}

export interface PaymentScheduleItem {
  date: string;
  amount: number;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Proposal {
  id: string;
  workspaceId: string;
  title: string;
  clientName?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  timeline?: Timeline;
  teamEstimate?: TeamEstimate[];
  selectedCases: string[];
  contacts?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  processes?: string; // Rich text HTML
  techStack: string[];
  faq: FAQItem[];
  paymentSchedule: PaymentScheduleItem[];
  loomVideos: Array<{ url: string; section: string }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastAutosave?: string;
}

export interface ProposalSection {
  id: string;
  proposalId: string;
  sectionType: 'introduction' | 'approach' | 'custom';
  content: any; // Tiptap JSON or similar
  orderIndex: number;
}

export interface PreviewAttachment {
  id: string;
  sectionId: string;
  textReference: string;
  attachmentType: 'image' | 'link';
  attachmentUrl: string;
}

export interface PublicLink {
  id: string;
  proposalId: string;
  slug: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  deactivatedAt?: string;
}

export interface Template {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  timeline?: Timeline;
  teamEstimate?: TeamEstimate[];
  contacts?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  processes?: string;
  techStack: string[];
  faq: FAQItem[];
  paymentSchedule: PaymentScheduleItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSection {
  id: string;
  templateId: string;
  sectionType: 'introduction' | 'approach' | 'custom';
  content: any;
  orderIndex: number;
}

export interface Comment {
  id: string;
  sectionId: string;
  parentId?: string;
  authorId: string;
  content: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  author?: User;
  replies?: Comment[];
}

export interface Presence {
  id: string;
  proposalId: string;
  userId: string;
  sectionId?: string;
  lastSeen: string;
  user?: User;
}

export interface Template {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  timeline?: Timeline;
  teamEstimate?: TeamEstimate[];
  contacts?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  processes?: string;
  techStack: string[];
  faq: FAQItem[];
  paymentSchedule: PaymentScheduleItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSection {
  id: string;
  templateId: string;
  sectionType: 'introduction' | 'approach' | 'custom';
  content: any;
  orderIndex: number;
}

export interface Comment {
  id: string;
  sectionId: string;
  parentId?: string;
  authorId: string;
  content: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  author?: User;
  replies?: Comment[];
}

export interface Presence {
  id: string;
  proposalId: string;
  userId: string;
  sectionId?: string;
  lastSeen: string;
  user?: User;
}
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE preview_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_links ENABLE ROW LEVEL SECURITY;

-- Workspaces: users can only see workspaces they're members of
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Workspace members: users can view members of their workspaces
CREATE POLICY "Users can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Cases: users can only access cases from their workspaces
CREATE POLICY "Users can view workspace cases"
  ON cases FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cases in their workspaces"
  ON cases FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Similar policies for proposals, sections, etc.
-- Public links have special policy for anonymous access
CREATE POLICY "Anyone can view active public proposals"
  ON public_links FOR SELECT
  USING (is_active = TRUE);
```



## Свойства корректности

*Свойство — это характеристика или поведение, которое должно быть истинным для всех валидных выполнений системы — по сути, формальное утверждение о том, что система должна делать. Свойства служат мостом между человекочитаемыми спецификациями и машинно-проверяемыми гарантиями корректности.*

### Property 1: Создание аккаунта с валидными данными
*Для любого* валидного email и пароля, создание аккаунта должно завершиться успешно и создать запись пользователя в базе данных.
**Validates: Requirements 1.1**

### Property 2: Аутентификация после регистрации (Round-trip)
*Для любого* созданного аккаунта, попытка входа с теми же учетными данными должна быть успешной.
**Validates: Requirements 1.2**

### Property 3: Отклонение невалидных учетных данных
*Для любых* невалидных учетных данных (неправильный пароль, несуществующий email), попытка входа должна быть отклонена.
**Validates: Requirements 1.5**

### Property 4: Создатель воркспейса становится владельцем
*Для любого* созданного воркспейса, пользователь, создавший воркспейс, должен быть назначен владельцем.
**Validates: Requirements 2.1**

### Property 5: Уникальность токенов приглашений
*Для любых* двух приглашений, их токены должны быть уникальными.
**Validates: Requirements 2.2**

### Property 6: Принятие приглашения добавляет участника
*Для любого* валидного приглашения, его принятие должно добавить пользователя в список участников воркспейса.
**Validates: Requirements 2.3**

### Property 7: Удаление участника отзывает доступ
*Для любого* участника воркспейса, после удаления этот пользователь не должен иметь доступа к ресурсам воркспейса.
**Validates: Requirements 2.4**

### Property 8: Сохранение всех полей кейса
*Для любого* кейса с заполненными полями (название, описание, технологии, результаты, изображения), все поля должны быть сохранены и доступны при последующем чтении.
**Validates: Requirements 3.1**

### Property 9: Обновление кейса сохраняет изменения
*Для любого* существующего кейса, обновление его полей должно привести к сохранению новых значений.
**Validates: Requirements 3.2**

### Property 10: Удаление кейса делает его недоступным
*Для любого* кейса, после удаления попытка получить этот кейс должна возвращать ошибку "не найден".
**Validates: Requirements 3.3**

### Property 11: Список кейсов воркспейса полон
*Для любого* воркспейса, запрос списка кейсов должен возвращать все кейсы, принадлежащие этому воркспейсу, и не должен возвращать кейсы других воркспейсов.
**Validates: Requirements 3.4**

### Property 12: Изображения связаны с кейсом
*Для любого* загруженного изображения для кейса, изображение должно быть доступно в списке изображений этого кейса.
**Validates: Requirements 3.5**

### Property 13: Сохранение данных КП (Round-trip)
*Для любого* коммерческого предложения с заполненными полями (название, таймлайн, оценка, кейсы, контакты, процессы, стек, FAQ, платежный календарь), все данные должны быть сохранены и доступны при последующем чтении.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9**

### Property 14: Добавление Loom видео
*Для любой* валидной Loom ссылки, добавление её в КП должно сохранить ссылку в списке видео предложения.
**Validates: Requirements 5.1**

### Property 15: Удаление Loom видео
*Для любого* Loom видео в КП, удаление должно убрать видео из списка.
**Validates: Requirements 5.2**

### Property 16: Уникальность публичных ссылок
*Для любых* двух коммерческих предложений, их публичные ссылки (slug) должны быть уникальными.
**Validates: Requirements 6.1**

### Property 17: Синхронизация изменений с публичной ссылкой
*Для любого* КП с активной публичной ссылкой, изменения в содержимом КП должны быть видны при доступе по публичной ссылке.
**Validates: Requirements 6.3**

### Property 18: Деактивация публичной ссылки запрещает доступ
*Для любой* публичной ссылки, после деактивации доступ к КП по этой ссылке должен быть запрещен.
**Validates: Requirements 6.4**

### Property 19: Генерация PDF содержит все данные
*Для любого* коммерческого предложения, сгенерированный PDF должен содержать все разделы КП (название, таймлайн, оценку, кейсы, контакты и т.д.).
**Validates: Requirements 7.1**

### Property 20: Изображения встроены в PDF
*Для любого* КП с изображениями, сгенерированный PDF должен содержать все изображения.
**Validates: Requirements 7.3**

### Property 21: PDF доступен для скачивания
*Для любого* сгенерированного PDF, система должна предоставить валидную ссылку для скачивания файла.
**Validates: Requirements 7.5**

### Property 22: Связь превью с текстом
*Для любого* текстового блока с прикрепленным превью (изображение или ссылка), связь должна быть сохранена и доступна при чтении.
**Validates: Requirements 8.1, 8.2**

### Property 23: Удаление превью сохраняет текст
*Для любого* превью-контента, удаление превью должно удалить только превью, оставив текст без изменений.
**Validates: Requirements 8.4**

### Property 24: Оптимизация изображений
*Для любого* загруженного изображения превью, размер файла после оптимизации должен быть меньше или равен оригиналу.
**Validates: Requirements 8.5**

### Property 25: Список КП воркспейса полон
*Для любого* воркспейса, запрос списка КП должен возвращать все предложения воркспейса и не должен возвращать предложения других воркспейсов.
**Validates: Requirements 9.1**

### Property 26: Фильтрация КП по статусу
*Для любого* статуса, фильтрация списка КП должна возвращать только предложения с этим статусом.
**Validates: Requirements 9.2**

### Property 27: Поиск КП по названию
*Для любого* поискового запроса, результаты должны содержать только КП, в названии которых есть искомая подстрока.
**Validates: Requirements 9.3**

### Property 28: Каскадное удаление КП
*Для любого* коммерческого предложения, удаление КП должно также удалить все связанные данные (секции, превью, публичные ссылки).
**Validates: Requirements 9.4**

### Property 29: Дублирование создает независимую копию
*Для любого* КП, дублирование должно создать новое предложение с уникальным ID и копией всех данных, изменения в котором не влияют на оригинал.
**Validates: Requirements 9.5**

### Property 30: Проверка прав доступа к воркспейсу
*Для любого* пользователя и воркспейса, доступ должен быть предоставлен только если пользователь является участником этого воркспейса.
**Validates: Requirements 10.1**

### Property 31: Изоляция данных воркспейсов
*Для любого* пользователя, попытка доступа к ресурсам (кейсы, КП) воркспейса, в котором пользователь не является участником, должна быть отклонена.
**Validates: Requirements 10.2**

### Property 32: Валидация данных перед сохранением
*Для любых* невалидных данных (например, email без @, отрицательные суммы в платежном календаре), попытка сохранения должна быть отклонена с ошибкой валидации.
**Validates: Requirements 10.3**

### Property 33: Проверка типа и размера файлов
*Для любого* загружаемого файла, если тип файла не разрешен или размер превышает лимит, загрузка должна быть отклонена.
**Validates: Requirements 10.5**

### Property 34: Автосохранение сохраняет данные (Round-trip)
*Для любого* КП, после автосохранения и последующей загрузки, данные должны соответствовать последней автосохраненной версии.
**Validates: Requirements 11.2, 11.3**

### Property 35: Сохранение форматирования текста (Round-trip)
*Для любого* форматированного текста (жирный, курсив, списки, заголовки, ссылки), сохранение и последующее чтение должно сохранить все форматирование.
**Validates: Requirements 12.1, 12.2, 12.3**

### Property 36: Форматирование в PDF (Round-trip)
*Для любого* форматированного текста в КП, сгенерированный PDF должен содержать эквивалентное форматирование.
**Validates: Requirements 12.4**

### Property 37: Форматирование по публичной ссылке
*Для любого* форматированного текста в КП, отображение по публичной ссылке должно сохранить форматирование.
**Validates: Requirements 12.5**

### Property 38: Сохранение КП как шаблона
*Для любого* коммерческого предложения, сохранение как шаблона должно создать шаблон со всей структурой и содержимым КП.
**Validates: Requirements 13.1**

### Property 39: Создание КП из шаблона (Round-trip)
*Для любого* шаблона, создание КП из шаблона должно скопировать все данные шаблона в новое КП.
**Validates: Requirements 13.2**

### Property 40: Независимость шаблона от созданных КП
*Для любого* шаблона, изменения в шаблоне не должны влиять на КП, созданные из этого шаблона ранее.
**Validates: Requirements 13.3**

### Property 41: Удаление шаблона не влияет на КП
*Для любого* шаблона, удаление шаблона не должно влиять на существующие КП, созданные из этого шаблона.
**Validates: Requirements 13.4**

### Property 42: Список шаблонов воркспейса полон
*Для любого* воркспейса, запрос списка шаблонов должен возвращать все шаблоны воркспейса и не должен возвращать шаблоны других воркспейсов.
**Validates: Requirements 13.5**

### Property 43: Сохранение комментария с метаданными
*Для любого* комментария, система должна сохранить автора и время создания вместе с содержимым.
**Validates: Requirements 14.1**

### Property 44: Вложенные комментарии
*Для любого* комментария, ответ на него должен создать вложенный комментарий с правильной ссылкой на родительский комментарий.
**Validates: Requirements 14.2**

### Property 45: Удаление комментария
*Для любого* комментария, после удаления попытка получить этот комментарий должна возвращать ошибку "не найден".
**Validates: Requirements 14.3**

### Property 46: Изменение статуса комментария
*Для любого* комментария, пометка как решенного должна изменить статус isResolved на true.
**Validates: Requirements 14.4**

### Property 47: Подсчет активных комментариев
*Для любого* раздела КП, количество активных (нерешенных) комментариев должно соответствовать фактическому количеству комментариев с isResolved = false.
**Validates: Requirements 14.5**

### Property 48: Синхронизация изменений без конфликтов
*Для любых* двух участников, редактирующих разные разделы КП одновременно, все изменения должны быть синхронизированы без потери данных.
**Validates: Requirements 15.2**

### Property 49: Список активных участников
*Для любого* КП, список активных участников должен содержать всех пользователей, которые открыли это КП и не закрыли его.
**Validates: Requirements 15.3**

### Property 50: Индикатор редактирования раздела
*Для любого* раздела, когда участник редактирует его, другие участники должны видеть индикатор с информацией о редактирующем пользователе.
**Validates: Requirements 15.4**

### Property 38: Создание шаблона сохраняет структуру КП
*Для любого* коммерческого предложения, создание шаблона должно сохранить всю структуру и содержимое КП в шаблоне.
**Validates: Requirements 13.1**

### Property 39: Создание КП из шаблона (Round-trip)
*Для любого* шаблона, создание КП из шаблона должно скопировать все содержимое шаблона в новое КП.
**Validates: Requirements 13.2**

### Property 40: Независимость шаблона и КП
*Для любого* КП, созданного из шаблона, изменения в шаблоне не должны влиять на содержимое этого КП.
**Validates: Requirements 13.3**

### Property 41: Удаление шаблона не влияет на КП
*Для любого* шаблона, удаление шаблона не должно влиять на существующие КП, созданные из этого шаблона.
**Validates: Requirements 13.4**

### Property 42: Список шаблонов воркспейса полон
*Для любого* воркспейса, запрос списка шаблонов должен возвращать все шаблоны воркспейса и не должен возвращать шаблоны других воркспейсов.
**Validates: Requirements 13.5**

### Property 43: Сохранение комментария с метаданными
*Для любого* комментария к разделу КП, комментарий должен быть сохранен с указанием автора и времени создания.
**Validates: Requirements 14.1**

### Property 44: Вложенность комментариев
*Для любого* комментария, ответ на него должен создать вложенный комментарий с корректной связью parent-child.
**Validates: Requirements 14.2**

### Property 45: Удаление комментария автором
*Для любого* комментария, автор должен иметь возможность удалить его, после чего комментарий не должен быть доступен.
**Validates: Requirements 14.3**

### Property 46: Изменение статуса комментария
*Для любого* комментария, изменение статуса на "решенный" должно сохраниться и отразиться в списке комментариев.
**Validates: Requirements 14.4**

### Property 47: Подсчет активных комментариев
*Для любого* раздела КП, количество отображаемых активных (нерешенных) комментариев должно соответствовать фактическому количеству нерешенных комментариев в этом разделе.
**Validates: Requirements 14.5**

### Property 48: Синхронизация изменений без конфликтов
*Для любых* двух участников, редактирующих разные разделы КП одновременно, все изменения должны быть синхронизированы без потери данных или конфликтов.
**Validates: Requirements 15.2**

### Property 49: Список активных пользователей
*Для любого* КП, список отображаемых активных пользователей должен соответствовать пользователям, которые в данный момент просматривают или редактируют это КП.
**Validates: Requirements 15.3**

### Property 50: Индикатор редактирования раздела
*Для любого* раздела КП, если пользователь редактирует раздел, другие пользователи должны видеть индикатор активного редактирования этого раздела.
**Validates: Requirements 15.4**

## Обработка ошибок

### Стратегия обработки ошибок

1. **Валидация на клиенте**
   - Использование Zod схем для валидации форм
   - Немедленная обратная связь пользователю
   - Предотвращение отправки невалидных данных

2. **Валидация на сервере**
   - Повторная валидация всех данных в Server Actions
   - Защита от обхода клиентской валидации
   - Возврат типизированных ошибок

3. **Обработка ошибок базы данных**
   - Обработка constraint violations (уникальность, foreign keys)
   - Транзакции для атомарных операций
   - Откат при ошибках

4. **Обработка ошибок внешних сервисов**
   - Retry логика для временных сбоев
   - Graceful degradation (например, если Loom недоступен)
   - Логирование ошибок для мониторинга

### Стратегия логирования для отладки

**ВАЖНО:** Все функции должны включать подробное логирование для упрощения отладки.

1. **Логирование в Server Actions**
   - Логировать входные параметры функций
   - Логировать промежуточные результаты запросов к базе данных
   - Логировать все ошибки с полным контекстом (stack trace, параметры)
   - Использовать `console.log()` для успешных операций
   - Использовать `console.error()` для ошибок
   - Включать JSON.stringify() для сложных объектов

2. **Логирование запросов к базе данных**
   - Логировать SQL запросы (через Supabase client)
   - Логировать результаты запросов (data, error)
   - Логировать время выполнения запросов для оптимизации

3. **Логирование аутентификации и авторизации**
   - Логировать попытки входа (успешные и неуспешные)
   - Логировать проверки прав доступа
   - Логировать создание и принятие приглашений

4. **Структура логов**
   ```typescript
   // Пример логирования в Server Action
   console.log('=== createProposal START ===');
   console.log('Input:', { workspaceId, userId });
   
   const { data, error } = await supabase.from('proposals').insert(...);
   console.log('Database response:', { data, error });
   
   if (error) {
     console.error('Error creating proposal:', error);
     console.error('Error details:', JSON.stringify(error, null, 2));
   }
   
   console.log('=== createProposal END ===');
   ```

5. **Логирование в production**
   - В production использовать уровни логирования (info, warn, error)
   - Отправлять критичные ошибки в систему мониторинга (Sentry)
   - Не логировать чувствительные данные (пароли, токены)

5. **Типы ошибок**

```typescript
// src/types/errors.ts

export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: AppError };

export type AppError = 
  | ValidationError
  | AuthenticationError
  | AuthorizationError
  | NotFoundError
  | ConflictError
  | ExternalServiceError
  | UnknownError;

export interface ValidationError {
  type: 'validation';
  message: string;
  fields?: Record<string, string[]>;
}

export interface AuthenticationError {
  type: 'authentication';
  message: string;
}

export interface AuthorizationError {
  type: 'authorization';
  message: string;
  resource?: string;
}

export interface NotFoundError {
  type: 'not_found';
  message: string;
  resource: string;
}

export interface ConflictError {
  type: 'conflict';
  message: string;
  field?: string;
}

export interface ExternalServiceError {
  type: 'external_service';
  message: string;
  service: string;
}

export interface UnknownError {
  type: 'unknown';
  message: string;
}
```

### Error Boundaries

- React Error Boundaries для перехвата ошибок рендеринга
- Fallback UI с возможностью повторной попытки
- Логирование ошибок для отладки

### Пользовательские сообщения

- Понятные сообщения об ошибках на русском языке
- Конкретные инструкции по исправлению
- Toast уведомления для временных ошибок
- Inline ошибки для полей форм

## Стратегия тестирования

### Unit Testing

**Фреймворк:** Vitest

**Что тестируем:**
- Утилитарные функции (валидация, форматирование)
- Бизнес-логика в Server Actions
- Компоненты с помощью React Testing Library
- Специфические edge cases (пустые данные, граничные значения)

**Примеры unit тестов:**
- Валидация email и паролей
- Форматирование дат и сумм
- Генерация уникальных slug для публичных ссылок
- Обработка ошибок в Server Actions

### Property-Based Testing

**Фреймворк:** fast-check (для TypeScript/JavaScript)

**Конфигурация:** Минимум 100 итераций для каждого property теста

**Что тестируем:**
- Универсальные свойства, которые должны выполняться для всех входных данных
- Round-trip свойства (сохранение-загрузка, сериализация-десериализация)
- Инварианты (например, создатель воркспейса всегда владелец)
- Изоляция данных между воркспейсами

**Аннотация тестов:**
Каждый property-based тест должен быть помечен комментарием:
```typescript
// **Feature: proposal-generator, Property 13: Сохранение данных КП (Round-trip)**
```

**Примеры property тестов:**
- Property 13: Для любого КП, сохранение и загрузка возвращает те же данные
- Property 16: Для любых двух КП, их публичные ссылки уникальны
- Property 31: Для любого пользователя, доступ к чужим воркспейсам запрещен

### Integration Testing

**Фреймворк:** Playwright

**Что тестируем:**
- End-to-end пользовательские сценарии
- Интеграция с Supabase (auth, database, storage)
- Генерация PDF
- Публичные ссылки

**Примеры интеграционных тестов:**
- Полный flow создания КП от входа до генерации PDF
- Приглашение пользователя в воркспейс
- Загрузка и отображение изображений

### Test Database

- Использование Supabase local development для тестов
- Seed данные для консистентных тестов
- Очистка данных между тестами

### Continuous Integration

- Запуск всех тестов на каждый push
- Проверка типов TypeScript
- Линтинг кода
- Проверка покрытия кода (минимум 80% для критичных модулей)

## Технологический стек

### Frontend
- **Next.js 16** - React фреймворк с App Router
- **React 19** - UI библиотека
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **shadcn/ui** - компоненты UI (https://ui.shadcn.com/)
- **Tiptap** - rich-text редактор с поддержкой collaboration
- **React Hook Form** - управление формами
- **Zod** - валидация схем
- **date-fns** - работа с датами
- **Supabase Realtime** - real-time синхронизация для совместной работы

### Backend
- **Next.js Server Actions** - мутации данных
- **Next.js API Routes** - внешние интеграции
- **Supabase Client** - взаимодействие с Supabase

### Database & Auth
- **Supabase** - PostgreSQL, Auth, Storage
- **PostgreSQL** - реляционная база данных
- **Row Level Security** - изоляция данных

### External Services
- **Loom API** - встраивание видео
- **Puppeteer** или **Playwright** - генерация PDF
- **Sharp** - оптимизация изображений

### Testing
- **Vitest** - unit тесты
- **fast-check** - property-based тесты
- **React Testing Library** - тестирование компонентов
- **Playwright** - E2E тесты

### Development Tools
- **ESLint** - линтинг
- **Prettier** - форматирование кода
- **Husky** - git hooks
- **TypeScript** - проверка типов

## Производительность и оптимизация

### Оптимизация загрузки

1. **Server Components по умолчанию**
   - Минимизация JavaScript на клиенте
   - Использование Client Components только для интерактивности

2. **Streaming и Suspense**
   - Потоковая передача контента
   - Показ UI по мере готовности данных

3. **Оптимизация изображений**
   - Next.js Image component для автоматической оптимизации
   - WebP формат с fallback
   - Lazy loading для изображений вне viewport

4. **Code Splitting**
   - Автоматическое разделение кода Next.js
   - Dynamic imports для тяжелых компонентов (редакторы, PDF viewer)

### Кэширование

1. **Next.js Cache**
   - Кэширование Server Components
   - Revalidation стратегии для динамических данных

2. **Supabase Cache**
   - Кэширование запросов на уровне клиента
   - Оптимистичные обновления UI

3. **CDN для статики**
   - Vercel Edge Network для статических ресурсов
   - Supabase Storage CDN для изображений

### Database Optimization

1. **Индексы**
   - Индексы на часто запрашиваемые поля
   - Composite индексы для сложных запросов

2. **Pagination**
   - Cursor-based pagination для больших списков
   - Limit/offset для простых случаев

3. **Eager Loading**
   - Загрузка связанных данных одним запросом
   - Избегание N+1 проблемы

## Безопасность

### Аутентификация и авторизация

1. **Supabase Auth**
   - JWT токены для аутентификации
   - Refresh tokens для продления сессий
   - Secure cookies для хранения токенов

2. **Row Level Security (RLS)**
   - Политики на уровне базы данных
   - Изоляция данных воркспейсов
   - Проверка прав доступа в каждом запросе

3. **Middleware Protection**
   - Защита приватных маршрутов
   - Редирект неавторизованных пользователей
   - Проверка членства в воркспейсе

### Защита данных

1. **Валидация входных данных**
   - Zod схемы на клиенте и сервере
   - Санитизация HTML в rich-text контенте
   - Проверка типов и размеров файлов

2. **CSRF Protection**
   - Next.js встроенная защита от CSRF
   - SameSite cookies

3. **XSS Protection**
   - Санитизация пользовательского контента
   - Content Security Policy headers
   - Безопасное встраивание Loom видео

4. **SQL Injection Protection**
   - Параметризованные запросы через Supabase Client
   - ORM-подобный интерфейс предотвращает инъекции

### Безопасность файлов

1. **Проверка типов файлов**
   - Whitelist разрешенных MIME типов
   - Проверка magic bytes, не только расширения

2. **Ограничение размера**
   - Максимальный размер файла (например, 10MB)
   - Квоты на воркспейс

3. **Безопасное хранение**
   - Supabase Storage с RLS политиками
   - Signed URLs для приватных файлов
   - CDN для публичных файлов

## Deployment и Infrastructure

### Hosting

- **Vercel** - хостинг Next.js приложения
- **Supabase Cloud** - managed PostgreSQL, Auth, Storage
- Автоматический deploy на каждый push в main

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LOOM_API_KEY=
```

### Monitoring

- **Vercel Analytics** - производительность и Web Vitals
- **Supabase Dashboard** - мониторинг базы данных
- **Sentry** (опционально) - отслеживание ошибок

### Backup

- Автоматические бэкапы Supabase
- Point-in-time recovery
- Экспорт данных для миграции

## Будущие улучшения

1. **Версионирование КП**
   - История изменений
   - Возможность отката к предыдущим версиям
   - Сравнение версий

2. **Аналитика**
   - Отслеживание просмотров публичных ссылок
   - Время, проведенное на странице
   - Конверсия КП в сделки
   - Тепловая карта взаимодействия с КП

3. **Интеграции**
   - CRM системы (Bitrix24, AmoCRM)
   - Календари для синхронизации таймлайнов
   - Системы учета времени
   - Slack/Telegram уведомления

4. **Мультиязычность**
   - Поддержка нескольких языков интерфейса
   - Генерация КП на разных языках
   - Автоматический перевод контента

5. **Расширенная кастомизация PDF**
   - Выбор шаблонов оформления
   - Брендинг (логотипы, цвета)
   - Кастомные шрифты
   - Водяные знаки

6. **Расширенная совместная работа**
   - Видеозвонки прямо в интерфейсе
   - Совместное курсорное редактирование (как в Figma)
   - Упоминания пользователей в комментариях (@mentions)

7. **AI-ассистент**
   - Генерация текста для разделов КП
   - Предложения по улучшению контента
   - Автоматический подбор кейсов
