# Ace Raz Cabuga Portfolio

Creative Technologist · Full-Stack Developer · Graphic & Print Artist.
Designing ideas. Building systems. Producing experiences.

## Overview

A 2026 premium dark-editorial portfolio for **Ace Raz Cabuga**. It presents one person across three
practices — **creative** (brand, graphic, UI/UX), **technical** (full-stack web systems, dashboards,
workflows), and **production** (large-format print, apparel, event materials) — so a visitor
immediately understands: Ace designs, develops, and produces, from concept to final output.

- Concept → Design → Development → Production → Final Output
- Dark charcoal background, off-white type, red-orange accent, monospace technical labels
- Vanilla HTML + CSS + JavaScript only; no frameworks, no icon CDNs, no stock imagery
- Static hosting on Vercel; no build step, no server code

## Features

- Sticky header that stays intact on scroll; blur background appears only after scrolling
- Active nav highlighting, smooth scrolling, animated mobile menu (collapses at 1100px)
- Hero with AC monogram portrait placeholder, live Philippine time, scroll cue, discipline ticker
- Selected Work: 7 large editorial cards with numbers, categories, REF index codes, tech tags,
  hover motion on desktop, full detail visible on mobile, animated filtering
  (All 7 / Systems 5 / Web 5 / Design 3 / Print 2)
- Case-study system in two layers: instant modal on the homepage (overview, problem, objectives,
  role, process, solution, technology, key features, screenshots, challenges, results, lessons)
  plus standalone `projects/*.html` deep-dive pages linked from the modal
- Services, Skills (grouped lists, no percentage bars), Tools grid, Beyond-the-Screen print
  feature (Print → Produce → Deliver, CMYK marks, sizes, register mark), About, Experience areas,
  Education, six-step Process, contact section with working mailto form composer
- Back-to-top button, scroll progress bar, copy-email button, dynamic year
- Accessibility: semantic landmarks, heading order, skip link, focus-visible rings, aria labels,
  keyboard-operable menu/filters/modal, 44px+ touch targets, reduced-motion support
- SEO: descriptive title and meta description, Open Graph + Twitter tags, canonical placeholder,
  favicon placeholder, theme-color, person structured data, robots.txt, sitemap.xml

## File Structure

```text
ace-r-cabuga-portfolio/
├── index.html                  # Homepage: hero, work + modal, services, skills, tools,
│                               # production, about, experience, education, process, contact
├── styles.css                  # Homepage design system (theme vars, layout, responsive)
├── script.js                   # Homepage interactions (nav, filter, modal, scrollspy, form)
├── css/
│   └── styles.css              # Stylesheet for standalone projects/*.html pages
├── js/
│   └── main.js                 # Interactions for standalone projects/*.html pages
├── assets/
│   ├── projects/               # Project artwork: *.svg placeholders now; add *.jpg covers
│   ├── profile/                # ac-monogram-profile.svg now; add ace-cabuga.jpg
│   ├── images/                 # Reserved for general imagery
│   └── icons/                  # Reserved for local icons (no external icon deps)
├── projects/                   # Standalone case-study pages (hpu, kpi, referral, rental,
│                               # pharmacy, pna-caraga, print-production)
├── favicon/                    # Reserved for exported favicon files
├── robots.txt                  # Crawler rules + sitemap reference (set production URL)
├── sitemap.xml                 # URL list (set production URL)
├── vercel.json                 # cleanUrls, no trailing slash, assets caching
├── visual-mockup.png           # Design reference image (not used by the site)
└── README.md                   # This file
```

The homepage (`index.html` + root `styles.css`/`script.js`) is the canonical experience. The
`projects/` pages share the same visual language through `css/` + `js/` and are linked from the
homepage modal via "Open full case page".

## Local Development

No build tools needed. Serve the folder with any static server so relative paths resolve:

```bash
# Python
python -m http.server 8000
# then open http://localhost:8000/

# or PHP / Laragon / XAMPP: point a vhost at this folder
# or VS Code: use the Live Server extension
```

You can also double-click `index.html`, but a local server matches Vercel behavior (clean URLs
for `projects/*.html`).

