/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';
import columnsParser from './parsers/columns.js';

// TRANSFORMER IMPORTS
import tcsCleanupTransformer from './transformers/tcs-cleanup.js';
import tcsSectionsTransformer from './transformers/tcs-sections.js';

// PARSER REGISTRY - Map block names to parser functions
const parsers = {
  'hero': heroParser,
  'cards': cardsParser,
  'columns': columnsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'tcs-homepage',
  description: 'TCS corporate homepage with hero banner, news carousel, solutions, customer stories, events, insights, careers, and contact CTA',
  urls: [
    'https://www.tcs.com/'
  ],
  blocks: [
    {
      name: 'hero',
      instances: ['.heroBanner']
    },
    {
      name: 'cards',
      variant: 'carousel',
      instances: ['.storyCardCarousel', '.solutionCard', '.horizontalAccordion']
    },
    {
      name: 'cards',
      instances: ['.featureCard']
    },
    {
      name: 'columns',
      instances: ['.interactiveHubPannel', '.textWithAsset']
    }
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Banner',
      selector: '.heroBanner',
      style: null,
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-2',
      name: "What's New",
      selector: '.storyCardCarousel',
      style: null,
      blocks: ['cards'],
      defaultContent: ['h2']
    },
    {
      id: 'section-3',
      name: 'Cutting Edge Solutions',
      selector: '.interactiveHubPannel',
      style: 'dark',
      blocks: ['columns'],
      defaultContent: ['h2']
    },
    {
      id: 'section-4',
      name: 'Customer Stories',
      selector: '.solutionCard',
      style: null,
      blocks: ['cards'],
      defaultContent: ['h2']
    },
    {
      id: 'section-5',
      name: 'Meet Us Here',
      selector: '.horizontalAccordion',
      style: null,
      blocks: ['cards'],
      defaultContent: ['h2']
    },
    {
      id: 'section-6',
      name: 'News and Insights',
      selector: '.featureCard',
      style: null,
      blocks: ['cards'],
      defaultContent: ['h2']
    },
    {
      id: 'section-7',
      name: 'Careers',
      selector: '.textWithAsset',
      style: null,
      blocks: ['columns'],
      defaultContent: []
    },
    {
      id: 'section-8',
      name: 'Contact CTA',
      selector: '.footerFlyout',
      style: null,
      blocks: [],
      defaultContent: ['p', 'a']
    }
  ]
};

// TRANSFORMER REGISTRY - Array of transformer functions
// Section transformer included since template has 8 sections (>1)
const transformers = [
  tcsCleanupTransformer,
  tcsSectionsTransformer,
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          variant: blockDef.variant || null,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          const options = {};
          if (block.variant) {
            options.blockName = `${block.name} (${block.variant})`;
          }
          parser(block.element, { document, url, params }, options);
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path: path || '/index',
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
