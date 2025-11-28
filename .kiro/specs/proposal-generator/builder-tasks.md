# Builder КП - План реализации

## 📋 Статус: Миграции выполнены, начинаем реализацию кода

**Базовое ТЗ:** `.kiro/specs/proposal-generator/builder2.0.md`

## ⚠️ ВАЖНОЕ ТРЕБОВАНИЕ: Логирование

**Все функции и Server Actions должны включать подробное логирование:**
- Логировать входные параметры
- Логировать результаты запросов к БД
- Логировать ошибки с `JSON.stringify(error, null, 2)`
- Использовать префиксы `=== functionName START/END ===`

---

## ✅ 1. Миграции базы данных (ЗАВЕРШЕНО)

- [x] 1.1 Создать таблицы и storage для билдера
  - Создать workspace_brand_settings, proposal_blocks, proposal_snapshots (миграция 009)
  - Добавить loom_url в proposals (миграция 009)
  - Создать Storage bucket proposal-media (миграция 010)
  - **Статус:** Все миграции применены
  - _Ref: builder2.0.md разделы 1.1, 2.1, 6_

---

## 2. Типы, валидация и Server Actions (ЗАВЕРШЕНО)



- [x] 2.1 Создать TypeScript типы для брендинга и блоков


  - Добавить в src/types/database.ts:
    - `WorkspaceBrandSettings` interface с полями: id, workspace_id, logo_url, colors, typography, components, seo, created_at, updated_at
    - `BrandColors` type: { primary: string, secondary: string, background: string, text: string }
    - `BrandTypography` type: { fontFamily: string, headingFont: string, bodyFont: string }
    - `BrandComponents` type: { cardRadius: string, shadowSize: string }
    - `BrandSEO` type: { title: string, description: string, ogImage: string }
    - `ProposalBlock` interface с полями: id, proposal_id, type, order_index, props, style_overrides, created_at, updated_at
    - `ProposalSnapshot` interface с полями: id, proposal_id, public_link_id, brand, blocks, meta, created_at
  - **Важно:** Использовать точные названия полей из миграции 009
  - _Ref: builder2.0.md разделы 1.1, 2.1, 6_

