const menuToggle = document.querySelector('.menu-toggle');
const menuOverlay = document.getElementById('site-menu');
const dialog = document.getElementById('lightbox');
const dialogImg = dialog.querySelector('.lightbox__img');
const closeBtn = dialog.querySelector('.lightbox__close');

document.addEventListener('click', (e) => {
  const img = e.target.closest('img.zoomable');
  if (!img) return;

  dialogImg.src = img.src;
  dialogImg.alt = img.alt || '';
  dialog.showModal();
});

closeBtn.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => {
  // click backdrop closes
  if (e.target === dialog) dialog.close();
});

// Close dialog with Escape key for accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && dialog && dialog.open) {
    dialog.close();
  }
});

// Inject a non-interactive zoom indicator into gallery items containing zoomable images
document.addEventListener('DOMContentLoaded', () => {
  const zoomImgs = document.querySelectorAll('img.zoomable');
  zoomImgs.forEach((img) => {
    const item = img.closest('.gallery__item') || img.parentElement;
    if (!item) return;
    // avoid duplicate indicators
    if (item.querySelector('.zoom-icon')) return;

    const indicator = document.createElement('span');
    indicator.className = 'zoom-icon';
    indicator.setAttribute('aria-hidden', 'true');
    // simple corner chevrons/marks indicating expandability
    indicator.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path d="M4 10V4h6" />
        <path d="M20 14v6h-6" />
      </svg>
    `;

    item.appendChild(indicator);
  });

  // Apply lazy-loading + blur-up effect to gallery images (including zoomable)
  const galleryImgs = document.querySelectorAll('.page__project .gallery__item img');
  galleryImgs.forEach((img) => {
    try {
      img.loading = 'lazy';
    } catch (e) {
      /* ignore if browser doesn't support setting loading */
    }
    img.classList.add('lazy-img');

    if (img.complete && img.naturalWidth !== 0) {
      // image already loaded from cache
      img.classList.add('is-loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
    }
  });
});


if (menuToggle && menuOverlay) {
  function openMenu() {
    menuOverlay.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOverlay.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', () => {
    if (menuOverlay.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  menuOverlay.addEventListener('click', (event) => {
    const target = event.target;
    if (target === menuOverlay) closeMenu();
    if (target.tagName === 'A') closeMenu();
  });
}