# Local CMS and public publishing specification

Parent specification: [../plan.md](../plan.md). Public design: [website-plan.md](website-plan.md). Map editing: [map-plan.md](map-plan.md).

## 1. Operating model

Provide a local browser application at `http://127.0.0.1:4310`. A Fastify service reads/writes the owner's authoring files and orchestrates public exports. React supplies the dashboard/editor. No local CMS endpoint, login, server executable, draft storage, or credential file is deployed to Cloudflare.

Use source files as the authoritative content store; do not require MySQL, a remote CMS subscription, or a public API. An in-memory catalog and rebuildable local index are acceptable accelerators. Closing the CMS must not erase content. Keep portable authoring data in `content/`, operational state in `.local/`, and versioned backups in `backups/`.

Publishing is explicit. Autosave changes local content only. There is no background auto-push, automatic scheduled publishing while the computer is off, or promise that changing a folder alone updates the live site.

## 2. CMS interface and navigation

Use a compact charcoal interface with a 240px sidebar, top context bar, breadcrumb/title, search, and primary action. Carry pink/cyan GTA VI accents through active items and actions while keeping the editor easy to read. On small screens the sidebar becomes a drawer and the inspector becomes a collapsible panel.

| Screen | Required controls and information |
| --- | --- |
| Dashboard | Content counts, recent edits, draft shortcuts, current release setting, last push, deployment status if connected |
| Posts | Title/category/state/date filters, create, duplicate as draft, edit, move category, trash, restore |
| Categories | Initial four categories, discovered folders, name, description, cover, order, SEO, slug changes |
| Characters | Individual/group records, image, directory order, bio, facts, relationships, members, sources, related posts |
| Pages | Standalone pages and information-page content; reserved functional routes identified clearly |
| Media | Upload, thumbnail grid, search, alt text, caption, credit/source, focal point, usage list |
| Homepage | Hero, imagery, feature selections, section ordering, visibility and item limits |
| Navigation | Header/footer links, order, social URLs, new-category overflow handling |
| Countdown | Date, timing mode, reference zone/UTC when needed, source URL, visible release status |
| Map | Dataset selection, basemap, POIs, categories, graph import/editing, road access, attribution, coverage |
| SEO | Site defaults, per-record missing fields, sitemap inclusion, social defaults, redirects, author identity |
| Settings | Site identity, public domain, local paths, Git remote/branch, optional read-only Cloudflare status connection |
| Revisions/backups | Restore content revisions, export a portable backup, restore with a change summary |
| Publish | Pending public changes, export/commit/push states, retry, errors, commit ID, deployment link/status |

Do not add a plugin marketplace, a theme marketplace, multi-user permissions, comments, newsletter services, or arbitrary executable widget panels in v1.

## 3. Post editor

The central editor contains title, optional excerpt, and TipTap body editing. The inspector contains category, tags, author, featured image, publication state/date, related characters/posts, SEO overrides, and advanced URL controls. A clear status strip shows local save state and whether changes have been published.

Support paragraphs; headings H2-H4; bold/italic; links; lists; blockquotes; separators; images with captions/alt text; simple tables; and code blocks. H1 is the page title. Add an HTML source mode with sanitization feedback. Use only open-source editor extensions, with no external document sync.

Autosave after approximately one second of idle time, show Saved only after a successful disk write, and retain an unsaved buffer until acknowledged. Protect navigation away from unsaved changes. Revisions support restoration after accidental edits. Do not silently remove unsupported imported markup when entering the rich-text editor: identify it and let the owner retain a sanitized source-mode version.

External file edits are first-class: compare a record's revision before save. If another editor or disk change has advanced it, return a conflict and provide reload, compare, or save-as-copy. Never overwrite newer work automatically.

## 4. Canonical content files and discovery

### Category HTML files

The default source is one body HTML file per post, with a JSON metadata header:

```html
---
{
  "schemaVersion": 1,
  "id": "example-stable-record-id",
  "title": "Example draft title",
  "status": "draft",
  "slug": "example-draft",
  "excerpt": "Owner-written summary.",
  "authorId": "site-editor",
  "publishedAt": null,
  "modifiedAt": "2026-11-12T00:00:00Z",
  "featuredImageId": null,
  "tags": [],
  "characterIds": [],
  "seo": {}
}
---
<p>Owner-written article body.</p>
<h2>Section heading</h2>
<p>Further content.</p>
```

