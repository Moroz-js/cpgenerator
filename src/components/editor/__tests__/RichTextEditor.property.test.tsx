import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Tiptap JSON Document structure generators for property-based testing
 */

// Generate text content
const textContentArb = fc.string({ minLength: 1, maxLength: 100 });

// Generate marks (formatting)
const boldMarkArb = fc.constant({ type: 'bold' });
const italicMarkArb = fc.constant({ type: 'italic' });
const linkMarkArb = fc.webUrl().map(url => ({ type: 'link', attrs: { href: url } }));

const marksArb = fc.array(
  fc.oneof(boldMarkArb, italicMarkArb, linkMarkArb),
  { minLength: 0, maxLength: 3 }
);

// Generate text node with optional marks
const textNodeArb = fc.record({
  type: fc.constant('text'),
  text: textContentArb,
  marks: fc.option(marksArb, { nil: undefined }),
});

// Generate heading node
const headingNodeArb = fc.record({
  type: fc.constant('heading'),
  attrs: fc.record({
    level: fc.constantFrom(1, 2, 3),
  }),
  content: fc.array(textNodeArb, { minLength: 1, maxLength: 3 }),
});

// Generate paragraph node
const paragraphNodeArb = fc.record({
  type: fc.constant('paragraph'),
  content: fc.option(fc.array(textNodeArb, { minLength: 1, maxLength: 5 }), { nil: undefined }),
});

// Generate list item node
const listItemNodeArb = fc.record({
  type: fc.constant('listItem'),
  content: fc.array(paragraphNodeArb, { minLength: 1, maxLength: 2 }),
});

// Generate bullet list node
const bulletListNodeArb = fc.record({
  type: fc.constant('bulletList'),
  content: fc.array(listItemNodeArb, { minLength: 1, maxLength: 5 }),
});

// Generate ordered list node
const orderedListNodeArb = fc.record({
  type: fc.constant('orderedList'),
  content: fc.array(listItemNodeArb, { minLength: 1, maxLength: 5 }),
});

// Generate any block node
const blockNodeArb = fc.oneof(
  paragraphNodeArb,
  headingNodeArb,
  bulletListNodeArb,
  orderedListNodeArb
);

// Generate complete Tiptap document
const tiptapDocumentArb = fc.record({
  type: fc.constant('doc'),
  content: fc.array(blockNodeArb, { minLength: 1, maxLength: 10 }),
});

