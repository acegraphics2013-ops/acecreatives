/* ============================================================
   Ace Raz Cabuga — portfolio interactions (vanilla JS)
   - mobile navigation
   - scroll header + progress + back-to-top
   - reveal on scroll
   - project filtering (animated)
   - active section navigation
   - case-study modal (reusable)
   - local time, copy email, contact form, year
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');

  function closeMenu() {
    if (!nav || !menuToggle) return;
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenu();
        closeModal();
      }
    });
  }

  /* ---------- Scroll: header state + progress + back-to-top ---------- */
  const header = document.querySelector('.site-header');
  const scrollBar = document.getElementById('scrollBar');
  const toTopBtn = document.getElementById('toTopBtn');

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 12);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (y / max) * 100 : 0;
    if (scrollBar) scrollBar.style.width = pct.toFixed(2) + '%';

    if (toTopBtn) toTopBtn.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (toTopBtn) toTopBtn.addEventListener('click', scrollTop);
  const toTopLink = document.getElementById('toTop');
  if (toTopLink) {
    toTopLink.addEventListener('click', (e) => {
      e.preventDefault();
      scrollTop();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealElements = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' }
    );
    revealElements.forEach((el) => observer.observe(el));
  }

  /* ---------- Project filtering (animated) ---------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const projectCount = document.getElementById('projectCount');
  const emptyNote = document.getElementById('emptyNote');
  const ANIM_MS = reduceMotion ? 0 : 180;

  function applyFilter(filter) {
    let visible = 0;
    projectCards.forEach((card) => {
      const categories = (card.dataset.category || '').split(' ').filter(Boolean);
      const shouldShow = filter === 'all' || categories.includes(filter);
      if (shouldShow) {
        visible += 1;
        card.classList.remove('is-hidden');
        card.classList.remove('is-hiding');
        // Re-trigger reveal for newly shown cards
        requestAnimationFrame(() => card.classList.add('visible'));
      } else {
        card.classList.add('is-hiding');
        setTimeout(() => {
          card.classList.add('is-hidden');
        }, ANIM_MS);
      }
    });

    const total = projectCards.length;
    if (projectCount) projectCount.textContent = 'Showing ' + visible + ' / ' + total;
    if (emptyNote) emptyNote.hidden = visible !== 0;
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      applyFilter(button.dataset.filter);
    });
  });

  /* ---------- Active section navigation (scrollspy) ---------- */
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const sections = Array.from(navLinks)
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = '#' + entry.target.id;
            navLinks.forEach((a) => {
              a.classList.toggle('active', a.getAttribute('href') === id);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Local time (Asia/Manila) ---------- */
  function tickTime() {
    try {
      const fmt = new Intl.DateTimeFormat('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Manila',
      });
      const t = fmt.format(new Date());
      const a = document.getElementById('localTime');
      const b = document.getElementById('localTimeFooter');
      if (a) a.textContent = t;
      if (b) b.textContent = t;
    } catch (err) {
      /* ignore — time is decorative */
    }
  }
  tickTime();
  setInterval(tickTime, 30000);

  /* ---------- Copy email ---------- */
  const copyBtn = document.getElementById('copyEmail');
  const copyNote = document.getElementById('copyNote');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email || '';
      try {
        await navigator.clipboard.writeText(email);
        if (copyNote) copyNote.textContent = ' — copied';
      } catch (err) {
        if (copyNote) copyNote.textContent = ' — ' + email;
      }
    });
  }

  /* ---------- Contact form → composes a mailto (no backend needed) ---------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const emailLink = document.getElementById('emailLink');
  const TO = 'acegraphics2013@gmail.com';

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const type = String(data.get('type') || 'Project Request');
      const message = String(data.get('message') || '').trim();

      if (!name || !email || !message) {
        if (formNote) formNote.textContent = 'Please complete name, email, and project details.';
        return;
      }

      if (formNote) formNote.textContent = 'Sending inquiry directly to acegraphics2013@gmail.com...';

      fetch('https://formsubmit.co/ajax/' + TO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: 'New Portfolio Inquiry — ' + type + ' from ' + name,
          name: name,
          email: email,
          project_type: type,
          message: message
        })
      })
      .then(res => res.json())
      .then(() => {
        if (formNote) {
          formNote.style.color = 'var(--accent)';
          formNote.textContent = '✓ Message sent successfully! Ace will reply to your email shortly.';
        }
        form.reset();
      })
      .catch(() => {
        const subject = encodeURIComponent('Project inquiry — ' + type + ' — ' + name);
        const body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nType: ' + type + '\n\n' + message);
        window.location.href = 'mailto:' + TO + '?subject=' + subject + '&body=' + body;
        if (formNote) formNote.textContent = 'Opening your email app…';
      });
    });
  }
  /* ---------- Start a Project button → focuses contact form ---------- */
  const startProjectBtn = document.getElementById('startProjectBtn');
  if (startProjectBtn) {
    startProjectBtn.addEventListener('click', () => {
      const nameInput = document.querySelector('#contactForm input[name="name"]');
      if (nameInput) {
        nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => nameInput.focus(), 350);
      }
    });
  }

  /* ---------- Case-study modal (reusable detail panel) ----------
     Each project supports: Overview / Problem / Objectives / Role /
     Process / Solution / Technology / Key Features / Screenshots /
     Challenges / Results / Lessons Learned.
     To add real screenshots, place files in assets/projects/ and
     update the `shot` label + <img> in the modal. */
  const PROJECTS = {
    hpu: {
      title: 'HPU Job Request System',
      cat: 'Web Application / Workflow System',
      shot: 'Screenshot — assets/projects/hpu-job-request-cover.jpg',
      overview: 'Centralized request and workflow platform for graphic design, video production, coverage, and IEC material requests.',
      problem: 'Requests arrived through scattered channels, making status and ownership hard to track.',
      objectives: 'Single intake point; clear approvals; visible status from request to delivery.',
      role: 'Design + build: interface, workflow, and database.',
      process: 'Discover → plan → design → build → refine, with approval and evaluation steps mapped first.',
      solution: 'Role-based queue with approvals, QR tracking, Kanban board, activity timeline, and evaluation workflow.',
      tech: 'PHP · MySQL · JavaScript',
      features: 'Role-based access · Approval workflows · QR tracking · Kanban board · Activity timeline · Evaluation workflow',
      challenges: 'Balancing flexible request types with a consistent approval flow.',
      results: 'To be updated with measured outcomes after deployment review.',
      lessons: 'Operational tools succeed when the workflow matches how the team already works.',
    },
    kpi: {
      title: 'PHU KPI-DPMS',
      cat: 'Performance Management System',
      shot: 'Screenshot — assets/projects/phu-kpi-cover.jpg',
      overview: 'KPI monitoring and performance reporting platform for organizational planning and management.',
      problem: 'Performance data lived in separate files, slowing planning and reporting.',
      objectives: 'One source of KPI truth with role-appropriate views and reports.',
      role: 'Full-stack: data model, access control, dashboards, and reports.',
      process: 'Defined indicators first, then roles, then reporting views.',
      solution: 'Role-based dashboards with reporting, notifications, and audit logs.',
      tech: 'Node.js · Express · MySQL · EJS',
      features: 'Role-based access · Reporting · Notifications · Audit logs · Dashboards',
      challenges: 'Keeping indicator definitions stable while the organization iterates.',
      results: 'To be updated with measured outcomes after deployment review.',
      lessons: 'Reporting is a design problem as much as a data problem.',
    },
    referral: {
      title: 'Referral Operations Board',
      cat: 'Healthcare Dashboard',
      shot: 'Screenshot — assets/projects/referral-board-cover.jpg',
      overview: 'Referral monitoring interface for incoming referrals, urgency, turnaround time, pending cases, and ward availability.',
      problem: 'Referral status was hard to see at a glance during busy operations.',
      objectives: 'One board showing what needs attention now.',
      role: 'UI/UX + frontend: layout, urgency states, and monitoring views.',
      process: 'Mapped the referral flow, then designed urgency and turnaround states.',
      solution: 'Operations board with urgency flags, turnaround tracking, and availability overview.',
      tech: 'Dashboard · UI/UX · Healthcare workflow',
      features: 'Urgency view · Turnaround tracking · Pending queue · Ward availability',
      challenges: 'Presenting density without losing readability.',
      results: 'To be updated after operational review.',
      lessons: 'Clinical interfaces must prioritize scanning speed.',
    },
    rental: {
      title: 'Centralized Phone & Tablet Rental System',
      cat: 'Device Management Platform',
      shot: 'Screenshot — assets/projects/rental-system-cover.jpg',
      overview: 'Issuance and return tracking for shared phones and tablets using lightweight office tooling.',
      problem: 'Shared devices were logged informally, causing loss of accountability.',
      objectives: 'Simple checkout log with clear custody and status.',
      role: 'Design + build on Google Workspace tooling.',
      process: 'Modeled checkout/return states, then automated the log.',
      solution: 'Apps Script + Sheets tracker with status and history.',
      tech: 'Google Apps Script · Google Sheets · Android client',
      features: 'Checkout log · Availability status · History · Simple admin views',
      challenges: 'Keeping the tool light enough for daily use.',
      results: 'To be updated after operational review.',
      lessons: 'The best system is the one staff will actually use.',
    },
    pharmacy: {
      title: 'Pharmacy Management System',
      cat: 'Healthcare / Inventory / POS',
      shot: 'Screenshot — assets/projects/pharmacy-system-cover.jpg',
      overview: 'Medicine inventory, batch tracking, expiry monitoring, POS transactions, reports, and audit logs.',
      problem: 'Stock, batches, and sales were tracked separately, risking expiry and discrepancies.',
      objectives: 'Connect inventory, sales, and reporting in one flow.',
      role: 'Design + build: inventory model, POS flow, and reports.',
      process: 'Modeled batches and expiry first, then POS and reconciliation.',
      solution: 'Inventory with batch/expiry tracking, POS, reports, and audit trail.',
      tech: 'Inventory · POS · Reports · Audit logs',
      features: 'Batch tracking · Expiry monitoring · POS · Reports · Audit logs',
      challenges: 'Reconciling real-world stock movement with system records.',
      results: 'To be updated after operational review.',
      lessons: 'Inventory accuracy depends on simple, fast capture.',
    },
    pna: {
      title: 'PNA Caraga Nurses Convention',
      cat: 'Brand Identity / Event Design',
      shot: 'Screenshot — assets/projects/pna-caraga-cover.jpg',
      overview: 'Complete event visual system: branding, posters, event materials, apparel, and digital communication.',
      problem: 'A multi-day convention needed one coherent identity across physical and digital touchpoints.',
      objectives: 'One system flexible enough for stage, print, apparel, and social.',
      role: 'Identity + collateral: logo use, layouts, apparel, and event graphics.',
      process: 'Identity → key visuals → rollout across formats with print specs checked early.',
      solution: 'Event brand kit applied to posters, backdrops, apparel, and posts.',
      tech: 'Branding · Layout · Print preparation',
      features: 'Identity · Posters · Stage visuals · Apparel · Social kit',
      challenges: 'Maintaining consistency from tarpaulin scale to phone screens.',
      results: 'To be updated with event documentation.',
      lessons: 'Event brands must be designed at both extremes of scale.',
    },
    print: {
      title: 'Print & Event Production',
      cat: 'Print Production',
      shot: 'Screenshot — assets/projects/print-production-cover.jpg',
      overview: 'Large-format printing, T-shirt production, DTF, sublimation, backdrops, booth graphics, signage, and merchandise.',
      problem: 'Digital artwork often arrives unprepared for physical output.',
      objectives: 'Production-ready files and reliable execution from design to install.',
      role: 'Design + prepress + machine operation.',
      process: 'Artwork → sizing and proofing → production → quality check → delivery.',
      solution: 'End-to-end handling: layout, color and scale checks, printing, and finishing.',
      tech: 'Large format · DTF · Sublimation · Heat press',
      features: 'Tarpaulins · Backdrops · Vinyl & stickers · Apparel · Signage · Merchandise',
      challenges: 'Hitting color and scale correctly across materials and machines.',
      results: 'Ongoing production practice across events and orders.',
      lessons: 'Prepress discipline saves more time than any machine upgrade.',
    },
  };

  const modal = document.getElementById('projectModal');
  const modalPageLink = document.getElementById('modalPageLink');
  // Standalone deep-dive pages (complements the modal; served via cleanUrls on Vercel)
  const PROJECT_PAGES = {
    hpu: 'projects/hpu-job-request.html',
    kpi: 'projects/phu-kpi.html',
    referral: 'projects/referral-board.html',
    rental: 'projects/phone-rental.html',
    pharmacy: 'projects/pharmacy-system.html',
    pna: 'projects/pna-caraga.html',
    print: 'projects/print-production.html',
  };
  let lastFocus = null;

  function openModal(key) {
    const data = PROJECTS[key];
    if (!modal || !data) return;
    lastFocus = document.activeElement;

    document.getElementById('modalKicker').textContent = 'Case study — ' + data.cat;
    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalCat').textContent = data.cat + ' · ' + data.tech;
    document.getElementById('modalShotText').textContent = data.shot;
    document.getElementById('mOverview').textContent = data.overview;
    document.getElementById('mProblem').textContent = data.problem;
    document.getElementById('mObjectives').textContent = data.objectives;
    document.getElementById('mRole').textContent = data.role;
    document.getElementById('mProcess').textContent = data.process;
    document.getElementById('mSolution').textContent = data.solution;
    document.getElementById('mTech').textContent = data.tech;
    document.getElementById('mFeatures').textContent = data.features;
    document.getElementById('mChallenges').textContent = data.challenges;
    document.getElementById('mResults').textContent = data.results;
    document.getElementById('mLessons').textContent = data.lessons;
    if (modalPageLink && PROJECT_PAGES[key]) {
      modalPageLink.href = PROJECT_PAGES[key];
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal || !modal.classList.contains('open')) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.open));
  });
  if (modal) {
    modal.querySelectorAll('[data-close]').forEach((el) => {
      el.addEventListener('click', closeModal);
    });
  }

  /* ---------- Footer year ---------- */
  const yearTarget = document.getElementById('year');
  if (yearTarget) yearTarget.textContent = new Date().getFullYear();

  /* ---------- Real Visitor Analytics (Live Viewers + Total Visits) ---------- */
  (function initVisitorAnalytics() {
    const container = document.getElementById('visitorStats');
    const liveElem = document.getElementById('liveViewerCount');
    const totalElem = document.getElementById('totalVisitCount');
    if (!container || !liveElem || !totalElem) return;

    // Retrieve or create persistent anonymous session ID
    let sessionId = sessionStorage.getItem('ace_session_id');
    if (!sessionId) {
      sessionId = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 's_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      sessionStorage.setItem('ace_session_id', sessionId);
    }

    const numFormatter = new Intl.NumberFormat('en-US');

    function updateUI(live, total) {
      if (typeof live === 'number' && typeof total === 'number' && !isNaN(live) && !isNaN(total)) {
        liveElem.textContent = live;
        totalElem.textContent = numFormatter.format(total);
        container.classList.remove('is-fallback');
      } else {
        showFallback();
      }
    }

    function showFallback() {
      container.classList.add('is-fallback');
      if (liveElem) liveElem.textContent = '';
      const label = container.querySelector('.live-viewers .stats-label');
      if (label) label.textContent = 'Portfolio online';
    }

    async function sendAnalytics(endpoint, payload = {}) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, ...payload })
        });
        if (!res.ok) throw new Error('API response failed');
        const data = await res.json();
        if (data && data.success && typeof data.liveViewers === 'number') {
          updateUI(data.liveViewers, data.totalVisits);
        } else {
          showFallback();
        }
      } catch (err) {
        showFallback();
      }
    }

    // Determine whether to count new visit or perform heartbeat
    const hasVisited = sessionStorage.getItem('ace_visited');
    if (!hasVisited) {
      sendAnalytics('/api/visitor').then(() => {
        sessionStorage.setItem('ace_visited', '1');
      });
    } else {
      sendAnalytics('/api/heartbeat');
    }

    // Active heartbeat polling every 25 seconds
    const HEARTBEAT_MS = 25000;
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        sendAnalytics('/api/heartbeat');
      }
    }, HEARTBEAT_MS);

    // Refresh instantly when returning to the tab
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        sendAnalytics('/api/heartbeat');
      }
    });

    // Notify backend on tab unload
    window.addEventListener('pagehide', () => {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ sessionId, action: 'leave' })], { type: 'application/json' });
        navigator.sendBeacon('/api/heartbeat', blob);
      }
    });
  })();

  /* ---------- Review Modal Controller ---------- */
  (function initReviewModal() {
    const rModal = document.getElementById('reviewModal');
    const rBackdrop = document.getElementById('reviewModalBackdrop');
    const rCloseBtn = document.getElementById('closeReviewModal');
    const rForm = document.getElementById('reviewForm');
    const rNote = document.getElementById('reviewFormNote');
    const rSubmitBtn = document.getElementById('submitReviewBtn');

    if (!rModal) return;

    function openRModal() {
      rModal.removeAttribute('hidden');
      rModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      const firstInput = rForm ? rForm.querySelector('input[name="name"]') : null;
      if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }

    function closeRModal() {
      rModal.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => rModal.setAttribute('hidden', 'true'), 300);
    }

    document.querySelectorAll('.open-review-modal-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openRModal();
      });
    });

    if (rBackdrop) rBackdrop.addEventListener('click', closeRModal);
    if (rCloseBtn) rCloseBtn.addEventListener('click', closeRModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && rModal.classList.contains('is-open')) {
        closeRModal();
      }
    });

    if (rForm) {
      rForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (rNote) {
          rNote.style.color = 'var(--text)';
          rNote.textContent = 'Sending endorsement...';
        }
        if (rSubmitBtn) rSubmitBtn.disabled = true;

        try {
          const formData = new FormData(rForm);
          const res = await fetch(rForm.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
          });

          if (res.ok) {
            if (rNote) {
              rNote.style.color = '#10b981';
              rNote.textContent = '✓ Thank you! Your endorsement has been sent to Ace.';
            }
            rForm.reset();
            setTimeout(() => closeRModal(), 2400);
          } else {
            throw new Error('Server returned non-200');
          }
        } catch (err) {
          if (rNote) {
            rNote.style.color = '#ef4444';
            rNote.textContent = 'Form submission paused. Opening email app...';
          }
          setTimeout(() => {
            window.location.href = "mailto:acegraphics2013@gmail.com?subject=Client%20Review%20%26%20Testimonial%20%E2%80%94%20Ace%20Raz%20Cabuga";
          }, 800);
        } finally {
          if (rSubmitBtn) rSubmitBtn.disabled = false;
        }
      });
    }
  })();
})();

