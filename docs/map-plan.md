# GTA VI interactive map and road-routing specification

Parent specification: [../plan.md](../plan.md). CMS integration: [cms-plan.md](cms-plan.md).

## 1. Required experience

At `/gta-6-map/`, a visitor explores a GTA VI map, searches places, drops a location pin, or enters directions mode and places **A: Start** and **B: Destination**. With both pins set, the site highlights roads between them, emphasizes the shortest drivable route, and allows other mapped route choices.

The entire public feature runs as static assets plus browser JavaScript. The local CMS is used to prepare the dataset, not to serve visitor requests. No Google routing API, real-world geocoding, paid directions service or GPS permission is required.

## 2. Source-data boundary

Four different inputs are needed and must not be confused:

| Input | Purpose | Current planning status |
| --- | --- | --- |
| Basemap raster/tiles | Visual coastline, streets and geography | Community reference downloaded |
| Places/POIs | Named map markers, categories and source evidence | Import/edit capability planned; no public POI dataset seeded in this task |
| Road graph | Connected road centerlines, intersections, access and directions | Not supplied by the downloaded raster; must be imported or curated |
| Distance calibration | Conversion from map units to metres | Unknown until a supported source is available |

Downloaded reference: `../references/maps/community-leonida-basemap.webp`. Its revision/provenance are recorded in `../references/maps/map-source.json`. It is a community reconstruction, not an official world map, authoritative in-game coordinates, or a complete navigation dataset.

