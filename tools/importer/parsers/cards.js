/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block.
 * Base: cards. Source: https://www.tcs.com/
 * Generated: 2026-03-11
 *
 * Cards model: container block with child "card" items
 * Card fields: image (reference), text (richtext)
 * imageAlt collapsed into image (suffix rule)
 *
 * Source selectors (4 sections use cards):
 * 1. .storyCardCarousel — story cards (.swiper-slide.story-card-swiper-slide)
 * 2. .solutionCard — customer story cards (.swiper-slide.solution-card-swiper-slide)
 * 3. .horizontalAccordion — event cards (.accordion-item)
 * 4. .featureCard — news/insight cards (.feature-card-swiper-slide)
 *
 * Target table structure (from block library):
 * Each row = 3 cells: ["card", image, text(title+description+CTA)]
 */
export default function parse(element, { document }) {
  // Find card items across all 4 source patterns
  const cardItems = element.querySelectorAll(
    '.swiper-slide.story-card-swiper-slide, '
    + '.swiper-slide.solution-card-swiper-slide, '
    + '.accordion-item, '
    + 'a.feature-card-swiper-slide'
  );

  const cells = [];

  cardItems.forEach((item) => {
    // --- Extract image ---
    const img = item.querySelector(
      'img.story-card-image, '
      + 'img.solution-card-img, '
      + 'img.dynamic-media-image, '
      + 'img.accordion-img, '
      + 'img.card-img-top, '
      + '.story-image-section img, '
      + '.card-image-container img'
    );

    const imageFrag = document.createDocumentFragment();
    imageFrag.appendChild(document.createComment(' field:image '));
    if (img) {
      imageFrag.appendChild(img);
    }

    // --- Extract text content ---
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));

    // Title extraction (multiple patterns)
    const title = item.querySelector(
      '.story-card-title, '
      + 'h3.solution-card-inner-heading-text, '
      + 'h3.accordion-title, '
      + 'h3.card-title'
    );
    if (title) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = title.textContent.trim();
      p.appendChild(strong);
      textFrag.appendChild(p);
    }

    // Description extraction (multiple patterns)
    const desc = item.querySelector(
      '.story-card-description, '
      + '.solution-card-inner-description, '
      + '.horizontal-accordion-title-content, '
      + '.card-text'
    );
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      textFrag.appendChild(p);
    }

    // CTA link extraction (multiple patterns)
    // For solution cards and feature cards, the whole card is an <a> tag
    let ctaLink = item.querySelector(
      'a.story-cta-link, '
      + 'a[class*="know-more"], '
      + '.description-content a'
    );

    if (!ctaLink && item.matches('a.solution-card-swiper-card, a.feature-card-swiper-slide')) {
      // The card itself is a link — create a CTA from it
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = 'Read more';
      ctaLink = a;
    } else if (!ctaLink) {
      // Try parent link for solution cards
      const parentLink = item.querySelector('a.solution-card-swiper-card');
      if (parentLink) {
        const a = document.createElement('a');
        a.href = parentLink.href;
        a.textContent = 'Read more';
        ctaLink = a;
      }
    }

    if (ctaLink) {
      // Clean up link text (remove visually-hidden spans)
      const hiddenSpans = ctaLink.querySelectorAll('.visually-hidden');
      hiddenSpans.forEach((s) => s.remove());
      const p = document.createElement('p');
      p.appendChild(ctaLink);
      textFrag.appendChild(p);
    }

    cells.push(['card', imageFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });

  // Preserve any section heading before replacing
  const heading = element.querySelector('h2, .section-tile');
  if (heading) {
    element.before(heading);
  }

  element.replaceWith(block);
}