- [x] 2.2 Создать Zod схемы для валидации брендинга


  - Создать src/lib/validations/brand.ts:
    - `brandColorsSchema` - валидация hex-цветов (#RRGGBB) для primary, secondary, background, text
    - `brandTypographySchema` - enum шрифтов: "Inter" | "Roboto" | "Montserrat" | "Poppins" | "Open Sans" | "Source Sans 3"
    - `brandComponentsSchema` - enum radius: "none" | "sm" | "md" | "lg" | "xl", enum shadow: "none" | "sm" | "md" | "lg" | "xl"
    - `brandSEOSchema` - валидация title (string), description (string), ogImage (url или пустая строка)
    - `brandSettingsSchema` - полная схема с всеми полями
    - `brandSettingsInputSchema` - для upsert (все поля optional кроме workspaceId)
  - **Важно:** Строгая валидация шрифтов (только 6 вариантов), radius (только 5 вариантов)
  - _Ref: builder2.0.md разделы 1.1, 1.2_


- [x] 2.3 Создать Zod схемы для валидации блоков


  - Создать src/lib/validations/blocks.ts:
    - `heroBlockPropsSchema` - { title: string (required), subtitle?: string, ctaLabel?: string, clientName?: string }
    - `casesBlockPropsSchema` - { layout: "slider" | "grid" | "row", caseIds: string[], showTags?: boolean, showLinks?: boolean }
    - `timelineBlockPropsSchema` - { variant: "linear" | "vertical" | "phases", items: [{ title: string, date?: string, description?: string }] }
    - `teamEstimateBlockPropsSchema` - { members: [{ role: string, qty: number, rate: number }], showTotal?: boolean, currency?: string }
    - `paymentBlockPropsSchema` - { items: [{ label: string, date?: string, amount: number }], currency?: string }
    - `faqBlockPropsSchema` - { faqItemIds: string[], layout: "accordion" | "list" }
    - `contactsBlockPropsSchema` - { contacts: [{ label: string, name?: string, email?: string, phone?: string, linkLabel?: string, linkUrl?: string }] }
    - `textBlockPropsSchema` - { content: any (TiptapJSON), align?: "left" | "center" | "right" }
    - `galleryBlockPropsSchema` - { imageUrls: string[] } с валидацией max 12 элементов
    - `blockTypeSchema` - enum всех типов блоков: "hero_simple" | "cases_grid" | "timeline" | "team_estimate" | "payment" | "faq" | "contacts" | "text" | "gallery"
    - `proposalBlockSchema` - полная схема блока с id, proposal_id, type, order_index, props, style_overrides
  - **Важно:** Валидация currency (любая строка, но рекомендуется RUB/USD/EUR), max 12 изображений в gallery, валидация email/phone/url в contacts
  - _Ref: builder2.0.md раздел 2.3, Ответ 2, Ответ 3_

- [x] 2.4 Создать справочник блоков


  - Создать src/lib/builder/block-types.ts:
    - `BlockType` enum со всеми типами блоков
    - Type guards: `isHeroBlock(block)`, `isCasesBlock(block)`, etc.
    - Helper функции для работы с типами блоков
  - Создать src/lib/builder/blocks-registry.ts:
    - `BlockDefinition` interface: { id: string, category: string, label: string, description: string, icon: LucideIcon, defaultProps: any }
    - `blockDefinitions` массив с metadata для всех 9 блоков
    - **Категории:** "Intro", "Cases", "Timeline", "Team Estimate", "Payment Schedule", "FAQ", "Contacts", "Text", "Gallery"
    - **Default props для каждого блока:**
      - hero_simple: { title: "Заголовок проекта", subtitle: "", ctaLabel: "Начать", clientName: "" }
      - cases_grid: { layout: "grid", caseIds: [], showTags: true, showLinks: true }
      - timeline: { variant: "linear", items: [] }
      - team_estimate: { members: [], showTotal: true, currency: "RUB" }
      - payment: { items: [], currency: "RUB" }
      - faq: { faqItemIds: [], layout: "accordion" }
      - contacts: { contacts: [] }
      - text: { content: null, align: "left" }
      - gallery: { imageUrls: [] }
    - Функции:
      - `getBlockDefinition(type: BlockType): BlockDefinition` - получить metadata блока по типу
      - `getBlocksByCategory(category: string): BlockDefinition[]` - получить все блоки категории
      - `getAllCategories(): string[]` - получить список всех категорий
  - **Важно:** Использовать lucide-react иконки для каждого блока (Layout, Image, Clock, Users, CreditCard, HelpCircle, Phone, FileText, Images)
  - _Ref: builder2.0.md раздел 2.2_

- [x] 2.5 Реализовать Server Actions для брендинга


  - Создать src/app/actions/brand.ts:
    - `getWorkspaceBrandSettings(workspaceId: string): Promise<Result<WorkspaceBrandSettings | null>>`
      - Проверка доступа: SELECT workspace_members WHERE workspace_id = ? AND user_id = auth.uid()
      - SELECT workspace_brand_settings WHERE workspace_id = ?
      - Возврат null если не создано (не ошибка)
      - Полное логирование: входные параметры, результат запроса, ошибки
    - `upsertWorkspaceBrandSettings(workspaceId: string, data: BrandSettingsInput): Promise<Result<WorkspaceBrandSettings>>`
      - Проверка доступа через workspace_members
      - Валидация data через brandSettingsInputSchema
      - UPSERT: INSERT ... ON CONFLICT (workspace_id) DO UPDATE
      - Возврат обновленной записи
      - Полное логирование
  - **Важно:** Использовать Result<T> type из @/types/errors
  - **Важно:** Использовать createClient() from @/lib/supabase/server
  - **Важно:** Валидировать hex-цвета и enum значения через Zod
  - _Ref: builder2.0.md раздел 1.2_


- [x] 2.6 Реализовать Server Actions для блоков


  - Создать src/app/actions/proposal-blocks.ts:
    - `getProposalBlocks(proposalId: string): Promise<Result<ProposalBlock[]>>`
      - Проверка доступа: proposal → workspace → workspace_members
      - SELECT * FROM proposal_blocks WHERE proposal_id = ? ORDER BY order_index ASC
      - Полное логирование
    - `createProposalBlock(proposalId: string, type: BlockType, props: any, orderIndex?: number): Promise<Result<ProposalBlock>>`
      - Проверка доступа через proposal → workspace
      - Валидация type через blockTypeSchema
      - Валидация props через соответствующую схему (switch по type)
      - Если orderIndex не указан: SELECT MAX(order_index) + 1
      - INSERT с возвратом созданного блока
      - Полное логирование
    - `updateProposalBlock(blockId: string, props?: any, styleOverrides?: any): Promise<Result<ProposalBlock>>`
      - Проверка доступа через block → proposal → workspace
      - Валидация props если передан (через соответствующую схему по block.type)
      - UPDATE только переданных полей (props и/или styleOverrides)
      - Возврат обновленного блока
      - Полное логирование
    - `deleteProposalBlock(blockId: string): Promise<Result<void>>`
      - Проверка доступа через block → proposal → workspace
      - DELETE FROM proposal_blocks WHERE id = ?
      - Полное логирование
    - `reorderProposalBlocks(proposalId: string, orderedIds: string[]): Promise<Result<void>>`
      - Проверка доступа через proposal → workspace
      - Валидация: все ID существуют и принадлежат proposalId
      - Транзакция: UPDATE order_index для каждого блока по порядку (0, 1, 2, ...)
      - Полное логирование
    - `duplicateProposalBlock(blockId: string): Promise<Result<ProposalBlock>>`
      - Проверка доступа через block → proposal → workspace
      - SELECT оригинального блока
      - Копирование всех полей кроме id
      - Вставка после оригинала: order_index = original.order_index + 1
      - Транзакция: сдвиг order_index всех последующих блоков на +1
      - Возврат нового блока
      - Полное логирование
  - **Важно:** Все функции возвращают Result<T> type
  - **Важно:** Использовать createClient() from @/lib/supabase/server
  - **Важно:** Использовать транзакции для reorder и duplicate
  - _Ref: builder2.0.md раздел 3_

---

## 3. UI страницы брендинга (ЗАВЕРШЕНО)



- [x] 3.1 Создать страницу настроек брендинга


  - Создать src/app/workspace/[workspaceId]/settings/brand/page.tsx:
    - Server Component для загрузки данных
    - Загрузка workspace через params.workspaceId
    - Загрузка brand settings через getWorkspaceBrandSettings(workspaceId)
    - Проверка доступа (middleware уже проверяет workspace membership)
    - Передача данных в BrandSettingsForm
    - Обработка случая когда brand settings еще не созданы (передать null)
  - _Ref: builder2.0.md раздел 1.3_

- [x] 3.2 Создать форму настроек брендинга


  - Создать src/components/brand/BrandSettingsForm.tsx:
    - Client Component ('use client')
    - Layout: форма слева (60%), превью справа (40%) - использовать CSS Grid или Flexbox
    - React Hook Form + zodResolver(brandSettingsInputSchema)
    - **Поля формы:**
      - Upload логотипа: input type="file" accept="image/*", upload в Supabase Storage bucket (avatars или создать brand-logos), показать превью
      - Color pickers: 4 input type="color" для primary, secondary, background, text
      - Select для fontFamily: 6 вариантов (Inter, Roboto, Montserrat, Poppins, Open Sans, Source Sans 3)
      - Select для headingFont: те же 6 вариантов
      - Select для bodyFont: те же 6 вариантов
      - Select для cardRadius: 5 вариантов (none, sm, md, lg, xl)
      - Select для shadowSize: 5 вариантов (none, sm, md, lg, xl)
      - Input для SEO title: text
      - Textarea для SEO description: textarea
      - Input для SEO ogImage: url
    - Кнопка "Сохранить" вызывает upsertWorkspaceBrandSettings
    - Показ ошибок валидации под каждым полем
    - Toast уведомления об успехе/ошибке (использовать shadcn/ui Toast или Sonner)
    - Loading state при сохранении (disabled кнопка, spinner)
  - **Важно:** Использовать shadcn/ui компоненты (Input, Select, Label, Button, Textarea)
  - **Важно:** Передавать изменения в BrandPreview через props для реактивного обновления
  - _Ref: builder2.0.md раздел 1.3_


- [x] 3.3 Создать компонент превью брендинга


  - Создать src/components/brand/BrandPreview.tsx:
    - Client Component
    - Props: brand settings (colors, typography, components, logo_url)
    - Мини-превью КП с применёнными стилями
    - Реактивное обновление при изменении формы (useEffect на props)
    - Применение CSS variables:
      - `--color-primary`, `--color-secondary`, `--color-background`, `--color-text`
      - `--font-family`, `--font-heading`, `--font-body`
      - `--card-radius`, `--shadow-size`
    - Показывает:
      - Логотип (если загружен) - img с logo_url
      - Hero секцию с primary цветом и heading font
      - Карточку кейса с cardRadius и shadow
      - Текст с body font
    - Стилизация: использовать те же классы и стили, что будут в публичном просмотре
  - **Важно:** Использовать те же CSS variables, что будут в BlocksCanvas и PublicProposalView
  - _Ref: builder2.0.md раздел 1.3_

- [x] 3.4 Checkpoint - Тестирование брендинга


  - Проверить сохранение и загрузку настроек (создать новые, обновить существующие)
  - Проверить валидацию (невалидные hex-цвета, несуществующие шрифты, невалидные enum значения)
  - Проверить RLS (доступ только членам воркспейса, попытка доступа к чужому воркспейсу)
  - Проверить upload логотипа (загрузка, превью, сохранение URL)
  - Проверить реактивное превью (изменение цвета → мгновенное обновление превью)
  - Проверить Toast уведомления (успех, ошибка)

---

## 4. Базовая структура билдера (ЗАВЕРШЕНО)



- [x] 4.1 Создать страницу билдера


  - Создать src/app/workspace/[workspaceId]/proposals/[proposalId]/builder/page.tsx:
    - Server Component для загрузки данных
    - Загрузка proposal через params.proposalId (включая loom_url)
    - Загрузка blocks через getProposalBlocks(proposalId)
    - Загрузка brand settings через getWorkspaceBrandSettings(workspaceId)
    - Проверка доступа (middleware уже проверяет workspace membership)
    - Проверка существования proposal (если не найден → notFound())
    - Передача данных в ProposalBuilderPage: { proposal, blocks, brand }
  - _Ref: builder2.0.md раздел 4_

- [x] 4.2 Создать основной компонент билдера


  - Создать src/components/proposals/ProposalBuilderPage.tsx:
    - Client Component ('use client')
    - Props: { proposal, initialBlocks, brand }
    - **Layout (3 колонки):**
      - Sidebar (left, 20%): список блоков + drag-n-drop + кнопки
      - Canvas (center, 50%): превью блоков с брендингом
      - Settings (right, 30%): настройки выбранного блока
    - **State management:**
      - `selectedBlockId: string | null` - ID выбранного блока
      - `blocks: ProposalBlock[]` - список блоков (optimistic updates)
      - `brand: WorkspaceBrandSettings` - настройки брендинга
      - `isSaving: boolean` - индикатор сохранения
    - Header с кнопками: "Опубликовать", "Скачать PDF" (позже), индикатор сохранения
    - Responsive design: на мобильных вертикальный layout (Sidebar → Canvas → Settings)
  - **Важно:** Использовать CSS Grid для layout: `grid-template-columns: 20% 50% 30%`
  - _Ref: builder2.0.md раздел 4_

- [x] 4.3 Реализовать Sidebar с управлением блоками


  - Создать src/components/proposals/builder/BlocksSidebar.tsx:
    - Client Component
    - Props: { blocks, selectedBlockId, onSelectBlock, onDuplicateBlock, onDeleteBlock, onAddBlock }
    - Список блоков в порядке order_index
    - Для каждого блока:
      - Иконка (из blocks-registry по block.type)
      - Название типа блока (label из registry)
      - Краткое описание (первые 30 символов из props.title или props.content)
      - Кнопки: Duplicate (Copy icon), Delete (Trash icon)
    - Highlight выбранного блока (border-2 border-primary, bg-primary/10)
    - onClick на блок → onSelectBlock(block.id)
    - Кнопка "+ Добавить блок" внизу → onAddBlock()
    - Scroll если блоков много (overflow-y-auto, max-height)
  - **Важно:** Использовать shadcn/ui Button, Card компоненты
  - **Важно:** Иконки из lucide-react
  - _Ref: builder2.0.md раздел 5_


- [x] 4.4 Добавить Drag-n-Drop для reorder блоков


  - ✅ Установлены зависимости: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
  - ✅ BlocksSidebar обернут в DndContext
  - ✅ Используется SortableContext для списка блоков
  - ✅ Каждый блок использует useSortable hook с transform и transition
  - ✅ Визуальная индикация: opacity: 0.5 при перетаскивании
  - ✅ onDragEnd handler с optimistic update
  - ✅ Вызов reorderProposalBlocks Server Action
  - ✅ Rollback при ошибке с alert
  - ✅ Sensors для touch и mouse
  - **Протестировано:** Drag-n-drop работает, порядок сохраняется в БД
  - _Ref: builder2.0.md раздел 5, Ответ 4_

- [x] 4.5 Создать модальное окно добавления блоков


  - ✅ Создан AddBlockModal.tsx с shadcn/ui Dialog
  - ✅ Группировка блоков по 7 категориям (Вступление, Кейсы, Таймлайн, Оценка и оплата, FAQ, Контакты, Контент)
  - ✅ Отображение всех 15 типов блоков с иконками и описаниями
  - ✅ Grid layout 2-3 колонки для карточек
  - ✅ Использованы функции getCategoryLabel(), getBlocksByCategory(), getAllCategories()
  - ✅ Подключен Server Action createProposalBlock
  - ✅ После создания: блок добавляется в state, автоматически выбирается, модалка закрывается
  - ✅ Получение default props через getDefaultProps()
  - **Протестировано:** Добавление блока Payment Schedule работает, блок сохраняется в БД
  - _Ref: builder2.0.md раздел 5_

- [x] 4.6 Реализовать Canvas с превью блоков


  - Создать src/components/proposals/builder/BlocksCanvas.tsx:
    - Client Component
    - Props: { blocks, selectedBlockId, brand, onSelectBlock, loomUrl }
    - Отображение всех блоков в порядке order_index
    - Применение Brand Settings через CSS variables на wrapper div:
      - style={{ '--color-primary': brand.colors.primary, ... }}
    - Для каждого блока:
      - Обертка div с padding, border, rounded
      - Highlight выбранного блока (border-2 border-primary)
      - Hover эффект (border-gray-300)
      - onClick → onSelectBlock(block.id)
      - Рендер через BlockRenderer
    - Scroll если блоков много (overflow-y-auto)
  - **Важно:** Canvas только для просмотра и выбора, НЕ для drag-n-drop
  - **Важно:** Использовать те же CSS variables, что в BrandPreview и PublicProposalView
  - _Ref: builder2.0.md раздел 5_

- [x] 4.7 Создать BlockRenderer для рендера блоков


  - Создать src/components/proposals/builder/BlockRenderer.tsx:
    - Props: { block, brand, loomUrl? }
    - Switch по block.type:
      - case 'hero_simple': return <HeroBlock props={block.props} brand={brand} loomUrl={loomUrl} />
      - case 'cases_grid': return <CasesBlock props={block.props} brand={brand} />
      - case 'timeline': return <TimelineBlock props={block.props} brand={brand} />
      - case 'team_estimate': return <TeamEstimateBlock props={block.props} brand={brand} />
      - case 'payment': return <PaymentBlock props={block.props} brand={brand} />
      - case 'faq': return <FAQBlock props={block.props} brand={brand} />
      - case 'contacts': return <ContactsBlock props={block.props} brand={brand} />
      - case 'text': return <TextBlock props={block.props} brand={brand} />
      - case 'gallery': return <GalleryBlock props={block.props} brand={brand} />
      - default: return <div>Unknown block type: {block.type}</div>
    - Fallback для неизвестных типов блоков
  - **Важно:** Компоненты блоков пока можно сделать заглушками (просто div с текстом), реализуем в следующих задачах
  - _Ref: builder2.0.md раздел 5_

- [x] 4.8 Checkpoint - Тестирование базовой структуры


  - ✅ Создание блоков через AddBlockModal работает
  - ✅ Удаление блоков реализовано (с confirm диалогом)
  - ✅ Дублирование блоков работает (блок копируется и автоматически выбирается)
  - ✅ Drag-n-drop reorder работает, порядок сохраняется
  - ✅ Выбор блока работает (клик в Canvas, highlight в Sidebar и Canvas)
  - ✅ Применение брендинга работает (CSS variables в Canvas)
  - ✅ Optimistic updates работают
  - ✅ Обработка ошибок с rollback и alert

---

## 5. Реализация блоков - Hero, Cases, Timeline (ЗАВЕРШЕНО)



- [x] 5.1 Реализовать Hero Block с Loom интеграцией


  - Создать src/components/proposals/builder/blocks/HeroBlock.tsx:
    - Props: { props: HeroBlockProps, brand, loomUrl? }
    - Отображение:
      - title: H1 с font-heading из brand, color primary
      - subtitle: P с font-body, color text
      - clientName: мелкий текст (text-sm), color text/70
      - ctaLabel: Button с primary background
    - Если есть loomUrl:
      - Показать иконку Loom (Video icon из lucide-react)
      - Кнопка "Смотреть видео-презентацию"
      - onClick → window.open(loomUrl, '_blank')
      - **Важно:** Без iframe, без модалки, только кнопка
    - Применение brand через CSS variables
    - Layout: flex flex-col items-center text-center, padding, gap
  - Создать src/components/proposals/builder/settings/HeroBlockSettings.tsx:
    - Client Component
    - Props: { block, onUpdate, proposal }
    - React Hook Form + zodResolver(heroBlockPropsSchema)
    - Поля:
      - title: Input (required)
      - subtitle: Textarea (optional)
      - clientName: Input (optional)
      - ctaLabel: Input (optional, default: "Начать")
    - Отдельная секция для Loom:
      - loom_url: Input type="url" (optional)
      - Валидация: должен быть валидный URL или пустой
      - **Важно:** loom_url сохраняется на уровне proposal, не в props блока
    - Debounced update (1000ms) через useDebounce или useDebouncedCallback
    - onSubmit:
      - Вызвать onUpdate(block.id, newProps) для props блока
      - Если loom_url изменился: вызвать updateProposal для loom_url (нужен отдельный action)
    - Индикатор сохранения (Saving... / Saved)
  - **Важно:** Использовать shadcn/ui Input, Textarea, Label, Button
  - _Ref: builder2.0.md раздел 2.2, 2.3, Ответ 6_


- [x] 5.2 Реализовать Cases Block


  - Создать src/components/proposals/builder/blocks/CasesBlock.tsx:
    - 3 layout варианта: grid (CSS Grid 2-3 cols), slider (horizontal scroll + snap), row (vertical list)
    - Загрузка кейсов по caseIds (нужен Server Action getCasesByIds или загрузка в page)
    - Отображение для каждого кейса: title (H3), description (truncated), technologies (tags если showTags), images (первое как превью), links (если showLinks)
    - Применение brand: cardRadius, shadow, primary color для tags
  - Создать src/components/proposals/builder/settings/CasesBlockSettings.tsx:
    - Radio group для layout (grid/slider/row)
    - Multi-select для выбора кейсов: загрузка всех кейсов воркспейса, поиск по названию, превью выбранных
    - Checkboxes: showTags (default: true), showLinks (default: true)
    - Debounced update (1000ms)
  - **Важно:** Использовать shadcn/ui RadioGroup, Checkbox, Combobox
  - _Ref: builder2.0.md раздел 2.2, 2.3_

- [x] 5.3 Реализовать Timeline Block


  - Создать src/components/proposals/builder/blocks/TimelineBlock.tsx:
    - 3 варианта: linear (horizontal line + dots), vertical (vertical line left + content right), phases (numbered cards)
    - Отображение items: title (H4), date (formatted), description (P)
    - Визуализация: линии между точками (border или SVG), иконки/точки, primary color для активных
    - Responsive: на мобильных всегда vertical
  - Создать src/components/proposals/builder/settings/TimelineBlockSettings.tsx:
    - Radio group для variant (linear/vertical/phases)
    - CRUD для items: список с drag-n-drop reorder (@dnd-kit), кнопка "+ Добавить этап"
    - Для каждого item: Input title (required), Input date (type="date", optional), Textarea description (optional), кнопка удаления
    - Debounced update (1000ms)
  - _Ref: builder2.0.md раздел 2.2, 2.3_

---

## 6. Реализация блоков - Team, Payment, FAQ, Contacts



- [x] 6.1 Реализовать Team Estimate Block


  - Создать src/components/proposals/builder/blocks/TeamEstimateBlock.tsx:
    - Таблица (shadcn/ui Table): колонки Role, Qty, Rate, Total
    - Автоподсчёт total = qty * rate для каждой строки
    - Общий итог внизу (сумма всех total)
    - Отображение валюты: RUB→₽, USD→$, EUR→€, другое→показать код
    - Опция showTotal: если false, не показывать итоговую строку
  - Создать src/components/proposals/builder/settings/TeamEstimateBlockSettings.tsx:
    - Таблица для редактирования members: Input role, Input qty (number, min=0), Input rate (number, min=0), показать calculated total (read-only), кнопка удаления
    - Кнопка "+ Добавить специалиста"
    - Input для currency (text, default: "RUB")
    - Checkbox showTotal (default: true)
    - Автоматический расчёт total на клиенте при изменении qty/rate
    - Показать общий итог внизу формы
    - Debounced update (1000ms)
  - **Важно:** Валидация: qty и rate должны быть >= 0
  - _Ref: builder2.0.md раздел 2.2, 2.3, Ответ 3_

- [x] 6.2 Реализовать Payment Schedule Block


  - Создать src/components/proposals/builder/blocks/PaymentBlock.tsx:
    - Таблица: колонки Label, Date, Amount
    - Общая сумма внизу (сумма всех amount)
    - Отображение валюты (те же правила что Team Estimate)
    - Форматирование даты (если есть)
  - Создать src/components/proposals/builder/settings/PaymentBlockSettings.tsx:
    - Таблица для редактирования items: Input label, Input date (type="date", optional), Input amount (number, min=0), кнопка удаления
    - Кнопка "+ Добавить платёж"
    - Input для currency (text, default: "RUB")
    - Автоматический расчёт общей суммы
    - Показать общую сумму внизу формы
    - Debounced update (1000ms)
  - _Ref: builder2.0.md раздел 2.2, 2.3, Ответ 3_

- [x] 6.3 Реализовать FAQ Block


  - Создать src/components/proposals/builder/blocks/FAQBlock.tsx:
    - 2 layout: accordion (shadcn/ui Accordion), list (простой список)
    - Загрузка FAQ items по faqItemIds (из таблицы faq_items, миграция 008)
    - Отображение: question (H4 или AccordionTrigger), answer (P или AccordionContent), category (badge, optional)
  - Создать src/components/proposals/builder/settings/FAQBlockSettings.tsx:
    - Radio group для layout (accordion/list)
    - Multi-select для FAQ items: загрузка всех FAQ воркспейса, группировка по категориям, поиск по вопросу, превью выбранных
    - Debounced update (1000ms)
  - _Ref: builder2.0.md раздел 2.2, 2.3_

- [x] 6.4 Реализовать Footer Block


  - Создать src/components/proposals/builder/blocks/FooterBlock.tsx:
    - **3 layout варианта:**
      - `simple`: Контакты (email, phone) + копирайт в одну строку
      - `with_cta`: Контакты слева + CTA кнопка справа + копирайт внизу
      - `full`: Логотип + контакты + социальные сети + копирайт (multi-column)
    - **Элементы:**
      - Контакты: email (Mail icon, mailto:), phone (Phone icon, tel:)
      - Социальные сети: массив ссылок с иконками (LinkedIn, Twitter/X, Facebook, Instagram, GitHub, Website)
      - CTA: кнопка с текстом и ссылкой (primary color)
      - Копирайт: текст с годом (© 2024 Company Name)
    - Применение brand: primary color для ссылок, background для футера, typography
    - Responsive: на мобильных всегда вертикальный layout
  - Создать src/components/proposals/builder/settings/FooterBlockSettings.tsx:
    - Radio group для layout (simple/with_cta/full)
    - **Секция "Контакты":**
      - Input email (type="email", optional)
      - Input phone (type="tel", optional)
    - **Секция "CTA" (показывать только если layout === 'with_cta'):**
      - Input ctaText (required если layout with_cta)
      - Input ctaUrl (type="url", required если layout with_cta)
    - **Секция "Социальные сети" (показывать только если layout === 'full'):**
      - Checkboxes для каждой сети: LinkedIn, Twitter, Facebook, Instagram, GitHub, Website
      - Input URL для каждой выбранной сети
    - **Секция "Копирайт":**
      - Input copyrightText (default: "© 2024 Company Name")
    - Валидация через Zod: email валидный или пустой, phone валидный или пустой, URLs валидные
    - Debounced update (1000ms)
  - **Важно:** Использовать lucide-react иконки для социальных сетей
  - _Ref: builder2.0.md раздел 2.2, 2.3_

---

## 7. Реализация блоков - Text и Gallery



- [x] 7.1 Настроить Tiptap редактор


  - Проверить установку: @tiptap/react, @tiptap/starter-kit (уже должны быть)
  - Установить дополнительно: `npm install @tiptap/extension-text-align`
  - Разрешенные расширения: Bold, Italic, Underline, Strike, Link (target="_blank"), Heading (level 2 и 3 only), BulletList, OrderedList, Blockquote, Code (inline only), TextAlign (left/center/right)
  - НЕ включать: Table, Image, CodeBlock (блочный), Video/Embed, TaskList, Emoji picker
  - _Ref: builder2.0.md раздел 2.2, Ответ 1_

- [x] 7.2 Реализовать Text Block


  - Создать src/components/proposals/builder/blocks/TextBlock.tsx:
    - Рендер Tiptap content (EditorContent с editable={false})
    - Применение align prop (text-left/center/right)
    - Стилизация: font-body из brand, primary color для ссылок
  - Создать src/components/proposals/builder/settings/TextBlockSettings.tsx:
    - Tiptap Editor с тулбаром
    - Кнопки форматирования: Bold, Italic, Underline, Strike, H2, H3, BulletList, OrderedList, Blockquote, Code, Link (диалог для URL)
    - Кнопки выравнивания: left/center/right
    - Debounced save (1000ms)
  - **Важно:** Можно использовать существующий RichTextEditor или создать упрощенную версию
  - _Ref: builder2.0.md раздел 2.2, 2.3, Ответ 1_


- [x] 7.3 Реализовать Gallery Block


  - Создать src/components/proposals/builder/blocks/GalleryBlock.tsx:
    - Responsive grid: 1→full width, 2-3→1 row (grid-cols-2/3), 4-6→2 rows (grid-cols-3), 7-12→equal grid (grid-cols-3/4)
    - Для каждого изображения: Next.js Image для оптимизации, aspect ratio сохранен, cardRadius из brand
    - НЕ делать Masonry/Collage/Carousel в MVP
    - Lightbox при клике (опционально, можно в MVP+)
  - Создать src/components/proposals/builder/settings/GalleryBlockSettings.tsx:
    - Upload изображений: input type="file" multiple accept="image/*", max 12 файлов, max 50MB на файл
    - Upload в proposal-media bucket через Supabase Storage (createClient from @/lib/supabase/client)
    - Progress indicator при загрузке
    - Список загруженных: превью каждого, drag-n-drop reorder (@dnd-kit), кнопка удаления
    - Debounced update (1000ms) после reorder
    - Валидация: max 12 изображений, max 50MB на файл
  - _Ref: builder2.0.md раздел 2.2, 2.3, Ответ 2_

- [x] 7.4 Checkpoint - Тестирование всех блоков


  - Проверить создание и редактирование каждого типа блока (все 9)
  - Проверить валидацию props: currency, max images, email/phone/url, required fields
  - Проверить применение брендинга: colors, typography, cardRadius, shadow
  - Проверить загрузку связанных данных: cases по caseIds, FAQ по faqItemIds
  - Проверить upload изображений в Gallery
  - Проверить Loom кнопку в Hero (открывает в новой вкладке)
  - Проверить автоподсчёт в Team Estimate и Payment
  - Проверить Tiptap редактор в Text блоке (форматирование, ссылки, выравнивание)
  - Проверить drag-n-drop reorder в Timeline и Gallery

---

## 8. Публикация и публичная страница (ЗАВЕРШЕНО)



- [x] 8.1 Реализовать систему публикации


  - Создать src/app/actions/publish.ts:
    - `publishProposal(proposalId: string): Promise<Result<{ slug: string, snapshotId: string }>>`
      - Проверка доступа через proposal → workspace → workspace_members
      - Найти существующий public_link ИЛИ создать новый:
        - Генерация slug из proposal.title (slugify, lowercase, replace spaces with -)
        - Проверка уникальности slug (если занят, добавить -1, -2, etc.)
        - INSERT в public_links с is_active=true
      - Загрузить brand settings (getWorkspaceBrandSettings)
      - Загрузить все blocks (getProposalBlocks)
      - **Resolve данные для каждого блока:**
        - cases_grid: SELECT cases WHERE id IN (caseIds) - полные данные кейсов
        - faq: SELECT faq_items WHERE id IN (faqItemIds) - полные данные FAQ
        - team_estimate: посчитать итоговые суммы (total = qty * rate, grand total = sum of totals)
        - payment: посчитать общую сумму (sum of amounts)
      - Создать snapshot:
        - brand: полная копия brand settings (JSONB)
        - blocks: массив блоков с resolved данными (JSONB)
        - meta: { version: "1.0", publishedAt: NOW(), publishedBy: auth.uid() }
      - INSERT в proposal_snapshots
      - Вернуть { slug, snapshotId }
      - Полное логирование
  - **Важно:** Snapshot должен быть immutable - все данные resolved, не ссылки на ID
  - _Ref: builder2.0.md раздел 6_

- [x] 8.2 Добавить кнопку "Опубликовать" в билдер


  - Добавить кнопку в header ProposalBuilderPage
  - onClick → вызов publishProposal(proposalId)
  - Loading state во время публикации (disabled кнопка, spinner)
  - После успеха:
    - Показать Dialog (shadcn/ui) с публичной ссылкой
    - Отобразить полный URL: `${window.location.origin}/p/${slug}`
    - Кнопка "Копировать ссылку" (navigator.clipboard.writeText, Toast "Скопировано")
    - Кнопка "Открыть в новой вкладке" (window.open)
  - Обработка ошибок: Toast с сообщением об ошибке
  - _Ref: builder2.0.md раздел 6_

- [x] 8.3 Создать публичную страницу просмотра


  - Создать src/app/p/[slug]/page.tsx:
    - Server Component (БЕЗ требования авторизации)
    - Загрузка public_link по slug: SELECT * FROM public_links WHERE slug = ?
    - Проверка is_active: если false → notFound() (404)
    - Загрузка snapshot: SELECT * FROM proposal_snapshots WHERE public_link_id = ?
    - Если не найден → notFound()
    - Передача snapshot в PublicProposalView
    - SEO meta tags через Next.js Metadata API:
      - title: snapshot.brand.seo.title ИЛИ proposal.title
      - description: snapshot.brand.seo.description
      - openGraph: { title: snapshot.brand.seo.defaultOgTitle, images: [snapshot.brand.seo.ogImage], type: 'website' }
  - Создать src/components/proposals/PublicProposalView.tsx:
    - Server Component
    - Props: { snapshot }
    - Рендер блоков из snapshot.blocks через BlockRenderer
    - Применение brand settings из snapshot.brand:
      - CSS variables на wrapper div: --color-primary, --color-secondary, etc.
    - БЕЗ редакторских элементов (no sidebar, no settings, no edit buttons)
    - Чистый просмотр для клиента
  - **Важно:** Блоки рендерятся из resolved данных snapshot.blocks, НЕ из live БД
  - **Важно:** Использовать RLS policy "Anyone can view public snapshots"
  - _Ref: builder2.0.md раздел 6, Ответ 8_

---

## 9. Автосохранение и полировка (ЗАВЕРШЕНО)



- [x] 9.1 Реализовать автосохранение


  - Добавить useDebounce hook (1000ms) в ProposalBuilderPage
  - Применить к updateProposalBlock вызовам:
    - При изменении props блока в Settings → debounced вызов updateProposalBlock
  - Optimistic UI updates:
    - Обновить локальный state blocks сразу (setBlocks)
    - Вызвать Server Action в фоне
    - При ошибке: откатить state (revert), показать Toast с ошибкой
  - Индикатор статуса сохранения:
    - "Сохранение..." (пока идет запрос)
    - "Сохранено" (после успеха, показать 2 секунды)
    - "Ошибка сохранения" (при ошибке, показать постоянно)
  - Показывать индикатор в header билдера (рядом с кнопками)
  - **Важно:** НЕ блокировать UI во время сохранения
  - _Ref: builder2.0.md раздел 8_

- [x] 9.2 Добавить обработку конфликтов (базовая)


  - Toast уведомление если другой пользователь редактирует:
    - Текст: "Другой пользователь сейчас редактирует это предложение. Изменения могут быть перезаписаны."
    - Показывать при открытии билдера если есть другие активные пользователи
  - НЕ блокировать сохранение (Last Write Wins)
  - НЕ делать diff/merge в MVP
  - Можно использовать presence tracking:
    - SELECT * FROM presence WHERE proposal_id = ? AND user_id != auth.uid() AND last_seen > NOW() - INTERVAL '5 minutes'
    - Если есть записи → показать Toast
  - **Важно:** Полноценный real-time sync - это post-MVP
  - _Ref: builder2.0.md раздел 8, Ответ 9_

- [x] 9.3 Добавить loading states и error handling


  - Skeleton loaders для блоков в Canvas (при загрузке страницы) - shadcn/ui Skeleton
  - Spinner при сохранении блока (в Settings панели)
  - Progress bar при публикации (в Dialog)
  - Loading state для upload изображений в Gallery (progress bar)
  - Toast уведомления для всех ошибок:
    - Ошибки сохранения блоков
    - Ошибки загрузки данных (cases, FAQ)
    - Ошибки публикации
    - Ошибки upload файлов
  - Retry механизм для failed saves:
    - Кнопка "Повторить" в Toast ошибки
    - onClick → повторить последний failed запрос
  - Graceful degradation:
    - Если brand settings не загружены → использовать defaults из миграции 009
    - Если кейсы не загружены → показать placeholder "Кейс не найден"
  - **Важно:** Использовать shadcn/ui Skeleton, Toast/Sonner
  - _Ref: Общие best practices_

- [x] 9.4 Оптимизация производительности


  - Мемоизация BlockRenderer: React.memo(BlockRenderer)
  - Мемоизация отдельных компонентов блоков: React.memo для каждого (HeroBlock, CasesBlock, etc.)
  - Виртуализация для длинных списков блоков в Sidebar:
    - Если блоков > 20, использовать react-window или @tanstack/react-virtual
  - Lazy loading для тяжёлых компонентов:
    - Tiptap Editor: React.lazy(() => import('./TextBlockSettings'))
    - Gallery upload: React.lazy(() => import('./GalleryBlockSettings'))
  - Debounce для поиска в multi-select:
    - Cases selector: debounce 300ms
    - FAQ selector: debounce 300ms
  - useMemo для вычислений:
    - Итоги в Team Estimate: useMemo(() => calculateTotal(members), [members])
    - Итоги в Payment: useMemo(() => calculateTotal(items), [items])
  - useCallback для handlers:
    - onSelectBlock, onUpdateBlock, onDeleteBlock
  - **Важно:** Использовать React DevTools Profiler для проверки
  - _Ref: Общие best practices_

- [x] 9.5 Финальный Checkpoint


  - Полный flow: создание proposal → добавление блоков → редактирование → публикация
  - Проверить все 9 типов блоков (создание, редактирование, удаление, дублирование, reorder)
  - Проверить брендинг (colors, typography, components применяются везде)
  - Проверить автосохранение (debounce работает, optimistic updates, индикатор статуса)
  - Проверить публичную страницу (SEO meta tags, resolved data, no edit UI, брендинг применен)
  - Проверить drag-n-drop reorder (в Sidebar, Timeline items, Gallery images)
  - Проверить валидацию всех полей (hex colors, fonts, radius, currency, max images, email/phone/url)
  - Проверить RLS (доступ только членам воркспейса, попытка доступа к чужому proposal)
  - Проверить responsive design (мобильные устройства, планшеты)
  - Проверить loading states и error handling (skeleton, spinners, toasts, retry)
  - Проверить производительность (нет лагов при редактировании, быстрый рендер)

---

## 10. PDF экспорт (ЗАВЕРШЕНО)



- [x] 10.1 Установить и настроить Playwright


  - Установить: `npm install playwright`
  - Установить браузер: `npx playwright install chromium`
  - Настроить для Node runtime (НЕ Edge Functions):
    - В route.ts добавить: export const runtime = 'nodejs'
  - **Важно:** Playwright требует Node.js runtime, не работает в Edge
  - _Ref: builder2.0.md раздел 7, Ответ 5_

- [x] 10.2 Создать API route для генерации PDF


  - Создать src/app/api/pdf/proposal/[snapshotId]/route.ts:
    - export const runtime = 'nodejs'
    - GET handler
    - Загрузка snapshot по snapshotId
    - Проверка доступа:
      - Либо пользователь - член воркспейса (через proposal → workspace)
      - Либо snapshot имеет активный public_link (is_active=true)
    - Рендер HTML:
      - Использовать те же компоненты блоков (BlockRenderer)
      - Применить brand CSS variables
      - PDF-специфичные стили:
        - @page { size: A4 portrait; margin: 20mm; }
        - @media print { page-break-after: always для блоков }
        - CSS counter для нумерации страниц
    - Генерация PDF через Playwright:
      - const browser = await chromium.launch({ headless: true })
      - const page = await browser.newPage()
      - await page.setContent(html)
      - const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })
      - await browser.close()
    - Возврат PDF stream:
      - return new Response(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="proposal.pdf"' } })
    - Полное логирование
  - **Важно:** DPI 150-300 для качества
  - **Важно:** НЕ делать TOC (Table of Contents) в MVP
  - _Ref: builder2.0.md раздел 7, Ответ 5_

- [x] 10.3 Добавить кнопку "Скачать PDF" в билдер


  - Добавить кнопку в header ProposalBuilderPage (рядом с "Опубликовать")
  - onClick:
    - Если нет snapshot: сначала вызвать publishProposal, получить snapshotId
    - Затем открыть /api/pdf/proposal/[snapshotId] (download)
  - Loading state во время генерации (disabled кнопка, spinner)
  - Обработка ошибок: Toast с сообщением об ошибке
  - **Важно:** PDF генерируется из snapshot, не из live данных
  - _Ref: builder2.0.md раздел 7_

---

## 11. Тестирование (опционально)



- [ ] 11.1 Property-based тест: Round-trip для блоков


  - Создать src/app/actions/__tests__/proposal-blocks.property.test.ts
  - Для каждого типа блока (9 типов):
    - Генерация случайных валидных props через fast-check
    - Создание блока: createProposalBlock(proposalId, type, props)
    - Чтение блока: getProposalBlocks(proposalId)
    - Проверка: созданный блок имеет те же props
  - **Property:** ∀ blockType, props: createBlock(type, props) → getBlock() === props
  - Минимум 100 итераций
  - _Ref: builder2.0.md раздел 9_

- [ ] 11.2 Property-based тест: Reorder блоков


  - Генерация случайного порядка блоков (массив ID)
  - Вызов reorderProposalBlocks(proposalId, orderedIds)
  - Чтение блоков: getProposalBlocks(proposalId)
  - Проверка: order_index соответствует новому порядку (0, 1, 2, ...)
  - **Property:** ∀ orderedIds: reorder(orderedIds) → getBlocks().map(b => b.id) === orderedIds
  - Минимум 100 итераций
  - _Ref: builder2.0.md раздел 9_

- [ ] 11.3 Property-based тест: Snapshot с resolved данными


  - Создание proposal с блоками (cases, FAQ, team, payment)
  - Вызов publishProposal(proposalId)
  - Загрузка snapshot
  - Проверка snapshot содержит:
    - Resolved cases: полные данные кейсов, не только IDs
    - Resolved FAQ: полные данные FAQ items, не только IDs
    - Подсчитанные итоги: team estimate total, payment total
  - **Property:** ∀ proposal: publish(proposal) → snapshot.blocks содержит resolved data
  - Минимум 50 итераций
  - _Ref: builder2.0.md раздел 9_

- [ ] 11.4 Property-based тест: Доступ к публичным ссылкам


  - Создание public_link с is_active=true → доступ разрешен (200)
  - Создание public_link с is_active=false → 404
  - Несуществующий slug → 404
  - **Property:** ∀ link: link.is_active === true ⟺ getPublicProposal(link.slug) !== null
  - Минимум 50 итераций
  - _Ref: builder2.0.md раздел 9_

---

## 📊 Итоговая статистика

**Всего задач:** 11 (10 основных + 1 тестирование)
**Завершено:** 10 (миграции, типы/валидация/actions, UI брендинга, базовая структура билдера, Hero/Cases/Timeline блоки, Team/Payment/FAQ/Footer блоки, Text блок с Tiptap, Gallery блок, публикация и публичная страница, автосохранение и полировка, PDF экспорт)
**Осталось:** 1 (тестирование - опционально)

---

## ✅ Дополнительные улучшения (ЗАВЕРШЕНО)

- [x] Загрузка Google Fonts для брендинга
  - Добавлены все 6 шрифтов в root layout и публичную страницу
  - Шрифты применяются через inline styles в Canvas и PublicProposalView
  
- [x] Редактирование названия и клиента proposal
  - Inline редактирование в хедере билдера
  - Клик по названию/клиенту → режим редактирования
  - Сохранение через Enter или кнопку
  - Отмена через Escape или кнопку
  
- [x] Изменение статуса proposal
  - Dropdown в хедере билдера
  - 4 статуса: Черновик, Отправлено, Принято, Отклонено
  - Автоматическое сохранение при выборе
  
- [x] Страница создания нового proposal
  - Форма с полями: название (обязательное), имя клиента (опциональное)
  - Автоматический переход в билдер после создания
  
- [x] Исправление отображения статусов
  - Правильные русские названия в списке proposals
  - Соответствие статусов в билдере и списке
  
- [x] Реализация FAQ Server Actions
  - createFAQ, updateFAQ, deleteFAQ
  - Правильная обработка ошибок через Result type

