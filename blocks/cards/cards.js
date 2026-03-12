import { moveInstrumentation } from '../../scripts/scripts.js';

const CAROUSEL_GAP = 24;

function getCardsPerView() {
  return window.innerWidth >= 900 ? 3.15 : 1.15;
}

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
    const perView = getCardsPerView();
    const visibleCount = Math.floor(perView);
    const containerWidth = block.offsetWidth;
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

  requestAnimationFrame(() => goToSlide(0));
  return nav;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && (div.querySelector('picture') || div.querySelector('img'))) {
        div.className = 'cards-card-image';
      } else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('.cards-card-image img').forEach((img) => {
    if (!img.closest('picture')) {
      // Wrap bare <img> in <picture> without rewriting the src URL.
      // Preserves the exact path so images resolve correctly in both
      // local preview and AEM Universal Editor.
      const picture = document.createElement('picture');
      const newImg = document.createElement('img');
      newImg.src = img.src;
      newImg.alt = img.alt || '';
      newImg.loading = 'lazy';
      picture.appendChild(newImg);
      moveInstrumentation(img, newImg);
      (img.closest('p') || img).replaceWith(picture);
    }
  });

  block.textContent = '';

  // Enable carousel mode for blocks with many cards
  const items = ul.querySelectorAll('li');
  if (items.length > 4) {
    block.classList.add('carousel');
    // Carousel overflow:hidden prevents lazy loading for off-screen slides
    ul.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; });
    const nav = buildCarouselNav(block, ul);
    block.append(nav, ul);
  } else {
    block.append(ul);
  }
}
