import { moveInstrumentation } from '../../scripts/scripts.js';

const CAROUSEL_GAP = 24;

function buildCarouselNav(block, ul) {
  const nav = document.createElement('div');
  nav.className = 'cards-carousel-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'cards-carousel-prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = '&#8592;';
  prevBtn.disabled = true;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'cards-carousel-next';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = '&#8594;';

  nav.append(prevBtn, nextBtn);

  const items = ul.querySelectorAll('li');
  let currentIndex = 0;

  const goToSlide = (index) => {
    const containerWidth = block.offsetWidth;
    if (containerWidth <= 0) return;

    const perView = containerWidth >= 900 ? 3.15 : 1.15;
    const visibleCount = Math.floor(perView);
    const numGaps = Math.floor(perView);
    const cardWidth = (containerWidth - numGaps * CAROUSEL_GAP) / perView;

    items.forEach((li) => { li.style.width = `${cardWidth}px`; });

    currentIndex = Math.max(0, Math.min(index, items.length - visibleCount));
    ul.style.transform = `translateX(-${currentIndex * (cardWidth + CAROUSEL_GAP)}px)`;
    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= items.length - visibleCount;
  };

  prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

  // Use ResizeObserver to initialize and re-layout when block becomes visible
  // or resizes. This handles AEM UE where the section starts hidden (display:none)
  // and block.offsetWidth is 0 during initial decoration.
  const observer = new ResizeObserver(() => goToSlide(currentIndex));
  observer.observe(block);

  return nav;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1
        && (div.querySelector('picture') || div.querySelector('img'))) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });
    ul.append(li);
  });

  block.textContent = '';

  // Carousel variant: class added by AEM from block name "cards (carousel)"
  if (block.classList.contains('carousel')) {
    ul.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; });
    const nav = buildCarouselNav(block, ul);
    block.append(nav, ul);
  } else {
    block.append(ul);
  }
}