Example location: `content/posts/news/example-draft.html`. Examples are documentation, not real news to seed into production. Real IDs should be generated UUIDs. Parse metadata as JSON, never executable JavaScript. The category is derived from the containing folder, preventing contradictory category names inside a file.

Discovery rules:

1. Inspect direct category folders beneath `content/posts/`; ignore hidden folders, temporary files, symlinks, and non-HTML files.
2. New category folders appear in the local catalog immediately. With published posts they generate their archive/navigation entry during export.
3. Category settings live at `content/categories/{slug}.json`; an undisclosed folder without settings uses a humanized display name until the owner saves explicit settings.
4. For a file without metadata, infer a candidate title from its H1/title and a candidate slug from its filename; import it as a draft. Require a real publication date before first publication.
5. To publish by files without using the editor, supply complete metadata with `status: published`, a stable ID, and `publishedAt`; the next explicit export discovers it automatically.
6. A full HTML document can be imported, but only approved body content and useful title/description metadata enter the shared site template. Do not import scripts, header/footer replacements, trackers, or arbitrary style sheets.
7. After a post is published, a category/file rename preserves its stable ID and creates an old-to-new route mapping. Duplicate IDs, duplicate routes, and reserved route collisions must be resolved before that snapshot can publish.

Draft and trash files must not enter generated public JSON, feeds, media lists, sitemaps, or HTML. Trash lives outside the scanned publication folders under `.local/trash/` and retains a restoration manifest. Hard deletion requires a deliberate owner action in the CMS; ordinary remove uses trash.

### Shared record contracts

| Entity | Essential fields |
| --- | --- |
| Post/Page | Schema version, stable ID, title, slug/path, body, state, author, timestamps, SEO, media/relationship references |
| Category | ID/slug, name, introduction, cover media ID, order, SEO overrides |
| Character | ID, slug, name, person/group, role, summary, bio, image, optional facts, relationships/members, sources, state, timestamps, SEO |
| Media | ID, original relative path, MIME type, dimensions, alt/caption/credit, source URL, focal point, generated derivative metadata |
| Site settings | Site name, real public URL, locale, logo/social image IDs, author records, footer content |
| Homepage | Ordered supported section configurations and referenced record/media IDs |
| Navigation | Named menus with internal route references or explicit external URLs |
| Release settings | Date or UTC instant, timing mode, optional reference IANA zone, source, checked date, announcement state |
| Redirect | Old public pathname, new public pathname, 301 status, stable source-record ID where applicable |
| Map dataset | Versioned manifest, coordinate metadata, attribution, places, nodes/edges, source/accuracy/coverage information |

Use explicit versioned JSON schemas and migration functions for local file formats. Do not leak source paths, owner notes, local status records, raw revision history, or credential metadata into public representations. Arrays reference stable IDs, not display names.

### Publishing dates

Preserve `publishedAt` after initial publication. Change `modifiedAt` only after a substantive saved edit. A rebuild alone does not modify dates. Store timestamps in ISO 8601 with an offset or UTC. UI formatting may use the owner's configured timezone. Timed future publication is out of scope: keep future posts as drafts until the owner publishes them.

## 5. Local service interfaces

All endpoints below are loopback-only local APIs, not public website APIs. Keep request/response types in `packages/contracts`.

