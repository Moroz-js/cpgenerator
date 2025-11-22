# Proposal Builder Implementation Tasks

This document contains tasks for implementing the proposal builder functionality - the core editor for creating and editing commercial proposals.

## Prerequisites

Before starting these tasks, ensure the following are completed:
- Task 7: Proposal list and management (CRUD operations)
- Task 6: Rich-text editor component
- Task 5: Case library management

---

## 8. Реализация билдера коммерческих предложений

- [ ] 8.1 Создать базовую структуру билдера КП
  - Реализовать ProposalEditor с разделами
  - Создать форму для основной информации (название, клиент)
  - Добавить статусы КП (draft, sent, accepted, rejected)
  - _Requirements: 4.1_

- [ ] 8.2 Реализовать редактор таймлайна
  - Создать TimelineEditor компонент
  - Добавить возможность указать даты начала и окончания
  - Реализовать добавление вех (milestones)
  - _Requirements: 4.2_

- [ ] 8.3 Реализовать редактор оценки команды
  - Создать TeamEstimateEditor компонент
  - Добавить поля для роли, часов, ставки
  - Реализовать автоматический расчет стоимости
  - _Requirements: 4.3_

- [ ] 8.4 Реализовать выбор кейсов
  - Создать CaseSelector компонент
  - Добавить возможность выбора из списка кейсов воркспейса
  - Реализовать превью выбранных кейсов
  - _Requirements: 4.4_

- [ ] 8.5 Реализовать редактор контактов
  - Создать форму для email, телефона, адреса
  - Добавить валидацию контактных данных
  - _Requirements: 4.5_

- [ ] 8.6 Реализовать редактор процессов
  - Интегрировать RichTextEditor для описания процессов
  - _Requirements: 4.6_

- [ ] 8.7 Реализовать редактор технологического стека
  - Создать компонент для добавления технологий
  - Добавить возможность поиска и выбора из списка
  - _Requirements: 4.7_

- [ ] 8.8 Реализовать редактор FAQ
  - Создать компонент для добавления вопросов и ответов
  - Реализовать возможность переупорядочивания
  - _Requirements: 4.8_

- [ ] 8.9 Реализовать редактор платежного календаря
  - Создать PaymentScheduleEditor компонент
  - Добавить поля для даты, суммы, описания
  - Реализовать расчет общей суммы
  - _Requirements: 4.9_

- [ ] 8.10 Написать property тест для сохранения данных КП
  - **Property 13: Сохранение данных КП (Round-trip)**
  - **Validates: Requirements 4.1-4.9**

## 9. Реализация автосохранения

- [ ] 9.1 Создать механизм автосохранения
  - Реализовать autoSaveProposal Server Action
  - Добавить debounce для автосохранения каждые 30 секунд
  - Создать индикатор статуса сохранения
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 9.2 Написать property тест для автосохранения
  - **Property 34: Автосохранение сохраняет данные (Round-trip)**
  - **Validates: Requirements 11.2, 11.3**

## 10. Реализация видео-ссылок

- [ ] 10.1 Добавить поле для видео-ссылки в форму КП
  - Добавить поле video_url в схему proposals
  - Реализовать валидацию URL (поддержка Loom, YouTube, Vimeo и других)
  - Добавить простое текстовое поле в форму создания/редактирования КП
  - _Requirements: 5.1, 5.2_

- [ ] 10.2 Добавить кнопку видео-ссылки на публичную страницу
  - Добавить кнопку "Посмотреть видео-презентацию" на публичную страницу просмотра КП
  - Настроить открытие ссылки в новой вкладке
  - Показывать кнопку только если video_url заполнен
  - _Requirements: 5.3_

- [ ] 10.3 Написать property тест для видео-ссылок
  - **Property 37: Корректность сохранения видео-ссылок**
  - **Validates: Requirements 5.1, 5.2, 5.3**

## 11. Реализация публичных ссылок

- [ ] 11.1 Создать генератор публичных ссылок
  - Реализовать PublicLinkGenerator компонент
  - Добавить генерацию уникального slug
  - Создать Server Action generatePublicLink
  - _Requirements: 6.1_

- [ ] 11.2 Создать публичную страницу просмотра КП
  - Реализовать PublicProposalView без требования авторизации
  - Создать маршрут /p/[slug]
  - Добавить красивое оформление для клиентов
  - _Requirements: 6.2_

- [ ] 11.3 Реализовать деактивацию ссылок
  - Добавить Server Action deactivatePublicLink
  - Создать UI для управления активностью ссылки
  - _Requirements: 6.4_

- [ ] 11.4 Написать property тест для уникальности ссылок
  - **Property 16: Уникальность публичных ссылок**
  - **Validates: Requirements 6.1**

- [ ] 11.5 Написать property тест для синхронизации изменений
  - **Property 17: Синхронизация изменений с публичной ссылкой**
  - **Validates: Requirements 6.3**

- [ ] 11.6 Написать property тест для деактивации ссылок
  - **Property 18: Деактивация публичной ссылки запрещает доступ**
  - **Validates: Requirements 6.4**

## 15. Реализация генерации PDF

- [ ] 15.1 Создать PDF шаблон
  - Реализовать PDFTemplate Server Component
  - Создать HTML разметку для всех разделов КП
  - Добавить стили для печати
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 15.2 Настроить Puppeteer для генерации PDF
  - Установить Puppeteer
  - Создать API Route /api/pdf/generate
  - Реализовать рендеринг HTML в PDF
  - _Requirements: 7.1_

- [ ] 15.3 Добавить обработку изображений в PDF
  - Встроить изображения в PDF
  - Оптимизировать размер PDF
  - _Requirements: 7.3_

- [ ] 15.4 Создать UI для скачивания PDF
  - Реализовать PDFDownloadButton
  - Добавить индикатор генерации
  - _Requirements: 7.5_

- [ ] 15.5 Написать property тест для содержимого PDF
  - **Property 19: Генерация PDF содержит все данные**
  - **Validates: Requirements 7.1**

- [ ] 15.6 Написать property тест для изображений в PDF
  - **Property 20: Изображения встроены в PDF**
  - **Validates: Requirements 7.3**

- [ ] 15.7 Написать property тест для доступности PDF
  - **Property 21: PDF доступен для скачивания**
  - **Validates: Requirements 7.5**

- [ ] 15.8 Написать property тест для форматирования в PDF
  - **Property 36: Форматирование в PDF (Round-trip)**
  - **Validates: Requirements 12.4**

## Notes

- All tasks should follow the logging requirements specified in the main tasks.md
- Property-based tests should run with minimum 100 iterations
- Each property test must be tagged with the feature name and property number
- UI components should use shadcn/ui components for consistency
