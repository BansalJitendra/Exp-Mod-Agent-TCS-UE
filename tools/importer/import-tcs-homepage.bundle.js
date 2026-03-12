var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-tcs-homepage.js
  var import_tcs_homepage_exports = {};
  __export(import_tcs_homepage_exports, {
    default: () => import_tcs_homepage_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const scene7El = element.querySelector("[data-asset-path]");
    let posterSrc = null;
    let posterAlt = "TCS Hero Banner";
    if (scene7El) {
      const assetPath = scene7El.getAttribute("data-asset-path");
      const imageServer = scene7El.getAttribute("data-imageserver") || "https://s7ap1.scene7.com/is/image/";
      if (assetPath) {
        posterSrc = `${imageServer}${assetPath}?fit=constrain,1&wid=1920&hei=1080`;
      }
    }
    if (!posterSrc) {
      const heroImage = element.querySelector(
        ".hero-banner-box img, .hero-video-container img, .hero-banner-container img"
      );
      if (heroImage) {
        posterSrc = heroImage.src;
        posterAlt = heroImage.alt || posterAlt;
      }
    }
    const ctaLink = element.querySelector(
      "a.new-hero-banner, a.tcs-primary-btn, .hero-banner-content-div a"
    );
    const imageFrag = document.createDocumentFragment();
    imageFrag.appendChild(document.createComment(" field:image "));
    if (posterSrc) {
      const img = document.createElement("img");
      img.src = posterSrc;
      img.alt = posterAlt;
      const p = document.createElement("p");
      p.appendChild(img);
      imageFrag.appendChild(p);
    }
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    const visibleText = element.querySelector(".hero-banner-content-div span.visually-hidden");
    if (visibleText) {
      const fullText = visibleText.textContent.trim();
      const match = fullText.match(/The Perpetually Adaptive Enterprise/i);
      if (match) {
        const tagline = document.createElement("p");
        tagline.textContent = "The Perpetually Adaptive Enterprise";
        textFrag.appendChild(tagline);
      }
    }
    if (ctaLink) {
      const hiddenSpans = ctaLink.querySelectorAll(".visually-hidden");
      hiddenSpans.forEach((s) => s.remove());
      const p = document.createElement("p");
      p.appendChild(ctaLink);
      textFrag.appendChild(p);
    }
    const cells = [
      [imageFrag],
      [textFrag]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    const heading = element.querySelector("h2");
    if (heading) {
      element.before(heading);
    }
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document }, options = {}) {
    const blockName = options.blockName || "cards";
    const cardItems = element.querySelectorAll(
      ".swiper-slide.story-card-swiper-slide, .swiper-slide.solution-card-swiper-slide, .accordion-item, a.feature-card-swiper-slide"
    );
    const cells = [];
    cardItems.forEach((item) => {
      let img = item.querySelector(
        "img.story-card-image, img.solution-card-img, img.dynamic-media-image, img.accordion-img, img.card-img-top, .story-image-section img, .card-image-container img"
      );
      if (!img) {
        img = item.querySelector("img");
      }
      let imgSrc = "";
      let imgAlt = "";
      if (img) {
        imgSrc = img.src;
        imgAlt = img.alt || "";
      } else {
        const dm = item.querySelector('.s7dm-dynamic-media[data-asset-type="image"]');
        if (dm) {
          const server = dm.getAttribute("data-imageserver") || "";
          const assetPath = dm.getAttribute("data-asset-path") || "";
          if (server && assetPath) {
            imgSrc = server + assetPath;
          }
          imgAlt = dm.getAttribute("data-alt") || "";
        }
      }
      const imageCell = document.createDocumentFragment();
      if (imgSrc) {
        const p = document.createElement("p");
        const newImg = document.createElement("img");
        newImg.src = imgSrc;
        newImg.alt = imgAlt;
        p.appendChild(newImg);
        imageCell.appendChild(p);
      }
      const textCell = document.createDocumentFragment();
      const title = item.querySelector(
        ".story-card-title, h3.solution-card-inner-heading-text, h3.accordion-title, h3.card-title"
      );
      if (title) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = title.textContent.trim();
        p.appendChild(strong);
        textCell.appendChild(p);
      }
      const desc = item.querySelector(
        ".story-card-description, .solution-card-inner-description, .horizontal-accordion-title-content, .card-text"
      );
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc.textContent.trim();
        textCell.appendChild(p);
      }
      let ctaLink = item.querySelector(
        'a.story-cta-link, a[class*="know-more"], .description-content a'
      );
      if (!ctaLink && item.matches("a.solution-card-swiper-card, a.feature-card-swiper-slide")) {
        const a = document.createElement("a");
        a.href = item.href;
        a.textContent = "Read more";
        ctaLink = a;
      } else if (!ctaLink) {
        const parentLink = item.querySelector("a.solution-card-swiper-card");
        if (parentLink) {
          const a = document.createElement("a");
          a.href = parentLink.href;
          a.textContent = "Read more";
          ctaLink = a;
        }
      }
      if (ctaLink) {
        const hiddenSpans = ctaLink.querySelectorAll(".visually-hidden");
        hiddenSpans.forEach((s) => s.remove());
        const p = document.createElement("p");
        p.appendChild(ctaLink);
        textCell.appendChild(p);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: blockName,
      cells
    });
    const heading = element.querySelector("h2, .section-tile");
    if (heading) {
      element.before(heading);
    }
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document }) {
    const cells = [];
    const interactiveCards = element.querySelectorAll(".interactive-card");
    const textAssetRow = element.querySelector(".text-asset-row, .intro-section");
    if (interactiveCards.length > 0) {
      const row = [];
      interactiveCards.forEach((card) => {
        const col = document.createDocumentFragment();
        const img = card.querySelector("img.interactive-card-img");
        if (img) {
          col.appendChild(img);
        }
        const title = card.querySelector("h3.card-img-title, .card-img-title");
        if (title) {
          const hidden = title.querySelectorAll(".visually-hidden");
          hidden.forEach((s) => s.remove());
          const h3 = document.createElement("h3");
          h3.textContent = title.textContent.trim();
          col.appendChild(h3);
        }
        const desc = card.querySelector(".interactive-card-desc");
        if (desc) {
          const p = document.createElement("p");
          p.textContent = desc.textContent.trim();
          col.appendChild(p);
        }
        const link = card.querySelector("a.interactive-card-anchor");
        if (link) {
          const a = document.createElement("a");
          a.href = link.href;
          a.textContent = "Explore";
          const p = document.createElement("p");
          p.appendChild(a);
          col.appendChild(p);
        }
        row.push(col);
      });
      cells.push(row);
    } else if (textAssetRow) {
      const row = [];
      const textCol = document.createDocumentFragment();
      const introContent = element.querySelector(".intro-content, .asset-text-col");
      if (introContent) {
        const heading2 = introContent.querySelector("h2.intro-heading, h2");
        if (heading2) {
          const h2 = document.createElement("h2");
          h2.textContent = heading2.textContent.trim();
          textCol.appendChild(h2);
        }
        const subheading = introContent.querySelector("h3.intro-description, h3");
        if (subheading) {
          const h3 = document.createElement("h3");
          h3.textContent = subheading.textContent.trim().split("\n")[0].trim();
          textCol.appendChild(h3);
        }
        const descDiv = introContent.querySelector(".intro-text");
        if (descDiv) {
          const paragraphs = descDiv.querySelectorAll("p");
          paragraphs.forEach((p) => {
            if (p.textContent.trim()) {
              const newP = document.createElement("p");
              newP.textContent = p.textContent.trim();
              textCol.appendChild(newP);
            }
          });
        }
        const cta = introContent.querySelector(".content-link a, a.cta-link-focus");
        if (cta) {
          const hidden = cta.querySelectorAll(".visually-hidden");
          hidden.forEach((s) => s.remove());
          const a = document.createElement("a");
          a.href = cta.href;
          a.textContent = cta.textContent.trim();
          const p = document.createElement("p");
          p.appendChild(a);
          textCol.appendChild(p);
        }
      }
      row.push(textCol);
      const imgCol = document.createDocumentFragment();
      const image = element.querySelector(
        "img.fluidimage, img.dynamic-media-image, .text-with-assets-image-div img, .intro-player-box img"
      );
      if (image) {
        imgCol.appendChild(image);
      }
      row.push(imgCol);
      cells.push(row);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    const heading = element.querySelector(":scope > h2, :scope > .section-tile");
    if (heading) {
      element.before(heading);
    }
    element.replaceWith(block);
  }

  // tools/importer/transformers/tcs-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        ".cmp-experiencefragment--header"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "footer",
        ".cmp-experiencefragment--footer"
      ]);
      const dmContainers = element.querySelectorAll('[id^="dynamicmedia_"]');
      dmContainers.forEach((dm) => {
        const hasVideo = dm.querySelector("video, .s7videoplayer, .s7videoviewer");
        if (hasVideo) {
          const assetPath = dm.getAttribute("data-asset-path");
          const imageServer = dm.getAttribute("data-imageserver") || "https://s7ap1.scene7.com/is/image/";
          if (assetPath && dm.parentNode) {
            const { document: doc } = payload;
            const img = doc.createElement("img");
            img.src = `${imageServer}${assetPath}?fit=constrain,1&wid=1920&hei=1080`;
            img.alt = (dm.getAttribute("data-asset-name") || "Video poster").replace(/\.\w+$/, "");
            dm.parentNode.insertBefore(img, dm);
          }
          dm.remove();
        } else {
          const img = dm.querySelector("img.fluidimage, img.dynamic-media-image");
          if (img && dm.parentNode) {
            dm.parentNode.insertBefore(img, dm);
            dm.remove();
          }
        }
      });
      WebImporter.DOMUtils.remove(element, [
        ".s7emaildialog",
        ".s7embeddialog",
        ".s7linkdialog"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".swiper-button-next",
        ".swiper-button-prev",
        ".swiper-pagination",
        ".solution-swiper-pagination-btn"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".interactive-card-overlay"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".close-icon",
        ".horizontal-accordion-close-btn",
        ".overlay-close-btn"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        '[class*="onetrust"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".stickyContactUs",
        ".cmp-experiencefragment--sticky-nav-contact-us",
        ".page-overlay-welcomepage"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--accessibility-widget",
        ".sticky-accessibility-widget",
        ".accessibility-widget-overlay"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".interactive-hub-overlay",
        ".horizontal-accordion-overlay",
        ".feature-card-overlay"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".search-overlay-panel"
      ]);
      if (element.style.overflow === "hidden") {
        element.setAttribute("style", "overflow: scroll;");
      }
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "link",
        "noscript",
        "source"
      ]);
      const allElements = element.querySelectorAll("*");
      allElements.forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-cmp-clickable");
        el.removeAttribute("data-sly-unwrap");
      });
    }
  }

  // tools/importer/transformers/tcs-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.beforeTransform) return;
    const { document } = payload;
    const template = payload.template;
    if (!template || !template.sections || template.sections.length < 2) return;
    const sections = template.sections;
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
      let sectionEl = null;
      for (const sel of selectors) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }
      if (!sectionEl) {
        console.warn(`Section "${section.name}" selector not found: ${selectors.join(", ")}`);
        continue;
      }
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: {
            style: section.style
          }
        });
        sectionEl.after(sectionMetadata);
      }
      if (i > 0) {
        const hr = document.createElement("hr");
        sectionEl.before(hr);
      }
    }
  }

  // tools/importer/import-tcs-homepage.js
  var parsers = {
    "hero": parse,
    "cards": parse2,
    "columns": parse3
  };
  var PAGE_TEMPLATE = {
    name: "tcs-homepage",
    description: "TCS corporate homepage with hero banner, news carousel, solutions, customer stories, events, insights, careers, and contact CTA",
    urls: [
      "https://www.tcs.com/"
    ],
    blocks: [
      {
        name: "hero",
        instances: [".heroBanner"]
      },
      {
        name: "cards",
        variant: "carousel",
        instances: [".storyCardCarousel", ".solutionCard", ".horizontalAccordion"]
      },
      {
        name: "cards",
        instances: [".featureCard"]
      },
      {
        name: "columns",
        instances: [".interactiveHubPannel", ".textWithAsset"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Banner",
        selector: ".heroBanner",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "What's New",
        selector: ".storyCardCarousel",
        style: null,
        blocks: ["cards"],
        defaultContent: ["h2"]
      },
      {
        id: "section-3",
        name: "Cutting Edge Solutions",
        selector: ".interactiveHubPannel",
        style: "dark",
        blocks: ["columns"],
        defaultContent: ["h2"]
      },
      {
        id: "section-4",
        name: "Customer Stories",
        selector: ".solutionCard",
        style: null,
        blocks: ["cards"],
        defaultContent: ["h2"]
      },
      {
        id: "section-5",
        name: "Meet Us Here",
        selector: ".horizontalAccordion",
        style: null,
        blocks: ["cards"],
        defaultContent: ["h2"]
      },
      {
        id: "section-6",
        name: "News and Insights",
        selector: ".featureCard",
        style: null,
        blocks: ["cards"],
        defaultContent: ["h2"]
      },
      {
        id: "section-7",
        name: "Careers",
        selector: ".textWithAsset",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-8",
        name: "Contact CTA",
        selector: ".footerFlyout",
        style: null,
        blocks: [],
        defaultContent: ["p", "a"]
      }
    ]
  };
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_tcs_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path: path || "/index",
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_tcs_homepage_exports);
})();