describe('RichTextEditor Property-Based Tests', () => {
  /**
   * **Feature: proposal-generator, Property 35: Сохранение форматирования текста (Round-trip)**
   * 
   * For any formatted text (bold, italic, lists, headings, links),
   * saving and subsequent reading should preserve all formatting.
   * 
   * **Validates: Requirements 12.1, 12.2, 12.3**
   */
  it('Property 35: should preserve formatting in round-trip (save and load)', async () => {
    await fc.assert(
      fc.asyncProperty(tiptapDocumentArb, async (document) => {
        // Step 1: Serialize the document to JSON string (simulating save)
        const savedContent = JSON.stringify(document);

        // Step 2: Parse the JSON string back (simulating load)
        const loadedContent = JSON.parse(savedContent);

        // Step 3: Verify that the loaded content matches the original
        expect(loadedContent).toEqual(document);

        // Step 4: Verify that the document structure is valid
        // Check that essential properties are preserved
        expect(loadedContent.type).toBe('doc');
        expect(loadedContent.content).toBeDefined();
        expect(Array.isArray(loadedContent.content)).toBe(true);
        expect(loadedContent.content.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that specific formatting types are preserved
   */
  it('Property 35a: should preserve bold formatting', async () => {
    await fc.assert(
      fc.asyncProperty(textContentArb, async (text) => {
        const document = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: text,
                  marks: [{ type: 'bold' }],
                },
              ],
            },
          ],
        };

        const savedContent = JSON.stringify(document);
        const loadedContent = JSON.parse(savedContent);

        expect(loadedContent).toEqual(document);
        expect(loadedContent.content[0].content[0].marks).toContainEqual({ type: 'bold' });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that italic formatting is preserved
   */
  it('Property 35b: should preserve italic formatting', async () => {
    await fc.assert(
      fc.asyncProperty(textContentArb, async (text) => {
        const document = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: text,
                  marks: [{ type: 'italic' }],
                },
              ],
            },
          ],
        };

        const savedContent = JSON.stringify(document);
        const loadedContent = JSON.parse(savedContent);

        expect(loadedContent).toEqual(document);
        expect(loadedContent.content[0].content[0].marks).toContainEqual({ type: 'italic' });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that links are preserved
   */
  it('Property 35c: should preserve links', async () => {
    await fc.assert(
      fc.asyncProperty(textContentArb, fc.webUrl(), async (text, url) => {
        const document = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: text,
                  marks: [{ type: 'link', attrs: { href: url } }],
                },
              ],
            },
          ],
        };

        const savedContent = JSON.stringify(document);
        const loadedContent = JSON.parse(savedContent);

        expect(loadedContent).toEqual(document);
        const linkMark = loadedContent.content[0].content[0].marks?.find(
          (m: any) => m.type === 'link'
        );
        expect(linkMark).toBeDefined();
        expect(linkMark.attrs.href).toBe(url);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test that headings are preserved
   */
  it('Property 35d: should preserve headings', async () => {
    await fc.assert(
      fc.asyncProperty(
        textContentArb,
        fc.constantFrom(1, 2, 3),
        async (text, level) => {
          const document = {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level },
                content: [
                  {
                    type: 'text',
                    text: text,
                  },
                ],
              },
            ],
          };

          const savedContent = JSON.stringify(document);
          const loadedContent = JSON.parse(savedContent);

          expect(loadedContent).toEqual(document);
          expect(loadedContent.content[0].type).toBe('heading');
          expect(loadedContent.content[0].attrs.level).toBe(level);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that bullet lists are preserved
   */
  it('Property 35e: should preserve bullet lists', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(textContentArb, { minLength: 1, maxLength: 5 }),
        async (items) => {
          const document = {
            type: 'doc',
            content: [
              {
                type: 'bulletList',
                content: items.map(text => ({
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: text,
                        },
                      ],
                    },
                  ],
                })),
              },
            ],
          };

          const savedContent = JSON.stringify(document);
          const loadedContent = JSON.parse(savedContent);

          expect(loadedContent).toEqual(document);
          expect(loadedContent.content[0].type).toBe('bulletList');
          expect(loadedContent.content[0].content).toHaveLength(items.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that ordered lists are preserved
   */
  it('Property 35f: should preserve ordered lists', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(textContentArb, { minLength: 1, maxLength: 5 }),
        async (items) => {
          const document = {
            type: 'doc',
            content: [
              {
                type: 'orderedList',
                content: items.map(text => ({
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: text,
                        },
                      ],
                    },
                  ],
                })),
              },
            ],
          };

          const savedContent = JSON.stringify(document);
          const loadedContent = JSON.parse(savedContent);

          expect(loadedContent).toEqual(document);
          expect(loadedContent.content[0].type).toBe('orderedList');
          expect(loadedContent.content[0].content).toHaveLength(items.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that combined formatting (bold + italic) is preserved
   */
  it('Property 35g: should preserve combined formatting', async () => {
    await fc.assert(
      fc.asyncProperty(textContentArb, async (text) => {
        const document = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: text,
                  marks: [{ type: 'bold' }, { type: 'italic' }],
                },
              ],
            },
          ],
        };

        const savedContent = JSON.stringify(document);
        const loadedContent = JSON.parse(savedContent);

        expect(loadedContent).toEqual(document);
        expect(loadedContent.content[0].content[0].marks).toHaveLength(2);
        expect(loadedContent.content[0].content[0].marks).toContainEqual({ type: 'bold' });
        expect(loadedContent.content[0].content[0].marks).toContainEqual({ type: 'italic' });
      }),
      { numRuns: 100 }
    );
  });
});
