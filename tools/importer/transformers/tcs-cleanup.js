/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for TCS website cleanup
 * Purpose: Remove non-content elements, widgets, and fix HTML issues
 * Applies to: www.tcs.com (all templates)
 *
 * SELECTORS EXTRACTED FROM:
 * - Captured DOM during migration of https://www.tcs.com/
 * - cleaned.html analysis from page scraping phase
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove header/navigation (handled by separate navigation skill)
    // EXTRACTED: Found <header> with class "cmp-experiencefragment--header" in captured DOM
    WebImporter.DOMUtils.remove(element, [
      'header',
      '.cmp-experiencefragment--header',
    ]);

    // Remove footer (handled separately)
    // EXTRACTED: Found <footer> with class "cmp-experiencefragment--footer" in captured DOM
    WebImporter.DOMUtils.remove(element, [
      'footer',
      '.cmp-experiencefragment--footer',
    ]);

    // Handle Dynamic Media containers: preserve static images, remove video players
    // EXTRACTED: Found multiple elements with id prefix "dynamicmedia_" in captured DOM
    // Some contain static images (solution cards, textWithAsset), others contain video players
    const dmContainers = element.querySelectorAll('[id^="dynamicmedia_"]');
    dmContainers.forEach((dm) => {
      const hasVideo = dm.querySelector('video, .s7videoplayer, .s7videoviewer');
      if (hasVideo) {
        // Video player — extract poster image before removing
        const assetPath = dm.getAttribute('data-asset-path');
        const imageServer = dm.getAttribute('data-imageserver') || 'https://s7ap1.scene7.com/is/image/';
        if (assetPath && dm.parentNode) {
          const { document: doc } = payload;
          const img = doc.createElement('img');
          img.src = `${imageServer}${assetPath}?fit=constrain,1&wid=1920&hei=1080`;
          img.alt = (dm.getAttribute('data-asset-name') || 'Video poster').replace(/\.\w+$/, '');
          dm.parentNode.insertBefore(img, dm);
        }
        dm.remove();
      } else {
        // Static image container — promote the img to parent, then remove wrapper
        const img = dm.querySelector('img.fluidimage, img.dynamic-media-image');
        if (img && dm.parentNode) {
          dm.parentNode.insertBefore(img, dm);
          dm.remove();
        }
      }
    });

    // Remove Dynamic Media dialog overlays (not content)
    WebImporter.DOMUtils.remove(element, [
      '.s7emaildialog',
      '.s7embeddialog',
      '.s7linkdialog',
    ]);

    // Remove swiper navigation controls (UI chrome, not content)
    // EXTRACTED: Found ".swiper-button-next", ".swiper-button-prev", ".swiper-pagination" in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.swiper-button-next',
      '.swiper-button-prev',
      '.swiper-pagination',
      '.solution-swiper-pagination-btn',
    ]);

    // Remove interactive overlay menus from hub panel
    // EXTRACTED: Found ".interactive-card-overlay" in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.interactive-card-overlay',
    ]);

    // Remove accordion close buttons (UI chrome)
    // EXTRACTED: Found ".close-icon" buttons in horizontal accordion in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.close-icon',
      '.horizontal-accordion-close-btn',
      '.overlay-close-btn',
    ]);

    // Remove cookie consent banner
    // EXTRACTED: Found "#onetrust-consent-sdk" in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '[class*="onetrust"]',
    ]);

    // Remove sticky contact button and its overlay form
    // EXTRACTED: Found ".stickyContactUs", ".page-overlay-welcomepage" in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.stickyContactUs',
      '.cmp-experiencefragment--sticky-nav-contact-us',
      '.page-overlay-welcomepage',
    ]);

    // Remove accessibility widget
    // EXTRACTED: Found ".cmp-experiencefragment--accessibility-widget" in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--accessibility-widget',
      '.sticky-accessibility-widget',
      '.accessibility-widget-overlay',
    ]);

    // Remove overlay detail modals (hub panel, accordion, feature card overlays)
    // EXTRACTED: Found ".overlay-detail-modal" elements in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.interactive-hub-overlay',
      '.horizontal-accordion-overlay',
      '.feature-card-overlay',
    ]);

    // Remove search overlay panel
    WebImporter.DOMUtils.remove(element, [
      '.search-overlay-panel',
    ]);

    // Re-enable scrolling if body has overflow hidden
    if (element.style.overflow === 'hidden') {
      element.setAttribute('style', 'overflow: scroll;');
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove remaining non-content elements
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'noscript',
      'source',
    ]);

    // Clean up tracking/analytics attributes
    // EXTRACTED: Found data-cmp-*, data-sly-*, onclick attributes in captured DOM
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-cmp-clickable');
      el.removeAttribute('data-sly-unwrap');
    });
  }
}
