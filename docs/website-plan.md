# Public GTA VI website specification

Parent specification: [../plan.md](../plan.md). Execution instructions: [../agent-inc.md](../agent-inc.md).

## 1. Visual direction

Create a distinctive editorial GTA VI fan site: Vice City sunsets, tropical coastlines, night streets, bold typography, and official character artwork. Use an original composition, navigation, and site identity rather than presenting the site as Rockstar's official website.

### Design tokens

| Token | Value | Application |
| --- | --- | --- |
| Background | `#080B18` | Main midnight surface |
| Raised surface | `#14182B` | Cards, menus, panels |
| Secondary surface | `#1D2140` | Selected controls and feature sections |
| Main text | `#F7F3F1` | Body and headings |
| Muted text | `#B9BBCD` | Dates, descriptions, secondary labels |
| Sunset pink | `#FF5DA2` | Category accents and primary actions with dark text |
| Peach | `#FFC58F` | Countdown numbers and warm highlights |
| Coastal cyan | `#58E1E8` | Focus accents and primary map route |
| Violet | `#9D83FF` | Secondary accent |
| Border | `rgba(255,255,255,0.12)` | Card and divider boundaries |

Use a locally served, licensed condensed display face such as Bebas Neue for major headings and Inter for reading/interface text; record font licenses when downloading them during implementation. Do not copy proprietary GTA font files. Body text is 17-18px with approximately 1.65 line height; article measure is 68-75 characters. Display headings scale through `clamp()` instead of fixed mobile sizes.

Desktop content max-width: 1280px. Article body max-width: 780px. Gutters: 20px mobile, 32px tablet, 48px desktop. Layout breakpoints: 640px, 960px, 1280px. Use a consistent 8px spacing scale and 12-16px card corners. Keep gradients around artwork and feature areas; reading surfaces stay calm and high contrast.

### Image and motion treatment

- Use the downloaded reference artwork identified in [sources-and-assets.md](sources-and-assets.md).
- Homepage hero uses landscape Jason/Lucia art, an intentional crop, and dark gradients for readable text. Mobile can use a CMS-selected alternative crop.
- Character cards preserve faces and important composition through editable focal points; landscape-only group art may use a landscape card instead of a destructive portrait crop.
- Render responsive AVIF/WebP derivatives with a suitable fallback, explicit dimensions, captions/credits where useful, and meaningful alt text.
- Only the first hero image is eager-loaded. Other artwork loads lazily. No autoplay trailer or looping background video in v1.
- Small hover shifts and 150-250ms transitions are allowed. Honor reduced-motion settings and avoid scroll hijacking, flashing neon, or mandatory animation.

## 2. Shared shell

Header: original site wordmark on the left, main navigation, search control, and compact mobile menu. Navigation labels are Home, Gameplay, News, Characters, Updates, Countdown, Map. Keep Map visibly accessible on mobile. On desktop use a restrained translucent dark header over the hero, then a solid readable background when sticky.

Menus, order, destinations, social links, logo, and footer copy are CMS-managed. Additional discovered categories appear in an overflow menu when they no longer fit. Preserve visible focus indicators, keyboard navigation, Escape dismissal, correct expanded states, and a skip-to-content link.

Footer: category links, Countdown, Map, About, Privacy, Credits, social links if configured, and a brief independent fan-site attribution. Do not invent contact addresses, social accounts, legal ownership details, or newsletter signup behavior.

## 3. Homepage layout

1. **Cinematic hero:** prominent GTA 6 heading/site headline, concise owner-editable introduction, official Jason/Lucia image, CTA to Countdown, CTA to Explore Map. Desktop hero around 620-760px tall; mobile text and countdown remain visible without requiring an oversized image.
2. **Countdown strip:** days, hours, minutes, seconds; release date and timing interpretation; link to the dedicated countdown page. Peach digits and pink separators on a dark panel.
3. **Latest coverage:** one lead editorial card plus smaller cards; each shows category, image, title, real publication date, and excerpt.
4. **Section coverage:** Gameplay, News, and Updates blocks with recent published posts and archive links. Hide empty post grids instead of creating fake stories.
5. **Meet the characters:** Jason/Lucia lead cards and supporting character cards; link to the full directory. Every card opens its own profile.
6. **Explore Leonida:** panoramic place artwork or a licensed static map preview, explanatory text, and map CTA. Do not initialize the full interactive map here.
7. **Recent changes:** latest real update posts, followed by the shared footer. Avoid duplicating the same story repeatedly if inventory is small.