| Method and endpoint | Contract |
| --- | --- |
| `GET /api/catalog` | Read summaries for post, page, category, character and media records; filter/page locally |
| `GET /api/records/:type/:id` | Full authoring record and revision |
| `POST /api/records/:type` | Create a record; server assigns ID, canonical path and revision |
| `PUT /api/records/:type/:id` | Save editable fields with `expectedRevision`; conflict returns 409 |
| `POST /api/records/:type/:id/trash` | Move to local trash; do not delete unrelated referenced assets |
| `POST /api/trash/:id/restore` | Restore or report a filename/route collision |
| `POST /api/import/html` | Import provided HTML as a draft with sanitization summary |
| `POST /api/media` | Bounded image upload, source metadata and original storage |
| `GET/PUT /api/settings/:section` | Section-specific editable settings, excluding credential values in responses |
| `GET/PUT /api/maps/:datasetId` | Versioned dataset metadata and bounded editing operations |
| `POST /api/maps/:datasetId/import` | Import a versioned graph/place package with a change summary |
| `POST /api/preview` | Generate an isolated local preview snapshot and return its read-only URL |
| `POST /api/publish` | Start a single serialized publication job; return job ID |
| `GET /api/jobs/:id` | Current export/commit/push/deployment state and concise errors |
| `POST /api/jobs/:id/retry` | Resume safely from the appropriate failed stage |
| `POST /api/backups` | Create portable authoring backup and return local artifact path |
| `POST /api/backups/restore` | Stage backup restore, show changes, apply explicit restore action |

Use a common success envelope with `data` and `revision` where applicable; failures carry `error.code`, a user-facing `message`, and bounded field errors. Never return raw environment variables, complete process stderr containing secrets, or arbitrary server stack traces to the UI. Long operations return jobs rather than hanging request handlers. Poll job state in v1; SSE is unnecessary.

## 6. Local API and file safety

- Bind to the exact loopback address, not `0.0.0.0`. Keep a strict Host/Origin allowlist and same-origin API policy.
- Establish a randomly generated local session capability at startup, exchange it for a local session, and require a CSRF/session token for writes. Do not put it in public exports or verbose request logs.
- Local preview is a separate origin, read-only, with a restrictive policy; imported article HTML must not gain access to CMS write APIs.
- Resolve file operations under known workspace/content roots. Reject traversal, absolute client-supplied paths, symlink escapes, Windows junction escapes, and malformed archive entries.
- Use atomic temp-write/replace and per-record write serialization. Use a global lock for export/publish so two jobs cannot overwrite the same output.
- Sanitize stored/output HTML using a maintained allowlist: no script execution, inline event handlers, unsafe URLs, arbitrary iframe hosts, or injected page-level styles. Extract metadata before sanitizing the body.
- Accept bounded raster image uploads and generated derivative formats. Do not accept executable SVG uploads without a dedicated sanitizer; reject them in v1.
- Execute Git and image tools with argument arrays and a fixed working directory, never through interpolated shell commands.
- Keep credentials in the operating system's existing credential mechanism when possible. If an optional service token is needed, store it locally outside content and exports, with masked UI display and no output logs.

These are application requirements, not a new approval process for routine local work.

## 7. Media workflow

Import selected images from `references/images/` into the CMS library when building the application. Copy provenance from `references/image-sources.json`. Reference files stay untouched; the CMS library owns editable metadata and any derived outputs.

Upload originals locally, generate stable media IDs, detect dimensions, and let the owner enter alt text, captions, source credit and focal point. Show where an image is used before allowing removal. Preserve shared media still referenced by another record.

At public export, generate only referenced assets at useful widths such as 480, 768, 1280, and 1920, capped by the original dimensions. Keep original downloads, unused drafts, internal thumbnails and media metadata private. A gallery uses approved public derivatives, not a raw directory listing. Deduplicate byte-identical public assets.

## 8. Public export and Git publication

### Export snapshot

Take a coherent immutable source snapshot at job start. Autosaves after that point belong to the next publication. Read eligible published records, resolve referenced content, render Astro pages and public browser data, generate optimized assets and SEO files, and stage the finished site under a new `.local/jobs/{id}/site/` directory.

The exporter must enforce content/schema integrity and its public-only allowlist as part of normal application behavior. This does not authorize an agent to run extra development tests, builds or verification commands contrary to the owner's instruction.

Public output may contain:

- HTML documents and generated CSS/JavaScript needed by the public site.
- Referenced optimized media and map tiles/graphs/places intended for visitors.
- Public search JSON, RSS, XML sitemaps, robots.txt, favicon, `_headers` and `_redirects`.
- A small public publication marker with job/commit linkage and content snapshot timestamp, without local paths or owner data.

