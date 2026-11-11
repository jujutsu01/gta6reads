# Research sources and downloaded visual references

Planning documents prepared 12 November 2026, Asia/Karachi. Research and reference acquisition took place on 11 November 2026. Live release information, cast details and source-data versions should be refreshed when implementation begins.

## 1. Official GTA VI sources

| Source | Use in this plan |
| --- | --- |
| [Rockstar GTA VI](https://www.rockstargames.com/VI) | Official game identity, release-date reference, imagery and navigation to source material |
| [Only in Leonida](https://www.rockstargames.com/VI/only-in-leonida) | Named character profile subjects, group/member references and character imagery |
| [Artwork and wallpapers](https://www.rockstargames.com/VI/media/artwork-wallpapers) | Downloaded promotional artwork and character/place illustrations |
| [Release-date announcement](https://www.rockstargames.com/newswire/article/ak3ak31a49a221/grand-theft-auto-vi-is-now-set-to-launch-november-19-2026) | Announcement source for the release-date record |
| [Regional release timing](https://support.rockstargames.com/articles/29jV3Cv2cCgvwM1XgtMO5o/grand-theft-auto-vi-regional-pre-load-and-release-times-on-playstation-5-and-xbox-series-x-or-s) | Midnight-local timing used for the initial countdown interpretation |

The official sources currently support a 19 November 2026 release date. The support page states midnight local time. Treat these as dated source evidence, not an unchangeable constant or a reason to invent one universal UTC launch instant.

The character seed set comes from official profile subjects. Original summaries should be written during implementation; do not copy long biographies from source pages. Optional facts such as age, actor or precise residence need their own evidence and may remain omitted.

## 2. Downloaded official images

These 14 image files are stored in `references/images/`. Full direct URLs, source pages, retrieval times, reported content types and byte counts are recorded in [../references/image-sources.json](../references/image-sources.json).

| File | Intended application |
| --- | --- |
| `hero-jason-lucia.jpg` | Primary landscape homepage hero |
| `hero-rooftop.jpg` | Alternative landscape hero/feature illustration |
| `jason-duval.jpg` | Jason profile and directory card |
| `lucia-caminos.jpg` | Lucia profile and directory card |
| `cal-hampton.jpg` | Cal profile/card artwork |
| `boobie-ike.jpg` | Boobie profile/card artwork |
| `drequan-priest.jpg` | Dre'Quan profile/card artwork |
| `real-dimez.jpg` | Real Dimez group artwork; clearly captioned shared art for member profiles |
| `raul-bautista.jpg` | Raul profile/card artwork |
| `brian-heder.jpg` | Brian profile/card artwork |
| `vice-city.jpg` | Place feature or map introduction |
| `leonida-keys.jpg` | Place feature or related-content illustration |
| `grassrivers.jpg` | Place feature or related-content illustration |
| `gta-vi-logo.png` | Official game logo reference; separate from the site's own identity |

Files were obtained from Rockstar's public media URLs. They remain Rockstar/Take-Two promotional media; this project does not assert a blanket redistribution license or that downloading transfers ownership. Preserve source attribution and use them appropriately for the independent fan site's editorial presentation.

Reference downloads are not optimized production assets. During implementation, import selected files into the local media library, preserve originals locally, choose crops/focal points, and export only the public derivatives actually used. Do not hotlink the website's images to the source server or publish the entire references directory.

No images were generated, altered or substituted during this planning task. No browser layout or image-render verification was requested or performed.

## 3. Downloaded community map reference

Reference asset: [../references/maps/community-leonida-basemap.webp](../references/maps/community-leonida-basemap.webp).

Source manifest: [../references/maps/map-source.json](../references/maps/map-source.json).

- Repository: [navanem/gta6-leonida-atlas](https://github.com/navanem/gta6-leonida-atlas).
- Pinned revision: `83cf9870aa64a2b1b66939e2a49aeb36ac3a4158`.
- Upstream asset: `public/assets/gta6-leonida-atlas/basemap.webp`.
- [Pinned source notices](https://github.com/navanem/gta6-leonida-atlas/blob/83cf9870aa64a2b1b66939e2a49aeb36ac3a4158/THIRD_PARTY_LICENSES.md).
- The project describes a community reconstruction and separates its AGPL application code from GTADB-derived data/cartographic material under stated CC BY 4.0 attribution terms. No application code was copied here.
- This file is a planning reference. Preserve the asset-specific credit chain when selecting the production basemap. A code license is not automatically a license for unrelated screenshots, art or photographs.
- It is not official road geometry, is not guaranteed complete, and is not a road graph. It does not by itself enable directions.

### Additional map-data sources examined

| Source | Finding relevant to implementation |
| --- | --- |
| [GTADB repository](https://github.com/rolux/gtadb.org) | Community landmark/map source; states MIT for code and CC BY 4.0 for data, with contributor attribution; recommends repository downloads instead of hotlinking live assets |
| [Original gta6map project](https://github.com/gta6map/gta6map.github.io) | Landmark/tiles reference; its readme states public-domain reuse, but it should not be assumed to supply complete game road geometry |
| [FullSweep developer documentation](https://fullsweepmap.com/developers/) | Publishes source-labeled locations/landmarks; explicitly distinguishes the data license from map-artwork rights and uses its own basemap pixel frame |

No complete authoritative GTA VI road graph was established by this research. These are input candidates, not a claim that all their records are ready to merge or that routing accuracy has been verified. Do not combine their positions without a coordinate transform and source/accuracy mapping. See [map-plan.md](map-plan.md) for the precise data dependency.

## 4. Primary technical references

| Source | Planning decision supported |
| --- | --- |
| [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/) | Push-triggered public deployment |
| [Cloudflare build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/) | Separate repository root/output directory configuration |
| [Cloudflare static HTML deployment](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/) | Hosting already-generated static output |
| [Cloudflare redirects](https://developers.cloudflare.com/pages/configuration/redirects/) | Generated `_redirects` with explicit route mappings |
| [Astro routing](https://docs.astro.build/en/guides/routing/) | Generated static routes and archives |
| [TipTap overview](https://tiptap.dev/docs/editor/getting-started/overview) | Custom local rich-text editor using open-source extensions |
| [Leaflet simple maps](https://leafletjs.com/examples-v1/crs-simple/crs-simple.html) | Fictional image-map coordinate system |
| [Leaflet reference](https://leafletjs.com/reference) | Map layers, controls and polyline rendering |

Select supported stable dependency versions at implementation time. Documentation may expose beta APIs, so the implementation must match the actually installed major version rather than copying tutorial imports blindly.

## 5. Acquisition versus verification

Source pages were read and reference files downloaded for planning. No website implementation, CMS initialization, routing graph generation, account connection, Git push, Cloudflare deployment, lint, build, test, typecheck, preview or project-validation pass was performed.

Future source refresh and actual production checks are separate actions, subject to the owner's instructions. Do not describe these references as a finished GTA VI interactive map or a deployed website.
