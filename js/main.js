// State
let isCanvasMode = false;
let scrollPosition = 0;
let scale = 0.3;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartTranslateX = 0;
let dragStartTranslateY = 0;

const MIN_SCALE = 0.05;
const MAX_SCALE = 1;

// Toggle between normal and canvas view
function toggleView() {
    const body = document.body;
    const toggleBtn = document.querySelector('.view-toggle');
    const main = document.querySelector('main');

    if (!isCanvasMode) {
        scrollPosition = window.scrollY;
        body.classList.add('canvas-mode');
        toggleBtn.innerHTML = `
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="2" width="14" height="14" rx="2"/>
            </svg>
            Slides
        `;
        isCanvasMode = true;

        // Reset transform - position for horizontal view
        scale = 0.15;
        translateX = 40;
        translateY = window.innerHeight / 2 - 200;
        updateCanvasTransform();
    } else {
        body.classList.remove('canvas-mode');
        toggleBtn.innerHTML = `
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="1" y="1" width="7" height="7" rx="1"/>
                <rect x="10" y="1" width="7" height="7" rx="1"/>
                <rect x="1" y="10" width="7" height="7" rx="1"/>
                <rect x="10" y="10" width="7" height="7" rx="1"/>
            </svg>
            Canvas
        `;
        isCanvasMode = false;

        // Reset main transform
        main.style.transform = '';

        setTimeout(() => {
            window.scrollTo(0, scrollPosition);
        }, 50);
    }
}

function updateCanvasTransform() {
    const main = document.querySelector('main');
    if (isCanvasMode) {
        main.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
}

// Click on slide in canvas mode to zoom in
function initSlideClick() {
    const slides = document.querySelectorAll('.slide');
    let dragDistance = 0;

    document.addEventListener('mousedown', () => {
        dragDistance = 0;
    });

    document.addEventListener('mousemove', () => {
        if (isDragging) dragDistance++;
    });

    slides.forEach(slide => {
        slide.addEventListener('click', (e) => {
            if (!isCanvasMode) return;
            if (dragDistance > 5) return; // Was a drag, not a click
            if (e.target.tagName === 'A') return;

            e.stopPropagation();
            toggleView();

            setTimeout(() => {
                slide.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        });
    });
}

// Drag to pan in canvas mode
function initCanvasDrag() {
    const main = document.querySelector('main');

    document.addEventListener('mousedown', (e) => {
        if (!isCanvasMode) return;

        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartTranslateX = translateX;
        dragStartTranslateY = translateY;
        main.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !isCanvasMode) return;

        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;

        translateX = dragStartTranslateX + dx;
        translateY = dragStartTranslateY + dy;

        updateCanvasTransform();
    });

    document.addEventListener('mouseup', () => {
        if (!isCanvasMode) return;
        const main = document.querySelector('main');

        setTimeout(() => {
            isDragging = false;
        }, 10);
        main.style.cursor = 'grab';
    });
}

// Zoom with scroll wheel
function initCanvasZoom() {
    document.addEventListener('wheel', (e) => {
        if (!isCanvasMode) return;

        e.preventDefault();

        const zoomIntensity = 0.002;
        const delta = -e.deltaY * zoomIntensity;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));

        // Zoom toward mouse position
        const rect = document.querySelector('main').getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Adjust translate to zoom toward mouse
        const scaleRatio = newScale / scale;
        translateX = mouseX - (mouseX - translateX) * scaleRatio;
        translateY = mouseY - (mouseY - translateY) * scaleRatio;

        scale = newScale;
        updateCanvasTransform();
    }, { passive: false });
}

// Touch support for mobile
function initTouchSupport() {
    let lastTouchDistance = 0;
    let lastTouchX = 0;
    let lastTouchY = 0;

    document.addEventListener('touchstart', (e) => {
        if (!isCanvasMode) return;

        if (e.touches.length === 1) {
            isDragging = true;
            dragStartX = e.touches[0].clientX;
            dragStartY = e.touches[0].clientY;
            dragStartTranslateX = translateX;
            dragStartTranslateY = translateY;
        } else if (e.touches.length === 2) {
            lastTouchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            lastTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            lastTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (!isCanvasMode) return;
        e.preventDefault();

        if (e.touches.length === 1 && isDragging) {
            const dx = e.touches[0].clientX - dragStartX;
            const dy = e.touches[0].clientY - dragStartY;

            translateX = dragStartTranslateX + dx;
            translateY = dragStartTranslateY + dy;

            updateCanvasTransform();
        } else if (e.touches.length === 2) {
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );

            const touchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const touchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            // Pinch zoom
            const scaleChange = distance / lastTouchDistance;
            const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * scaleChange));

            const scaleRatio = newScale / scale;
            translateX = touchX - (touchX - translateX) * scaleRatio;
            translateY = touchY - (touchY - translateY) * scaleRatio;

            // Pan
            translateX += touchX - lastTouchX;
            translateY += touchY - lastTouchY;

            scale = newScale;
            lastTouchDistance = distance;
            lastTouchX = touchX;
            lastTouchY = touchY;

            updateCanvasTransform();
        }
    }, { passive: false });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            if (isCanvasMode) {
                toggleView();
            }

            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                setTimeout(() => {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, isCanvasMode ? 100 : 0);
            }
        });
    });
}

// Header shadow on scroll
function initHeaderScroll() {
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        if (isCanvasMode) return;

        if (window.pageYOffset > 50) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        } else {
            header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
        }
    });
}

// Keyboard shortcuts
function initKeyboard() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isCanvasMode) {
            toggleView();
        }

        if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
            const activeElement = document.activeElement;
            if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                toggleView();
            }
        }

        // Zoom with + and -
        if (isCanvasMode) {
            if (e.key === '=' || e.key === '+') {
                scale = Math.min(MAX_SCALE, scale * 1.2);
                updateCanvasTransform();
            }
            if (e.key === '-') {
                scale = Math.max(MIN_SCALE, scale / 1.2);
                updateCanvasTransform();
            }
            if (e.key === '0') {
                scale = 0.15;
                translateX = 40;
                translateY = window.innerHeight / 2 - 200;
                updateCanvasTransform();
            }
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initHeaderScroll();
    initSlideClick();
    initCanvasDrag();
    initCanvasZoom();
    initTouchSupport();
    initKeyboard();
});