The CMS controls hero art/crop, headlines, featured post IDs, section order, visibility, card limits, and countdown/map placement. It uses fixed high-quality section templates rather than arbitrary executable HTML widgets.

## 4. Categories and articles

Gameplay, News, Characters, and Updates are the initial content categories. Folder discovery can add more. Use archive introductions managed in the CMS and 12 posts per page, newest publication first with stable slug/ID ordering for equal timestamps.

Characters is special: `/characters/` primarily lists profiles; `/characters/articles/` lists editorial character posts. A character post becomes `/characters/articles/{slug}/`, while a profile becomes `/characters/{slug}/`.

Article template: breadcrumb, category, one H1, optional deck/excerpt, author, publication and meaningful modification dates, featured image, reading column, optional heading-derived table of contents, media/captions, source links, related posts, and links to associated characters. Related content uses CMS selections first, then shared category/tag matches with deterministic ordering.

All headings, article body, category links, pagination links, and related content must be in generated HTML. Search and map interactivity may require JavaScript; ordinary reading must not. Imports containing a full HTML document contribute approved body content to the shared template, not a replacement site header or arbitrary scripts.

Custom standalone pages use the same shell. A genuine `404.html` page contains useful navigation and is excluded from sitemaps. Do not add a SPA rewrite that serves a 200 homepage for unknown URLs.

## 5. Character directory and dedicated profiles

### Directory

- Show all published character records with name, image, short role/summary, and a detail-page link.
- Put protagonists first; then supporting individuals and groups in CMS-controlled order.
- Optional filters: protagonists, supporting characters, groups. Browser filtering does not create indexable duplicate URLs.
- Show recent character-related articles beneath the directory.
- Records without verified artwork remain draft until suitable media is selected; do not fabricate a person's portrait.

### Initial source-backed profile subjects

Rockstar's People & Places page supplies the following profile subjects. The seed set must be refreshed against that source during implementation, not treated as a permanently exhaustive cast list. Source: [Only in Leonida](https://www.rockstargames.com/VI/only-in-leonida).

| Subject | Profile URL | Image/reference handling |
| --- | --- | --- |
| Jason Duval | `/characters/jason-duval/` | Dedicated downloaded portrait |
| Lucia Caminos | `/characters/lucia-caminos/` | Dedicated downloaded portrait |
| Cal Hampton | `/characters/cal-hampton/` | Official downloaded artwork |
| Boobie Ike | `/characters/boobie-ike/` | Official downloaded artwork |
| Dre'Quan Priest | `/characters/drequan-priest/` | Official downloaded artwork |
| Real Dimez | `/characters/real-dimez/` | Group profile and group artwork |
| Raul Bautista | `/characters/raul-bautista/` | Official downloaded artwork |
| Brian Heder | `/characters/brian-heder/` | Official downloaded artwork |
| Bae-Luxe | `/characters/bae-luxe/` | Individual profile linked to Real Dimez; shared group image explicitly captioned |
| Roxy | `/characters/roxy/` | Individual profile linked to Real Dimez; shared group image explicitly captioned |

The last two entries make the duo's members separately discoverable, using only individually supported facts. Do not duplicate the entire group biography on both member pages. Additional named people can be added through the CMS when enough source-backed information exists.

### Profile content and layout

Desktop: large artwork/title masthead followed by biography on the left and a compact facts panel on the right. Mobile: artwork, name, role, facts, biography, and related sections in a readable single column.

Required authoring fields: stable ID, slug, display name, person/group type, role category, short summary, original biography, primary image, source links, publication state, sort order, created/modified timestamps, and SEO overrides. Optional fields: aliases, known location, affiliations, relationships, group members, gallery, related posts, and sourced actor information.

Profiles display known background, story role, personality where supported, relationships with links to other profiles, associated places where positioned, approved gallery, sources, and last substantive update. Do not invent age, birth date, voice actor, full plot, missions, or exact residence. Omit unsupported fields. A place can be mentioned in text without manufacturing coordinates for a map link.

Use original editorial summaries; attribution does not authorize copying long official biographies. Any speculative material must be explicitly separated and labeled, and is off by default for initial profile creation.

