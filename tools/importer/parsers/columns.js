/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block.
 * Base: columns. Source: https://www.tcs.com/
 * Generated: 2026-03-11
 *
 * Columns model: special block — NO field hints required (per hinting.md Rule 4)
 * Only default content allowed in cells.
 *
 * Source selectors (2 sections use columns):
 * 1. .interactiveHubPannel — 3 category cards (Industries, Services, Products)
 *    Each has image, title, description, and link
 * 2. .textWithAsset — Two-column layout (text left, image right)
 *    Left: heading, subheading, description, CTA
 *    Right: image
 *
 * Target table structure (from block library):
 * Each row has N columns/cells with default content (text, images, links)
 */
export default function parse(element, { document }) {
  const cells = [];

  // Detect which pattern we're dealing with
  const interactiveCards = element.querySelectorAll('.interactive-card');
  const textAssetRow = element.querySelector('.text-asset-row, .intro-section');

  if (interactiveCards.length > 0) {
    // Pattern 1: Interactive Hub Panel — 3 category cards as columns
    // Each card becomes a column in a single row
    const row = [];

    interactiveCards.forEach((card) => {
      const col = document.createDocumentFragment();

      // Extract image
      const img = card.querySelector('img.interactive-card-img');
      if (img) {
        col.appendChild(img);
      }

      // Extract title
      const title = card.querySelector('h3.card-img-title, .card-img-title');
      if (title) {
        // Clean hidden spans
        const hidden = title.querySelectorAll('.visually-hidden');
        hidden.forEach((s) => s.remove());
        const h3 = document.createElement('h3');
        h3.textContent = title.textContent.trim();
        col.appendChild(h3);
      }

      // Extract description
      const desc = card.querySelector('.interactive-card-desc');
      if (desc) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        col.appendChild(p);
      }

      // Extract link
      const link = card.querySelector('a.interactive-card-anchor');
      if (link) {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = 'Explore';
        const p = document.createElement('p');
        p.appendChild(a);
        col.appendChild(p);
      }

      row.push(col);
    });

    cells.push(row);
  } else if (textAssetRow) {
    // Pattern 2: Text with Asset — 2 columns (text + image)
    const row = [];

    // Column 1: Text content
    const textCol = document.createDocumentFragment();
    const introContent = element.querySelector('.intro-content, .asset-text-col');

    if (introContent) {
      // Extract heading
      const heading = introContent.querySelector('h2.intro-heading, h2');
      if (heading) {
        const h2 = document.createElement('h2');
        h2.textContent = heading.textContent.trim();
        textCol.appendChild(h2);
      }

      // Extract subheading
      const subheading = introContent.querySelector('h3.intro-description, h3');
      if (subheading) {
        const h3 = document.createElement('h3');
        h3.textContent = subheading.textContent.trim().split('\n')[0].trim();
        textCol.appendChild(h3);
      }

      // Extract description text
      const descDiv = introContent.querySelector('.intro-text');
      if (descDiv) {
        const paragraphs = descDiv.querySelectorAll('p');
        paragraphs.forEach((p) => {
          if (p.textContent.trim()) {
            const newP = document.createElement('p');
            newP.textContent = p.textContent.trim();
            textCol.appendChild(newP);
          }
        });
      }

      // Extract CTA link
      const cta = introContent.querySelector('.content-link a, a.cta-link-focus');
      if (cta) {
        // Clean hidden spans
        const hidden = cta.querySelectorAll('.visually-hidden');
        hidden.forEach((s) => s.remove());
        const a = document.createElement('a');
        a.href = cta.href;
        a.textContent = cta.textContent.trim();
        const p = document.createElement('p');
        p.appendChild(a);
        textCol.appendChild(p);
      }
    }

    row.push(textCol);

    // Column 2: Image
    const imgCol = document.createDocumentFragment();
    const image = element.querySelector(
      'img.fluidimage, img.dynamic-media-image, .text-with-assets-image-div img, .intro-player-box img'
    );
    if (image) {
      imgCol.appendChild(image);
    }

    row.push(imgCol);
    cells.push(row);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });

  // Preserve any section heading before replacing
  const heading = element.querySelector(':scope > h2, :scope > .section-tile');
  if (heading) {
    element.before(heading);
  }

  element.replaceWith(block);
}