It must not contain `apps/`, `packages/`, `content/`, `references/`, `.local/`, `backups/`, source front matter, plan documents, environment files, source maps, CMS bundles, raw originals, draft content, `.git` files, `functions/`, or `_worker.js`.

### Git operation

1. Confirm the configured publishing directory is the dedicated repository at `E:\gta6\publish`, never the parent source workspace.
2. Preserve the previous generated snapshot and managed-file manifest for recovery. Reconcile only managed paths under `publish/site/`; do not recursively delete the repository or touch `.git`.
3. Refuse to overwrite unexpected unmanaged files; show the owner the conflict. Serialize all writes and retain a recoverable snapshot if synchronization fails.
4. Stage only the `site/` path, commit with an owner-editable message, and push to the configured remote/branch without force.
5. If the snapshot has no public change, show No public changes rather than making an empty commit.
6. On a non-fast-forward push, keep the local snapshot and report the divergence. Do not auto-rebase conflicting generated histories or force-push.
7. Preserve a created commit if the network/authentication fails. Retry that push instead of generating duplicate commits. Reset or history rewriting is never automatic.

### Publication states

Use `queued -> exporting -> ready -> committing -> pushing -> pushed`. Failure records the stage and offers retry. Deployment is a separate state: `unknown`, `building`, `live`, or `failed`, associated with the pushed commit.

Cloudflare Git integration handles deployment after push. The local application can optionally read deployment status using a locally stored read-only token scoped to the project. If not connected, show **Pushed; deployment status unavailable** and a Cloudflare dashboard link. Do not call a successful push a successful live deployment.

Cloudflare project settings: publishing-repo root, production branch `main`, build command `exit 0`, output directory `site`. Use no public CMS backend, Pages Functions, or database bindings for v1. See [Cloudflare static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/) and [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/).

## 9. Backups, restore and deletion

Provide a portable ZIP backup of canonical content, originals, settings, map source data and a schema-version manifest. Exclude credentials, node_modules, build caches, Git internals and transient jobs. Optional encrypted secret transfer is outside v1; reconnect credentials on a new machine.

Take a local revision before overwriting a record; retain the latest 50 revisions per record by default. Before an explicit bulk restore or destructive map import, create a timestamped authoring backup. Never silently delete an owner's standalone backup to satisfy a retention policy.

Restore into staging first, reject unsafe paths/versions, present merge/replace effects, then apply the owner's selected restore with rollback data. Git history recovers published snapshots, but it does not back up local drafts, original assets, unpublished settings, or CMS code.

Unpublishing removes a route on the next publish and updates all generated listings. If a replacement exists, allow an explicit 301 redirect. Otherwise serve the real not-found page. Do not silently redirect all deleted posts to the homepage.

## 10. Commands to implement and document later

| Command | Intended action |
| --- | --- |
| `npm run cms` | Start the local CMS and loopback service |
| `npm run export:site` | Generate a public snapshot without Git push |
| `npm run publish:site` | Use the same export/commit/push pipeline as the CMS |
| `npm run backup:content` | Write a portable backup artifact |
| `npm run restore:content -- <backup>` | Start the explicit staged restoration flow |

Provide a Windows `start-cms.ps1` convenience launcher. Opening the local browser is optional and must not expose the server on the LAN. Use one documented installation path and a lockfile. These commands are planned interfaces; none are created or executed by this planning task.

## 11. Acceptance cases to retain for later

- Discovery of all initial categories and a new category with and without settings metadata.
- Valid published HTML imports, metadata-free draft imports, duplicate IDs/routes, unsafe HTML, and external-save conflicts.
- Image upload, alt text/focal point changes, shared usage protection, and unused-draft exclusion.
- Character group/member relationships and related post references without broken public links.
- Release settings shared by both countdown displays.
- Snapshot consistency while editing, concurrent publish lock, no-change publishing, deletion reconciliation, and unmanaged-file protection.
- Git success, missing credentials, offline retry, divergent branch and deployment-status-unavailable states.
- Backup/restore of authoring content and map data without secret export or archive traversal.
- Public output contains no CMS code, local secrets, source content or draft-derived search/media data.

These are specifications for an authorized future verification pass; do not run checks during this documentation task.
