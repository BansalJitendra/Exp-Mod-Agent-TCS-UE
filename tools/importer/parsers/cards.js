/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block (base + carousel variant).
 * Source: https://www.tcs.com/
 *
 * Cards model: container block with child "card" items
 * Card fields: image (reference), text (richtext)
 *
 * Source selectors (4 sections use cards):
 * 1. .storyCardCarousel — carousel variant
 * 2. .solutionCard — carousel variant
 * 3. .horizontalAccordion — carousel variant
 * 4. .featureCard — base grid (4 items)
 *
 * Block name is passed via options.blockName (default: 'cards').
 * Carousel instances use 'cards (carousel)'.
 */
export default function parse(element, { document }, options = {}) {
  const blockName = options.blockName || 'cards';

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
    // Try specific class selectors first, then fall back to any <img>
    let img = item.querySelector(
      'img.story-card-image, '
      + 'img.solution-card-img, '
      + 'img.dynamic-media-image, '
      + 'img.accordion-img, '
      + 'img.card-img-top, '
      + '.story-image-section img, '
      + '.card-image-container img'
    );
    if (!img) {
      img = item.querySelector('img');
    }

    // Fall back to Dynamic Media (Scene7) placeholder divs
    // These use data attributes instead of <img> elements
    let imgSrc = '';
    let imgAlt = '';
    if (img) {
      imgSrc = img.src;
      imgAlt = img.alt || '';
    } else {
      const dm = item.querySelector('.s7dm-dynamic-media[data-asset-type="image"]');
      if (dm) {
        const server = dm.getAttribute('data-imageserver') || '';
        const assetPath = dm.getAttribute('data-asset-path') || '';
        if (server && assetPath) {
          imgSrc = server + assetPath;
        }
        imgAlt = dm.getAttribute('data-alt') || '';
      }
    }

    const imageCell = document.createDocumentFragment();
    if (imgSrc) {
      const p = document.createElement('p');
      const newImg = document.createElement('img');
      newImg.src = imgSrc;
      newImg.alt = imgAlt;
      p.appendChild(newImg);
      imageCell.appendChild(p);
    }

    // --- Extract text content ---
    const textCell = document.createDocumentFragment();

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
      textCell.appendChild(p);
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
      textCell.appendChild(p);
    }

    // CTA link extraction
    let ctaLink = item.querySelector(
      'a.story-cta-link, '
      + 'a[class*="know-more"], '
      + '.description-content a'
    );

    if (!ctaLink && item.matches('a.solution-card-swiper-card, a.feature-card-swiper-slide')) {
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = 'Read more';
      ctaLink = a;
    } else if (!ctaLink) {
      const parentLink = item.querySelector('a.solution-card-swiper-card');
      if (parentLink) {
        const a = document.createElement('a');
        a.href = parentLink.href;
        a.textContent = 'Read more';
        ctaLink = a;
      }
    }

    if (ctaLink) {
      const hiddenSpans = ctaLink.querySelectorAll('.visually-hidden');
      hiddenSpans.forEach((s) => s.remove());
      const p = document.createElement('p');
      p.appendChild(ctaLink);
      textCell.appendChild(p);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: blockName,
    cells,
  });

  // Preserve any section heading before replacing
  const heading = element.querySelector('h2, .section-tile');
  if (heading) {
    element.before(heading);
  }

  element.replaceWith(block);
}
