/* ============================================================
   ACE RAZ CABUGA PORTFOLIO — UNIVERSAL ARROW CURSOR ENGINE (2026)
   - Universal Diagonal Arrowhead Pointer (Exact 0,0 tip alignment)
   - Smooth Trailing Interactive Ring (60 FPS lerp physics)
   - Project Card "VIEW" expander mode
   - Magnetic CTA buttons
   - Dynamic click ripple effect
   - Heading text hover mode
   - Form controls native fallback
   - Responsive & accessibility safe (pointer: fine + reduced-motion check)
   ============================================================ */

(function () {
  'use strict';

  // Feature detection: only enable on desktop / fine pointer devices
  const isTouchDevice = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isTouchDevice) return;

  function initCursor() {
    // Prevent duplicate initialization
    if (document.getElementById('customCursorPointer')) return;

    // Create Universal SVG Arrow Pointer
    const pointer = document.createElement('div');
    pointer.id = 'customCursorPointer';
    pointer.className = 'cursor-pointer';
    pointer.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3L10.5 20.5L14 14L20.5 10.5L3 3Z" fill="#ee5c21" stroke="#080808" stroke-width="1.6" stroke-linejoin="round"/>
      </svg>
    `;

    // Create Trailing Interactive Ring
    const ring = document.createElement('div');
    ring.id = 'customCursorRing';
    ring.className = 'cursor-ring';

    const text = document.createElement('span');
    text.className = 'cursor-text';
    text.textContent = '';
    ring.appendChild(text);

    // Create Click Ripple Element
    const ripple = document.createElement('div');
    ripple.id = 'customCursorRipple';
    ripple.className = 'cursor-ripple';

    document.body.appendChild(pointer);
    document.body.appendChild(ring);
    document.body.appendChild(ripple);
    document.body.classList.add('custom-cursor-enabled');

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let pointerX = -100;
    let pointerY = -100;
    let isVisible = false;
    let isHoveringForm = false;

    // Smooth position interpolation factor
    const lerpFactor = isReducedMotion ? 1 : 0.18;

    // Render loop using requestAnimationFrame
    function render() {
      if (isVisible && !isHoveringForm) {
        // Universal Arrow Tip aligns 1:1 with mouse position
        pointerX = mouseX;
        pointerY = mouseY;
        pointer.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;

        // Trailing ring follows with smooth lerp centered on cursor
        ringX += (mouseX - ringX) * lerpFactor;
        ringY += (mouseY - ringY) * lerpFactor;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        pointer.classList.add('is-active');
        ring.classList.add('is-active');
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      pointer.classList.remove('is-active');
      ring.classList.remove('is-active');
    });

    document.addEventListener('mouseenter', () => {
      isVisible = true;
      pointer.classList.add('is-active');
      ring.classList.add('is-active');
    });

    // Click Ripple Effect
    window.addEventListener('mousedown', (e) => {
      if (isHoveringForm) return;

      // Click pulse on pointer and ring
      pointer.classList.add('is-clicked');
      ring.classList.add('is-clicked');
      setTimeout(() => {
        pointer.classList.remove('is-clicked');
        ring.classList.remove('is-clicked');
      }, 150);

      // Ripple animation centered at click tip
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      ripple.classList.remove('animate');
      // Trigger reflow
      void ripple.offsetWidth;
      ripple.classList.add('animate');
    });

    // Element Interaction Delegation
    document.addEventListener('mouseover', (e) => {
      const target = e.target;
      if (!target || !(target instanceof HTMLElement)) return;

      // Form Elements Check
      if (target.closest('input, textarea, select, [contenteditable="true"]')) {
        isHoveringForm = true;
        pointer.classList.add('is-hidden');
        ring.classList.add('is-hidden');
        return;
      } else {
        isHoveringForm = false;
        pointer.classList.remove('is-hidden');
        ring.classList.remove('is-hidden');
      }

      // Headings Check
      const headingEl = target.closest('h1, h2, h3, .display, .hero-title, .about-title h2');
      if (headingEl) {
        ring.classList.add('is-text');
        pointer.classList.add('is-text');
        return;
      }

      // Interactive Elements Check
      const interactiveEl = target.closest('a, button, .btn, .nav-link, .filter-btn, .social-list a, .to-top-btn, .link-btn, .menu-toggle, [role="button"], .tool-tile, .project-card, .project-art, .modal-shot, .education-card, .portrait-shell');
      if (interactiveEl) {
        ring.classList.add('is-hover');
        pointer.classList.add('is-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target;
      if (!target || !(target instanceof HTMLElement)) return;

      if (target.closest('h1, h2, h3, .display, .hero-title, .about-title h2')) {
        ring.classList.remove('is-text');
        pointer.classList.remove('is-text');
      }

      if (target.closest('a, button, .btn, .nav-link, .filter-btn, .social-list a, .to-top-btn, .link-btn, .menu-toggle, [role="button"], .tool-tile, .project-card, .project-art, .modal-shot, .education-card, .portrait-shell')) {
        ring.classList.remove('is-hover');
        pointer.classList.remove('is-hover');
      }

      if (target.closest('input, textarea, select, [contenteditable="true"]')) {
        isHoveringForm = false;
        pointer.classList.remove('is-hidden');
        ring.classList.remove('is-hidden');
      }
    });

    // Magnetic CTA Button Effect
    if (!isReducedMotion) {
      const initMagneticButtons = () => {
        const ctaButtons = document.querySelectorAll('.btn, .nav-cta, .btn-primary, .btn-ghost, .filter-btn');

        ctaButtons.forEach((btn) => {
          if (btn.dataset.magneticInit) return;
          btn.dataset.magneticInit = 'true';

          const innerText = btn.querySelector('span') || btn;
          const innerIcon = btn.querySelector('i');

          btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;

            // Max displacement 6px for container, 3px for text/icon
            const moveX = Math.max(-7, Math.min(7, distanceX * 0.22));
            const moveY = Math.max(-7, Math.min(7, distanceY * 0.22));

            btn.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            btn.style.transition = 'transform 0.08s linear';

            if (innerText && innerText !== btn) {
              innerText.style.transform = `translate3d(${moveX * 0.35}px, ${moveY * 0.35}px, 0)`;
              innerText.style.transition = 'transform 0.08s linear';
            }
            if (innerIcon) {
              innerIcon.style.transform = `translate3d(${moveX * 0.5}px, ${moveY * 0.5}px, 0)`;
              innerIcon.style.transition = 'transform 0.08s linear';
            }
          });

          btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate3d(0, 0, 0)';
            btn.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';

            if (innerText && innerText !== btn) {
              innerText.style.transform = 'translate3d(0, 0, 0)';
              innerText.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
            }
            if (innerIcon) {
              innerIcon.style.transform = 'translate3d(0, 0, 0)';
              innerIcon.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
            }
          });
        });
      };

      initMagneticButtons();
      window.addEventListener('load', initMagneticButtons);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCursor);
  } else {
    initCursor();
  }
})();
