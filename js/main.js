/* ==========================================================================
   ACE RAZ CABUGA PORTFOLIO — MAIN JAVASCRIPT ENGINE (2026)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHeaderScroll();
  initScrollProgress();
  initLiveClock();
  initRevealAnimations();
  initProjectFilters();
  initModalDrawer();
  initContactActions();
  initActiveNavHighlight();
  initYear();
});

/* 1. Mobile Navigation Drawer */
function initMobileNav() {
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (!menuToggle || !siteNav) return;

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : (!siteNav.classList.contains('open') && !siteNav.classList.contains('is-open'));
    siteNav.classList.toggle('open', isOpen);
    siteNav.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  }

  menuToggle.addEventListener('click', () => toggleMenu());

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (siteNav.classList.contains('open') || siteNav.classList.contains('is-open'))) {
      toggleMenu(false);
    }
  });
}

/* 2. Sticky Header Scroll Effect */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 30;
    header.classList.toggle('scrolled', scrolled);
    header.classList.toggle('is-scrolled', scrolled);
  }, { passive: true });
}

/* 3. Top Scroll Progress Line */
function initScrollProgress() {
  const scrollBar = document.getElementById('scrollBar');
  if (!scrollBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      scrollBar.style.width = `${progress}%`;
    }
  }, { passive: true });
}

/* 4. Real-time Philippine Time Clock (PHT: UTC+8) */
function initLiveClock() {
  const timeTargets = [document.getElementById('localTime'), document.getElementById('localTimeFooter')];
  
  function updateClock() {
    const now = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const timeStr = new Intl.DateTimeFormat('en-US', options).format(now);
    timeTargets.forEach((target) => {
      if (target) target.textContent = timeStr;
    });
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* 5. IntersectionObserver Reveal Animations */
function initRevealAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach((el) => observer.observe(el));
}

/* 6. Project Category Filtering */
function initProjectFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const projectCount = document.getElementById('projectCount');
  const emptyNote = document.getElementById('emptyNote');

  if (!filterButtons.length || !projectCards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((btn) => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      let visibleCount = 0;

      projectCards.forEach((card) => {
        const categories = (card.dataset.category || '').split(' ');
        const shouldShow = filter === 'all' || categories.includes(filter);

        if (shouldShow) {
          card.classList.remove('is-hidden');
          visibleCount++;
        } else {
          card.classList.add('is-hidden');
        }
      });

      if (projectCount) {
        projectCount.textContent = `Showing ${visibleCount} / ${projectCards.length}`;
      }

      if (emptyNote) {
        emptyNote.hidden = visibleCount > 0;
      }
    });
  });
}

/* 7. Interactive Case Study Modal Drawer */
function initModalDrawer() {
  const overlay = document.getElementById('modalOverlay');
  const drawer = document.getElementById('modalDrawer');
  const closeBtn = document.getElementById('modalCloseBtn');

  if (!overlay || !drawer) return;

  function openModal(projectData) {
    const modalTitle = document.getElementById('modalTitle');
    const modalCategory = document.getElementById('modalCategory');
    const modalDesc = document.getElementById('modalDesc');
    const modalTech = document.getElementById('modalTech');
    const modalImage = document.getElementById('modalImage');
    const modalLink = document.getElementById('modalLink');

    if (modalTitle) modalTitle.textContent = projectData.title || 'Project Details';
    if (modalCategory) modalCategory.textContent = projectData.category || 'Case Study';
    if (modalDesc) modalDesc.textContent = projectData.desc || '';
    if (modalTech) {
      modalTech.innerHTML = (projectData.tech || '')
        .split(',')
        .map(t => `<span class="tech-tag-chip">${t.trim()}</span>`)
        .join(' ');
    }
    if (modalImage && projectData.img) {
      modalImage.src = projectData.img;
      modalImage.alt = projectData.title || 'Project screenshot';
    }
    if (modalLink && projectData.link) {
      modalLink.href = projectData.link;
    }

    overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.js-open-modal').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const card = trigger.closest('.project-card');
      if (!card) return;

      const projectData = {
        title: card.dataset.title || card.querySelector('h3')?.textContent,
        category: card.dataset.categoryLabel || card.querySelector('.badge-tag')?.textContent,
        desc: card.dataset.desc || card.querySelector('.project-desc')?.textContent,
        tech: card.dataset.tech || '',
        img: card.querySelector('img')?.src || '',
        link: card.dataset.caseLink || '#'
      };

      openModal(projectData);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-active')) {
      closeModal();
    }
  });
}

/* 8. Contact Form & Copy Email Logic */
function initContactActions() {
  const copyBtn = document.getElementById('copyEmailBtn');
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const email = copyBtn.dataset.email || 'acegraphics2013@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        const origText = copyBtn.textContent;
        copyBtn.textContent = 'Copied to Clipboard! ✓';
        setTimeout(() => { copyBtn.textContent = origText; }, 2500);
      }).catch(() => {
        alert(`Email address: ${email}`);
      });
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const name = (formData.get('name') || '').trim();
      const email = (formData.get('email') || '').trim();
      const type = formData.get('type') || 'Project Request';
      const details = (formData.get('message') || '').trim();

      if (!name || !email || !details) {
        if (formNote) formNote.textContent = 'Please complete all required fields.';
        return;
      }

      if (formNote) formNote.textContent = 'Sending inquiry directly to acegraphics2013@gmail.com...';

      // AJAX post to FormSubmit endpoint
      fetch('https://formsubmit.co/ajax/acegraphics2013@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Portfolio Inquiry — ${type} from ${name}`,
          name: name,
          email: email,
          project_type: type,
          message: details
        })
      })
      .then(res => res.json())
      .then(data => {
        if (formNote) {
          formNote.style.color = 'var(--accent)';
          formNote.textContent = '✓ Message sent successfully! Ace will reply to your email shortly.';
        }
        contactForm.reset();
      })
      .catch(err => {
        // Fallback: mailto
        const targetEmail = 'acegraphics2013@gmail.com';
        const subject = encodeURIComponent(`[Portfolio Contact] ${type} from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nProject Type: ${type}\n\nDetails:\n${details}`);
        window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
        if (formNote) {
          formNote.textContent = 'Opening your mail client for acegraphics2013@gmail.com…';
        }
      });
    });
  }
}

/* 9. Active Navigation Section Highlighting */
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.site-nav .nav-link');

  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPosition = window.scrollY + 200;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* 10. Dynamic Current Year */
function initYear() {
  const yearTarget = document.getElementById('year');
  if (yearTarget) yearTarget.textContent = new Date().getFullYear();
}
