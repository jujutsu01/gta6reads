# Implementation ledger

## Implemented

- Workspace structure, Node 26 pin, workspaces and dependency manifest.
- Versioned schemas and discovery for posts, categories, characters, media, site settings, release settings and redirects.
- HTML source parsing, metadata-free draft inference, category discovery, route collision checks, HTML sanitization and bounded content paths.
- Atomic post saves, revision conflict handling, trash and restore source operations.
- Initial category and site/release settings files; source-backed character records and copied local originals with provenance metadata.

## Pending

- Provenance-aware public image derivatives and character profile pages.
- Astro public site, local CMS UI/service, preview, map editor/routing, backups and public-only publication pipeline.
- GitHub repository, domain and Cloudflare connection supplied by owner when publishing is requested.
- Curated road data; the downloaded community raster alone is not a routing graph.

## Unverified

- No lint, build, tests, typecheck, preview or validation commands were run, per owner instruction.
