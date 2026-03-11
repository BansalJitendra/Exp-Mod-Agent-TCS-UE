/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero block.
 * Base: hero. Source: https://www.tcs.com/
 * Generated: 2026-03-11
 *
 * Hero model fields: image (reference), imageAlt (collapsed), text (richtext)
 * Source: .heroBanner — video hero banner with Scene7 poster image and CTA
 *
 * Target table structure (from block library):
 * Row 1: Background image (poster from video)
 * Row 2: Text content (tagline + CTA)
 */
export default function parse(element, { document }) {
  // Try to get the poster image from Scene7 video player data attributes
  const scene7El = element.querySelector('[data-asset-path]');
  let posterSrc = null;
  let posterAlt = 'TCS Hero Banner';

  if (scene7El) {
    const assetPath = scene7El.getAttribute('data-asset-path');
    const imageServer = scene7El.getAttribute('data-imageserver') || 'https://s7ap1.scene7.com/is/image/';
    if (assetPath) {
      posterSrc = `${imageServer}${assetPath}?fit=constrain,1&wid=1920&hei=1080`;
    }
  }

  // Fallback: try to find any image in the hero
  if (!posterSrc) {
    const heroImage = element.querySelector(
      '.hero-banner-box img, .hero-video-container img, .hero-banner-container img'
    );
    if (heroImage) {
      posterSrc = heroImage.src;
      posterAlt = heroImage.alt || posterAlt;
    }
  }

  // Extract CTA link
  const ctaLink = element.querySelector(
    'a.new-hero-banner, a.tcs-primary-btn, .hero-banner-content-div a'
  );

  // Build image cell (Row 1)
  const imageFrag = document.createDocumentFragment();
  imageFrag.appendChild(document.createComment(' field:image '));
  if (posterSrc) {
    const img = document.createElement('img');
    img.src = posterSrc;
    img.alt = posterAlt;
    const p = document.createElement('p');
    p.appendChild(img);
    imageFrag.appendChild(p);
  }

  // Build text cell (Row 2) — use concise tagline, not the full video transcript
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));

  // Extract a short tagline from the visually-hidden text
  const visibleText = element.querySelector('.hero-banner-content-div span.visually-hidden');
  if (visibleText) {
    const fullText = visibleText.textContent.trim();
    // Extract the key message: "The Perpetually Adaptive Enterprise"
    const match = fullText.match(/The Perpetually Adaptive Enterprise/i);
    if (match) {
      const tagline = document.createElement('p');
      tagline.textContent = 'The Perpetually Adaptive Enterprise';
      textFrag.appendChild(tagline);
    }
  }

  // Add CTA link
  if (ctaLink) {
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
