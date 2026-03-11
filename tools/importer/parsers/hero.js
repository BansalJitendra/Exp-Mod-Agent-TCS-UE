/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero block.
 * Base: hero. Source: https://www.tcs.com/
 * Generated: 2026-03-11
 *
 * Hero model fields: image (reference), imageAlt (collapsed), text (richtext)
 * Source: .heroBanner — video hero banner with visually-hidden text and CTA
 *
 * Target table structure (from block library):
 * Row 1: Background image (optional)
 * Row 2: Text content (heading, description, CTA)
 */
export default function parse(element, { document }) {
  // Extract any usable image from the hero
  // After cleanup transformer removes [id^="dynamicmedia_"], try to find a remaining image
  const heroImage = element.querySelector(
    '.hero-banner-box img, .hero-video-container img, .hero-banner-container img'
  );

  // Extract text content
  const visibleText = element.querySelector('.hero-banner-content-div span.visually-hidden');
  const ctaLink = element.querySelector(
    'a.new-hero-banner, a.tcs-primary-btn, .hero-banner-content-div a'
  );

  // Build image cell (Row 1) - xwalk field hint required
  const imageFrag = document.createDocumentFragment();
  imageFrag.appendChild(document.createComment(' field:image '));
  if (heroImage) {
    imageFrag.appendChild(heroImage);
  }

  // Build text cell (Row 2) - xwalk field hint required
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));

  // Add description text from visually-hidden span as a paragraph
  if (visibleText && visibleText.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = visibleText.textContent.trim();
    textFrag.appendChild(p);
  }

  // Add CTA link
  if (ctaLink) {
    // Clean up the link text (remove visually-hidden spans)
    const hiddenSpans = ctaLink.querySelectorAll('.visually-hidden');
    hiddenSpans.forEach((s) => s.remove());
    const p = document.createElement('p');
    p.appendChild(ctaLink);
    textFrag.appendChild(p);
  }

  const cells = [
    [imageFrag],
    [textFrag],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });

  // Preserve any section heading before replacing
  const heading = element.querySelector('h2');
  if (heading) {
    element.before(heading);
  }

  element.replaceWith(block);
}