## Customization

Search the repo for the personal-value markers below. Each is documented at its location with a
comment explaining what to put there:

| Marker | Where | Meaning |
|---|---|---|
| `YOUR-EMAIL@example.com` | `index.html`, `script.js` | Owner email (mailto links, copy button, form composer) |
| `https://example.com/` | `index.html`, `robots.txt`, `sitemap.xml` | Production site URL (canonical, OG, sitemap) |
| `Institution — to be updated` | `index.html` education card | Graduate-school institution, once confirmed |
| `https://facebook.com/` etc. | `index.html` social list | Social profile URLs (homepage links until replaced) |
| Cover `.jpg` names | `index.html` cards, `script.js` modal | Real screenshots (see Replacing Project Images) |
| `assets/profile/ace-cabuga.jpg` | `index.html` hero | Real portrait (see Replacing Profile Photo) |

Content rules followed throughout: no invented clients, testimonials, awards, certifications,
employers, dates, statistics, or account URLs. Result fields in the modal say "To be updated"
until real outcomes exist. Note: the standalone `projects/*.html` drafts contain role, year, and
percentage figures from an earlier pass — treat those as unverified and confirm or remove them
before presenting the pages publicly.

## Adding Projects

1. In `index.html`, copy one `<article class="project-card">` inside `#projectGrid`.
2. Set `data-category` using the filter vocabulary (`systems`, `web`, `design`, `print`) and a
   unique `data-project` key; update the visible count in the filter buttons and the
   `02 / Selected Work (07)` eyebrow.
3. Add the matching entry to the `PROJECTS` object in `script.js` (all eleven case-study fields)
   and its cover placeholder comment in the card.
4. Add the card's `View case` button with `data-open="<key>"`.
5. Optional: duplicate one file in `projects/` for a standalone page and add it to
   `PROJECT_PAGES` in `script.js` so the modal links to it.

## Replacing Project Images

1. Export covers at ~1600px wide JPG: `hpu-job-request-cover.jpg`, `phu-kpi-cover.jpg`,
   `referral-board-cover.jpg`, `rental-system-cover.jpg`, `pharmacy-system-cover.jpg`,
   `pna-caraga-cover.jpg`, `print-production-cover.jpg` into `assets/projects/`.
2. In `index.html`, each card carries a placeholder comment with the exact `<img>` tag
   (src, descriptive alt, `loading="lazy"`) — swap the decorative `.project-art` block content.
3. Update the `shot` label for that key in the `PROJECTS` object in `script.js`.
4. For standalone pages, replace the `.svg` `<img>` in each `projects/*.html` with the JPG twin.

## Replacing Profile Photo

1. Save the portrait as `assets/profile/ace-cabuga.jpg` (800×1000px JPG recommended).
2. In `index.html`, find the `.portrait-shell` block in the hero card (marked with a
   PROFILE PHOTO comment) and replace the monogram placeholder with:
   `<img src="assets/profile/ace-cabuga.jpg" alt="Portrait of Ace Raz Cabuga" loading="lazy" />`
3. Keep the corner ticks and caption elements around it.

## Updating Contact Information

1. Replace every `YOUR-EMAIL@example.com` (two mailto buttons, social list, contact note,
   `copyEmail` data attribute, and the `TO` constant in `script.js`).
2. Replace the social-list hrefs with real profile URLs; keep `target="_blank" rel="noopener"`.
3. Set the production URL wherever `https://example.com/` appears (canonical, OG URL,
   `robots.txt`, `sitemap.xml`).
4. Confirm or edit the graduate-school institution line in `#education`.
5. Test: mailto buttons, copy-email button, form composer, and all four social links.

## Vercel Deployment

1. Push project to GitHub.
2. Log in to Vercel.
3. Import repository.
4. Select the repository.
5. Deploy. (Framework preset: Other. No build command.)
6. Add a custom domain if desired.

`vercel.json` already enables clean URLs (so `/projects/hpu-job-request` works), disables
trailing slashes, and sets long caching for `/assets/*`. No server code is required.