The upstream GTADB project provides community map/data sources with stated attribution requirements; the related Leonida Atlas project describes approximate community positions. Neither a promotional screenshot nor a collection of landmark points is a complete road network. Sources: [GTADB repository](https://github.com/rolux/gtadb.org), [Leonida Atlas](https://github.com/navanem/gta6-leonida-atlas).

Default implementation path: use a permitted community reconstruction with visible attribution, import supported places, and curate connected roads using the local graph editor. Route results must carry the same community/partial-data qualification. Keep the importer replaceable so confirmed geometry can replace the reconstruction later.

Do not invent missing streets, connect nearby roads across water, use real Miami navigation as GTA VI navigation, copy GTA V geometry, or hide routing incompleteness behind a generated illustration. If the complete road dataset cannot be obtained, ship the independent site work and distinguish a working routing engine from incomplete map coverage.

## 3. Definition of all possible roads

The interface must preserve the requested all-road behavior without attempting to enumerate indefinitely looping journeys.

- **Shortest route:** the exact minimum summed road-length path through the available, accessible graph between the snapped A and B positions.
- **Other possible roads:** every accessible directed edge reachable from A whose far end can still reach B. These are roads on an A-to-B walk in the loaded graph; some may be detours or loops.
- **Alternative complete routes:** up to five distinct route choices in total, consisting of the shortest route and up to four additional choices.

Show the complete possible-road overlay by default when a route exists. Add a visible **Show other reachable roads** toggle to reduce clutter. Do not replace this overlay with only the five route choices. The layer is not limited to a hidden detour radius.

This definition deliberately does not claim that every highlighted edge belongs to a loop-free trip. In a strongly connected road network, much of the network can qualify, because a driver can take a detour and still reach B. Explain that briefly in the layer help text. Never describe five calculated paths as every possible route.

## 4. Visual map UI

Desktop: fixed-width 320px side panel with tabs **Explore** and **Directions**, occupying the left side below the site header. The remaining area is the map, with zoom/reset/fullscreen controls at the right, legend in a corner and attribution always reachable.

Mobile: full-width map, a compact A/B bar and floating tool buttons; a bottom sheet holds search, filters and routes. The sheet must not cover selected pins completely. Respect safe-area insets. Supply explicit zoom buttons and a fullscreen exit; avoid trapping page scroll unintentionally.

### Layers and styling

| Layer | Style and interaction |
| --- | --- |
| Basemap | Source art with modest contrast tuning; preserve its labels and attribution |
| All mapped roads | Muted neutral road lines when the road layer is enabled |
| Other reachable roads | Thin subdued violet, drawn above ordinary road lines |
| Alternative route choices | Thinner peach/orange lines with route labels |
| Shortest route | Bright cyan, roughly 6px stroke, dark casing and explicit Shortest label |
| A pin | Pink, letter A, accessible Start label |
| B pin | Peach, letter B, accessible Destination label |
| Ordinary POI/personal pin | Category icon and label, distinct from A/B |

Draw all-road layers first and the primary route last so overlapping roads cannot hide the shortest route. Line width/labels distinguish options independently of color. Selecting an alternate route opens its details and emphasizes it secondarily; the shortest route remains labeled and identifiable.

Route cards contain distance in supported units, relative extra distance, number of named road segments when available, and data status. Do not fabricate speed limits, travel times, live traffic, police presence or in-game turn instructions. Unknown road names use a neutral segment label.

## 5. Pin and directions interactions

### Explore mode

- Click/tap a place to open its name, category, optional image, sources, certainty and coordinates.
- Add a personal pin at a selected map point. Edit its name/note or remove it.
- Personal markers are saved only in the current browser/device and are not shared with other visitors or sent to the CMS.
- Offer Export pins and Import pins. Explain that browser data can be cleared; a share link is not a backup of private notes.
- Editorial POIs are managed locally through the CMS and published for all visitors.

### Directions mode

1. Activate Start or Destination, then click the map, select a POI, or enter coordinates in the dataset's displayed coordinate system.
2. If both fields are empty and neither is explicitly active, the first click sets A and the next sets B; afterward moving a point requires activating its field or dragging its marker.
3. Keep both pins draggable. Debounce route requests after movement, approximately 200ms; discard stale worker replies.
4. Allow swap A/B, clear either pin, clear both, fit route, and return to Explore.
5. A POI popover offers **Set as start** and **Set as destination**.
6. Compute routes after both points have valid graph snaps. Keep the original chosen pin positions visible and distinguish snapped access points.
7. If both points resolve to the same road position, show a zero-length result rather than manufacturing a loop.

Personal pins and A/B choices do not modify the public graph or create server files.

## 6. Coordinate model and dataset contracts

Use an explicit fictional coordinate frame, not Earth latitude/longitude. Canonical authoring coordinates are `{x, y}` in the original basemap frame, origin at the upper-left, x rightward and y downward. Width/height and coordinate-version ID belong to the dataset manifest.

For a raster of height H, the Leaflet adapter maps `{x, y}` to the simple-map coordinate pair `[H - y, x]`; its inverse is centralized. Other source coordinate systems need explicit import transforms with control points. Never paste a landmark dataset onto a differently cropped basemap just because both contain pixel coordinates.

Use Leaflet's stable simple-CRS capability for image/game maps and isolate its version-specific API in one adapter. Source: [Leaflet non-geographical maps](https://leafletjs.com/examples-v1/crs-simple/crs-simple.html).

### Canonical files

```text
content/maps/{dataset-id}/
  manifest.json
  basemap/                    source image or versioned tile files
  places.json
  nodes.json
  edges.json
  turn-restrictions.json      optional supported restrictions
  coverage.json              optional surveyed/routable coverage regions
```

| Contract | Required information |
| --- | --- |
| Manifest | Schema version, dataset ID/version, title, width/height, coordinate frame, basemap reference, source revision/URL, credits, data status, routing coverage, optional metres-per-unit |
| Place | Stable ID, name, category, optional `{x,y}` position, description, source URLs, evidence state, region/character references, public/draft state |
| Node | Stable ID, x/y, explicit connection/elevation layer where known |
| Edge | Stable ID, physical road ID, from/to node IDs, ordered centerline points, positive computed length, drive-access state, optional road name/class, evidence/source |
| Turn restriction | From-edge, via-node, to-edge and no-turn/only-turn rule, if supplied by the source |
| Coverage | Bounded region geometry, known completeness/uncertainty, survey date/source |

Represent two-way roads as two directed edges referencing the same physical road and opposite centerline order. Never infer an intersection from a drawing overlap: bridges, tunnels and separate levels connect only at explicit graph nodes. Closed or non-drivable edges are excluded from driving routes.

Positions can be null. An unpositioned source-backed place remains searchable in a list but has no marker and cannot be used as a route endpoint until positioned. Character relationship data does not imply a known exact location.

Generated public exports contain only approved public fields and published POIs. Keep internal curation notes, draft places and source working files local. Version graph, basemap, coordinates and places together so a cached old graph cannot silently route on new geometry.

## 7. Road graph preparation and local editor

The CMS Map screen provides a dataset list and an editor with basemap, POI and Road tools. A side inspector edits the selected record. Changes remain local until the normal website publication flow runs.

### Imports

- Import this project's versioned graph/POI JSON package.
- Support GeoJSON Point/LineString source import only when the coordinate frame and mapping are supplied. Geographic coordinates require explicit georeferencing; they cannot be assumed equivalent to the game map.
- Preserve source IDs and attribution; show new/changed/deleted counts before replacing an existing dataset.
- Make an authoring backup before destructive replacement. Do not discard hand-curated corrections silently.
- Do not claim raster-to-graph automatic extraction is reliable. Image-based road tracing assistance can be a later feature, not a hidden prerequisite.

### Editing tools

- Add, move, rename, filter and remove POIs; mark unpositioned or uncertain records.
- Draw a road centerline with multiple vertices, edit vertices, connect endpoints, split at a real intersection, and remove an incorrect connection.
- Set road name, one-way/two-way access, closed state, physical-road identity, layer, source and confidence.
- Add or remove supported turn restrictions at a junction.
- Clearly display dangling endpoints and disconnected components as authoring feedback.
- Maintain undo/redo for an editing session plus saved record revisions.
- Select an active public dataset and expose its real coverage state. Do not show an invented percentage of world completion.

Road length is calculated from its full centerline, not straight-line endpoint distance. If scale is unknown, report map units and label them; never present pixel lengths as kilometres. A supported `metresPerUnit` setting enables metres/kilometres without changing graph connectivity.

## 8. Routing algorithm

### A. Prepare the graph

During public export, create directed adjacency lists, reverse adjacency, road shapes and a spatial index of drivable segments. Keep graph identifiers stable. Honor access states and any imported turn restrictions. If restrictions exist, route on an expanded maneuver-state graph so pathfinding and all-road reachability apply the same rules.

Do not discard turn restrictions silently. If an imported restriction cannot be represented, report that dataset limitation before marking the graph ready for public driving routes.

### B. Snap pins to roads

Find the closest permitted road segment through the spatial index, project the pin onto its polyline and insert temporary route nodes at the projected positions. Split edge costs by actual remaining polyline lengths. For a two-way physical road, make directionally correct temporary links on both corresponding edges. Handle two pins on the same segment in their true order.

Keep the persisted graph immutable; query-specific split nodes/edges live only in the routing request. Default maximum snapping distance is 64 canonical map units, configurable per dataset. When multiple road levels are ambiguous, expose the selected road or ask the visitor to choose an access point rather than silently joining disconnected levels.

If a pin is outside covered road data or beyond the snapping limit, show **No mapped road near this point**. A dotted pin-to-access connector can explain snapping, but it must be labeled as a connection to the map, not a drivable road. It contributes no invented cross-water road.

### C. Exact shortest route

Use Dijkstra with a priority queue and non-negative road-length weights. Preserve original polyline points when reconstructing the route. Resolve equal-length ties deterministically by stable edge IDs. With positive weights the selected shortest route contains no unnecessary loop.

The result must be called the shortest route **in the available mapped graph**. It cannot guarantee the real game's shortest route while coverage or road restrictions are incomplete.

### D. Complete other-road overlay

Compute reachability/distances from A, and from B on the reverse graph. A directed edge `u -> v` is an eligible other road exactly when A can reach u and v can reach B, under the same access/restriction rules. With an expanded maneuver graph, evaluate eligible transitions there and project them back to physical road geometry.

This finds all drivable edges usable in an A-to-B walk without enumerating every possible journey. Collapse overlapping opposite-direction rendering to avoid drawing identical road centerlines twice. Disconnected roads are not highlighted. The overlay includes detours and cycles; the shortest route remains the stronger layer.

### E. Selectable alternatives

After returning the shortest route, compute up to four further distinct choices using Yen-style k-shortest path search on the same routing graph. Deduplicate edge sequences; show fewer choices if fewer exist. The path search works on routing states; describe any repeated physical junction honestly instead of promising all results are simple geographical paths.

Apply an approximately 1500ms work budget to alternatives after the shortest result is available. Time-bounded alternatives may be partial; label that state and allow an explicit retry for more work. This budget must not truncate the complete reachability overlay or change the exact shortest result. No need to enumerate all loops or all simple paths.

### F. Browser worker protocol

Run graph loading, snapping, pathfinding and reachability in a module Web Worker. Messages include `requestId`, dataset version, A, B and options. Responses distinguish `shortest`, `overlay`, `alternatives`, `no-route`, `off-road`, `cancelled`, `timeout`, and `error` states. Transfer typed arrays where useful; do not repeatedly copy the full graph on every drag.

Cancel previous work when pins or dataset change and ignore stale responses. A timeout is not evidence that no route exists. Keep map pan/zoom usable during computation. Fetch the graph only when Directions is first used; ordinary map exploration does not require it.

## 9. Search, sharing and browser persistence

Generate a name/alias index for public places and optional road names. Results expose source certainty and region. No real-world geocoder should turn GTA VI place names into Miami latitude/longitude.

Share links use fragments, for example:

```text
/gta-6-map/#dataset=community-v1&a=120,300&b=850,900
/gta-6-map/#dataset=community-v1&place=stable-place-id
```

Treat these numbers as illustrative map coordinates, not actual locations. Validate fragment values, bounds and dataset version at runtime. If the referenced dataset is unavailable or its coordinate frame changed, show a mismatch message and require a deliberate reset; do not silently reinterpret old pins.

Store personal markers/preferences in versioned browser storage. A small localStorage record is sufficient for v1; do not imply synchronization between browsers/devices. Export/import JSON includes its schema and dataset frame/version, with size and field limits. Do not put private notes into share fragments automatically.

Fragments do not create additional crawlable pages. Keep the canonical URL at `/gta-6-map/`; sitemap entries never enumerate A/B combinations or marker filters.

## 10. Performance, accessibility and static deployment

- Bundle Leaflet and worker assets locally; do not depend on an external map CDN or hotlinked community tile endpoint.
- Use an image overlay for a manageable base raster; add locally generated tiles when real source dimensions require them. Preserve source-frame bounds when tiling.
- Render large road layers with Canvas, cull by viewport where practical, and keep DOM markers bounded with clustering for dense place sets.
- Content-hash public graph/tiles and load matching versions atomically through the manifest. Do not mix cached dataset versions.
- Provide text-based place selection, A/B coordinate inputs, route result lists, control labels, visible focus states, and route status announcements.
- Attributions and community accuracy labels remain accessible on mobile and fullscreen.
- Without JavaScript, show the map description, a permitted static preview, attribution and relevant place/region links; explain that directions require JavaScript.
- Routing has no local CMS API dependency and must work from the exported Cloudflare assets alone.

## 11. Completion milestones and deferred acceptance cases

Treat completion as three separate records: **map UI/engine**, **dataset readiness**, and **verified road coverage**. A functioning engine over a small traced area is not full-world GTA VI navigation.

Later acceptance cases, to run only when requested:

1. Single pin, persistent personal markers, export/import and browser-storage loss explanation.
2. A/B placement, dragging, swapping, clearing, same-edge endpoints and identical endpoints.
3. Known small graph with two different-length routes: minimum-length road path is primary and alternatives remain visible.
4. Reachability overlay includes a valid long detour, excludes disconnected roads, and distinguishes cycles from loop-free alternatives.
5. One-way road, opposite direction, closure, turn restriction, bridge overlap without a junction and a legitimate bridge connection.
6. Off-road point, disconnected components, missing graph, unknown location, missing scale and dataset-version mismatch.
7. Fast repeated drags, cancelled worker jobs, out-of-order replies, alternative timeout and error recovery.
8. Static-host operation with the CMS stopped; mobile/touch and keyboard-control flows.
9. Attribution and approximation labels survive fullscreen, publication, graph replacement and cache refresh.

No road extraction, runnable interactive map, graph implementation or verification has been performed in this planning delivery. The downloaded map is a reference asset for the specified implementation.
