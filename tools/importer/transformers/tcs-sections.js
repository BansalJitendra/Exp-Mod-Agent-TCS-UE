/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for TCS website
 * Purpose: Add section breaks (<hr>) and section-metadata blocks
 * Applies to: www.tcs.com (all templates with 2+ sections)
 *
 * Runs in beforeTransform hook — BEFORE block parsers process content.
 * This is critical because parsers replace section elements with block tables,
 * removing the original selectors. By inserting <hr> and section-metadata
 * as siblings before parsing, they survive the parser replacements.
 *
 * Uses payload.template.sections from page-templates.json to determine
 * section boundaries and styles.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.beforeTransform) return;

  const { document } = payload;
  const template = payload.template;

  if (!template || !template.sections || template.sections.length < 2) return;

  const sections = template.sections;

  // Process sections in reverse order to avoid index shifting issues
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
    const selectors = Array.isArray(section.selector)
      ? section.selector
      : [section.selector];

    // Find the first matching element for this section
    let sectionEl = null;
    for (const sel of selectors) {
      sectionEl = element.querySelector(sel);
      if (sectionEl) break;
    }

    if (!sectionEl) {
      console.warn(`Section "${section.name}" selector not found: ${selectors.join(', ')}`);
      continue;
    }

    // Add section-metadata block AFTER the section element if it has a style
    // This becomes a sibling, so it survives when parsers replace the section element
    if (section.style) {
      const sectionMetadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: {
          style: section.style,
        },
      });
      sectionEl.after(sectionMetadata);
    }

    // Add <hr> before section (except for the first section)
    // The <hr> is a sibling, so it survives parser replacements
    if (i > 0) {
      const hr = document.createElement('hr');
      sectionEl.before(hr);
    }
  }
}
