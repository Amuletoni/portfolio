# Continue Toni Guillem’s portfolio

## Owner brief and current state · 3 November 2026

Toni wants one portfolio URL he can share and keep current. His professional positioning is **Technical Game Designer, 15+ years of experience**. He explicitly wants separate places for Level Design and Game Design work. He confirmed he has no playable prototypes or videos to publish yet. Retain the empty workshop states until he supplies real work.

The website and local content editor are implemented. GitHub Pages is the requested hosting destination for this handover. A deployment workflow is included, but a GitHub repository, successful deployment, and public URL still need to be established by the owner using [the publishing guide](GITHUB-PAGES.md). An earlier Sites project was registered, but the site was never published there. No previous hosting credentials or Git remote are needed.

## Content and design decisions

The original 30-page presentation is in `../reference/Portfolio_Original_2026.pdf` in the handover bundle. Keep it outside the public repository. It is the source for professional claims and artwork. Its older headline said over 14 years. The website uses Toni’s requested 15+. Escape Velocity Entertainment was the latest role in the deck. The site describes UE5 ability work without asserting present employment. Confirm changes with Toni before updating that claim.

The first three featured case studies cover Rainbow Six Siege, United 1944, and Assassin’s Creed Chronicles. The archive also covers Madden NFL 21 & PGA Tour, Hazel Dazzle, and Burning Thirst. Preserve the distinction between Toni’s contributions and team outcomes. For example, the Tachanka design and full prototype were approved before Toni left Ubisoft, and the rework shipped afterward. The PDF’s video captions had no usable links.

Keep the game design fieldbook direction: warm paper, dark ink, orange accents, oversized headings, small numbered captions, and real project imagery. The workshop uses diagrams to distinguish spatial design from mechanics. Those diagrams are illustrations rather than portfolio entries.

## Where to make a change

| File | Responsibility |
| --- | --- |
| `dist/content.json` | Profile text, contact information, ordered professional projects, and prototype records. The first three professional entries are featured. |
| `dist/index.html` | Page metadata, header, navigation, fallback content, and footer. The navigation’s project count is currently literal. |
| `dist/app.js` | Hash routing, page rendering, featured Siege hero, career rows, expertise, workshop empty states, and media players. Some profile copy and featured project links are literal here. |
| `dist/styles.css` | Typography, colors, responsive layouts, mobile menu, and reduced-motion treatment. |
| `dist/assets/` | Optimized project artwork, screenshots, and favicon. |
| `scripts/studio.html` | Browser form for local authoring and media uploads, plus a JSON editor for professional content. |
| `scripts/server.mjs` | Loopback preview server, local write endpoints, upload handling, and one-generation JSON backup. |
| `scripts/check.mjs` | Checks IDs, selected local asset references, content parsing, and JavaScript syntax. |
| `.github/workflows/pages.yml` | Checks the project and deploys only `dist/` on pushes to `main` or a manual run. |

Professional URLs use `#project/<id>`. Workshop categories use `#lab/level-design` and `#lab/game-design`. Visible experiments use `#prototype/<id>`. Preserve existing IDs so recruiter bookmarks keep working. The empty category pages link to the Chronicles and Siege case studies. Update those links if you replace either project.

A prototype record uses `id`, `title`, `category`, `summary`, and `published`. The editor supports optional `role`, `format`, `notes`, `image`, `imageAlt`, `video`, `videoUrl`, `playableUrl`, `controls`, `embed`, and `download`. Store local asset paths relative to `dist/`, such as `uploads/cover.webp`. A leading slash would resolve to the account domain root on a GitHub project site.

## Resume and verify

1. Work from this repository root. Run `npm run check` and `npm run dev`. Visit the homepage and `/studio` using the server’s printed address.
2. For content changes, inspect a project deep link and its artwork. For workshop changes, check both categories and the related-work links. For layout changes, check a desktop and a narrow mobile viewport, menu, and keyboard focus.
3. Test writes in a disposable copy of the project if needed. Save then reopen an entry, verify its cover and category, and confirm drafts stay out of the visitor navigation.
4. After a push, verify the Pages workflow and open the deployed homepage and a deep link in a signed-out browser. The local editor and its write endpoints require Node and are intentionally local.

The original site was reviewed on desktop and mobile. A local editor draft save and cover upload were exercised, then the test content was removed. There are six professional stories, zero prototype entries, and no supplied playable build or video to test end to end. GitHub deployment is the outstanding external verification.