## 6. GTA 6 Countdown

Use one shared release-settings record for the homepage widget and `/gta-6-countdown/`. The dedicated page includes the large countdown, source link, release date, timing explanation, configured platforms only when verified, and relevant update posts.

The official release date found during research is 19 November 2026; the linked Rockstar support page states midnight local time. Store `date = 2026-11-19`, `mode = viewer-local-midnight`, source URL, and research date. Label it **Midnight in your device's time zone**; this is not an inferred universal UTC launch instant. Source: [Rockstar regional release timing](https://support.rockstargames.com/articles/29jV3Cv2cCgvwM1XgtMO5o/grand-theft-auto-vi-regional-pre-load-and-release-times-on-playstation-5-and-xbox-series-x-or-s).

- Construct the target from local calendar components; do not parse a date-only ISO string as UTC and accidentally shift the target.
- Also support a CMS-selected fixed UTC instant or a named reference timezone for future official timing changes; show the selected basis visibly.
- Display the static date and explanation in HTML before JavaScript starts. Update numbers from the current clock, never by subtracting one second from old counters.
- Recompute on tab visibility changes; avoid negative values and layout shifts. Device-clock accuracy remains a limitation.
- At zero, show **Release countdown complete**. Only show an explicit available-now announcement if the owner sets the release status accordingly.
- No calendar export, notifications, or reminders in v1.

## 7. GTA 6 Map page

Follow [map-plan.md](map-plan.md) for implementation. This page has a real H1 and readable introductory/map-data text before the interactive canvas. The map fills the available viewport below the header without trapping normal page navigation.

Desktop: 320px control panel at the left, map at the right, compact legend and attribution. Mobile: full-width map, compact A/B summary, bottom-sheet controls, large touch targets. Provide accessible place and route-result lists alongside map interaction.

Visual language: A pin in pink, B pin in peach, shortest route in bright cyan with a dark casing, other candidate roads in subdued violet, selectable alternatives in thinner peach lines. Stroke widths and labels distinguish states without relying only on color.

Show the selected dataset's **Community reconstruction**, **Partial road coverage**, or **Verified coverage** state and its actual source date. These are useful accuracy information for people deciding whether to trust a route, not developer diagnostics.

## 8. SEO and performance behavior

- Generate title, description, absolute canonical, robots directive, Open Graph, and social card metadata for each published page.
- Defaults come from the real title/excerpt and site settings; overrides are editable. Character metadata must be profile-specific.
- Use Organization/WebSite for site identity, Article or NewsArticle for editorial posts as appropriate, BreadcrumbList, and ProfilePage with Person or Organization for individual/group character profiles. Never invent ratings or FAQ answers to obtain rich results.
- Escape JSON-LD safely and ensure its facts match visible content.
- Generate `sitemap.xml` and split it if actual inventory requires it, plus `rss.xml` and `robots.txt`. Include only canonical, indexable, published pages; exclude empty archives and `/search/`.
- Each archive pagination page has its own canonical. Personal map hashes and search/filter states do not create sitemap entries.
- Maintain explicit 301 mappings for changed published routes. Avoid redirect loops and broad catch-alls. Deleted content without a replacement gets a real 404.
- Put the actual domain in one setting. Public production export requires it; local preview may use local URLs but must never be pushed as production metadata.
- Serve optimized images with width/height and `srcset`; self-host fonts; reserve image dimensions; defer map and search data; use browser bundles only on pages that need them.
- Use static accessible HTML for core content. No requirement to put the whole public website behind React hydration.
- Analytics, advertising, embeds, and cookie-dependent integrations are off by default. External videos use a click-to-load component if later enabled.

## 9. Later acceptance scenarios

Record these for the owner's requested verification pass; do not run them automatically.

- Home, archives, articles, character profiles, countdown, map, search, and 404 render at 360px, 768px, and 1440px widths.
- Keyboard users can operate menus, search, profile filters, map control forms, and fullscreen exit.
- Each published character appears once in the directory and resolves to its dedicated profile; individual/group relationships link correctly.
- Artwork has sensible crops and no unrelated character or game substitutions.
- Countdown behavior covers date changes, zero, tab resume, device timezone, and no-JavaScript output.
- SEO output excludes drafts and private data, uses the configured domain, and follows actual visible content.
- Ordinary pages do not download map tiles, graph JSON, or the routing worker.
