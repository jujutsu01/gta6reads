import { createHash, randomUUID } from 'node:crypto';
import { readdir, readFile, lstat, mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { join, resolve, relative, sep, dirname } from 'node:path';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { category, character, media, postMeta, siteSettings, releaseSettings, redirects, slug, type PostMeta } from '@gta6/contracts';

const reserved = new Set(['characters', 'gta-6-countdown', 'gta-6-map', 'search', 'about', 'privacy', 'credits', 'page', 'api', 'assets']);
const initialCategories = new Set(['gameplay', 'news', 'characters', 'updates']);
export type Post = { meta: PostMeta; category: string; bodyHtml: string; route: string; source: string; revision: string; inferred: boolean };
export type Catalog = { categories: Array<{ slug: string; name: string; id: string; order: number; introduction: string; coverMediaId: string | null; seo: object }>; posts: Post[]; errors: Array<{ source: string; message: string }> };

export function assertSlug(value: string): string { return slug.parse(value); }
export function postRoute(cat: string, name: string): string {
  assertSlug(cat); assertSlug(name);
  if (cat === 'characters') {
    if (name === 'articles') throw new Error('Reserved character article route');
    return `/characters/articles/${name}/`;
  }
  if (reserved.has(cat)) throw new Error(`Reserved category: ${cat}`);
  return `/${cat}/${name}/`;
}
export function categoryRoute(cat: string): string {
  assertSlug(cat);
  if (cat === 'characters') return '/characters/articles/';
  if (reserved.has(cat)) throw new Error(`Reserved category: ${cat}`);
  return `/${cat}/`;
}
export function contained(root: string, ...parts: string[]): string {
  const base = resolve(root);
  const path = resolve(base, ...parts);
  const rel = relative(base, path);
  if (rel === '..' || rel.startsWith(`..${sep}`) || resolve(path) === resolve(dirname(base))) throw new Error('Path escapes the content root');
  return path;
}
export async function assertNoSymlinks(root: string, path: string): Promise<void> {
  const rel = relative(resolve(root), resolve(path));
  if (rel === '..' || rel.startsWith(`..${sep}`)) throw new Error('Path escapes the content root');
  let current = resolve(root);
  for (const part of rel.split(sep).filter(Boolean)) {
    current = join(current, part);
    try { if ((await lstat(current)).isSymbolicLink()) throw new Error('Symbolic links are not accepted'); }
    catch (error: any) { if (error?.code !== 'ENOENT') throw error; }
  }
}
export function revisionOf(data: string | Buffer): string { return createHash('sha256').update(data).digest('hex'); }
function stableDraftId(path: string): string {
  const hash = createHash('sha256').update(path.toLowerCase()).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}
const purifier = createDOMPurify(new JSDOM('').window);
purifier.setConfig({
  ALLOWED_TAGS: ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'b', 'i', 'a', 'img', 'figure', 'figcaption', 'br', 'hr', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub'],
  ALLOWED_ATTR: ['href', 'title', 'src', 'alt', 'width', 'height', 'loading', 'colspan', 'rowspan'],
  ALLOW_DATA_ATTR: false
});
export function sanitizeHtml(input: string): string {
  const clean = purifier.sanitize(input, { RETURN_TRUSTED_TYPE: false }) as string;
  const dom = new JSDOM(`<body>${clean}</body>`);
  const body = dom.window.document.body;
  for (const element of Array.from(body.querySelectorAll('a[href],img[src]'))) {
    const attr = element.tagName === 'A' ? 'href' : 'src';
    const value = element.getAttribute(attr) || '';
    const allowed = attr === 'href' ? /^(https?:\/\/|\/[^/]|#)/i : /^\/media\/[a-z0-9/_-]+\.(?:avif|webp|png|jpe?g)$/i;
    if (!allowed.test(value)) element.removeAttribute(attr);
    if (element.tagName === 'A' && /^https?:\/\//i.test(value)) element.setAttribute('rel', 'noopener noreferrer');
  }
  return body.innerHTML;
}
function extractTitle(html: string, fallback: string): string {
  const dom = new JSDOM(html);
  return (dom.window.document.querySelector('h1, title')?.textContent || fallback).trim().slice(0, 180);
}
export function parsePost(text: string, cat: string, filename: string): Omit<Post, 'source'> {
  const name = assertSlug(filename.replace(/\.html$/i, ''));
  let metadata: PostMeta;
  let body: string;
  let inferred = false;
  const front = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = text.match(front);
  if (match) {
    metadata = postMeta.parse(JSON.parse(match[1]));
    if (metadata.slug !== name) throw new Error('Post slug must match its filename');
    body = text.slice(match[0].length);
  } else {
    inferred = true;
    metadata = postMeta.parse({ schemaVersion: 1, id: stableDraftId(`${cat}/${name}`), title: extractTitle(text, name.replaceAll('-', ' ')), status: 'draft', slug: name, excerpt: '', authorId: 'site-editor', publishedAt: null, modifiedAt: new Date(0).toISOString(), featuredImageId: null, tags: [], characterIds: [], seo: {} });
    const dom = new JSDOM(text);
    body = dom.window.document.body?.innerHTML || text;
  }
  return { meta: metadata, category: cat, bodyHtml: sanitizeHtml(body), route: postRoute(cat, metadata.slug), revision: revisionOf(text), inferred };
}
export async function discover(root: string): Promise<Catalog> {
  const postsRoot = contained(root, 'content', 'posts');
  const categoriesRoot = contained(root, 'content', 'categories');
  const output: Catalog = { categories: [], posts: [], errors: [] };
  const seenIds = new Set<string>();
  const seenRoutes = new Set<string>();
  let directories: import('node:fs').Dirent[];
  try { directories = await readdir(postsRoot, { withFileTypes: true }) as any; }
  catch (error: any) { if (error?.code === 'ENOENT') return output; throw error; }
  for (const entry of directories as any[]) {
    if (!entry.isDirectory() || entry.isSymbolicLink() || entry.name.startsWith('.')) continue;
    try {
      const cat = assertSlug(entry.name);
      categoryRoute(cat);
      const categoryPath = contained(categoriesRoot, `${cat}.json`);
      let settings: any;
      try { await assertNoSymlinks(root, categoryPath); settings = category.parse(JSON.parse(await readFile(categoryPath, 'utf8'))); if (settings.slug !== cat) throw new Error('Category slug mismatch'); }
      catch (error: any) { if (error?.code !== 'ENOENT') throw error; settings = { id: stableDraftId(`category/${cat}`), slug: cat, name: cat.replace(/(^|-)(\w)/g, (_, _dash, letter) => `${_dash ? ' ' : ''}${letter.toUpperCase()}`), order: 100, introduction: '', coverMediaId: null, seo: {} }; }
      output.categories.push(settings);
      for (const file of await readdir(join(postsRoot, cat), { withFileTypes: true })) {
        if (!file.isFile() || file.isSymbolicLink() || file.name.startsWith('.') || !file.name.endsWith('.html')) continue;
        const source = contained(postsRoot, cat, file.name);
        try {
          await assertNoSymlinks(root, source);
          const post = { ...parsePost(await readFile(source, 'utf8'), cat, file.name), source };
          if (seenIds.has(post.meta.id)) throw new Error(`Duplicate record ID: ${post.meta.id}`);
          if (seenRoutes.has(post.route)) throw new Error(`Duplicate public route: ${post.route}`);
          seenIds.add(post.meta.id); seenRoutes.add(post.route);
          output.posts.push(post);
        } catch (error: any) { output.errors.push({ source, message: error.message }); }
      }
    } catch (error: any) { output.errors.push({ source: entry.name, message: error.message }); }
  }
  output.categories.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  return output;
}
export async function discoverAuthoring(root: string) {
  const catalog = await discover(root);
  const characters: Array<ReturnType<typeof character.parse>> = [];
  const mediaRecords: Array<ReturnType<typeof media.parse>> = [];
  const ids = new Set(catalog.posts.map(post => post.meta.id));
  const routes = new Set(catalog.posts.map(post => post.route));
  for (const [folder, schema, list] of [
    ['characters', character, characters], ['media', media, mediaRecords]
  ] as const) {
    const directory = contained(root, 'content', folder);
    for (const file of await readdir(directory, { withFileTypes: true })) {
      if (!file.isFile() || file.isSymbolicLink() || !file.name.endsWith('.json') || file.name.startsWith('.')) continue;
      const path = contained(directory, file.name);
      try {
        await assertNoSymlinks(root, path);
        const record = schema.parse(JSON.parse(await readFile(path, 'utf8')));
        if (ids.has(record.id)) throw new Error(`Duplicate record ID: ${record.id}`);
        ids.add(record.id);
        if (folder === 'characters') {
          const item = record as typeof character._output;
          if (`${item.slug}.json` !== file.name) throw new Error('Character slug must match its filename');
          const route = `/characters/${item.slug}/`;
          if (item.slug === 'articles' || routes.has(route)) throw new Error(`Reserved or duplicate route: ${route}`);
          routes.add(route);
        }
        (list as any[]).push(record);
      } catch (error: any) { catalog.errors.push({ source: path, message: error.message }); }
    }
  }
  const settings: Record<string, unknown> = {};
  for (const [section, schema] of [['site', siteSettings], ['release', releaseSettings], ['redirects', redirects]] as const) {
    const path = contained(root, 'content', 'settings', `${section}.json`);
    try { await assertNoSymlinks(root, path); settings[section] = schema.parse(JSON.parse(await readFile(path, 'utf8'))); }
    catch (error: any) { catalog.errors.push({ source: path, message: error.message }); }
  }
  return { ...catalog, characters, media: mediaRecords, settings };
}
export async function atomicWrite(root: string, path: string, data: string | Buffer): Promise<void> {
  const safePath = contained(root, relative(resolve(root), resolve(path)));
  await assertNoSymlinks(root, safePath);
  await mkdir(dirname(safePath), { recursive: true });
  const temporary = `${safePath}.${randomUUID()}.tmp`;
  try { await writeFile(temporary, data, { flag: 'wx' }); await rename(temporary, safePath); }
  finally { await rm(temporary, { force: true }); }
}
export function serializePost(meta: PostMeta, html: string): string {
  return `---\n${JSON.stringify(postMeta.parse(meta), null, 2)}\n---\n${sanitizeHtml(html)}\n`;
}
export { initialCategories };
export { savePost, trashPost, restorePost, RevisionConflict } from './store.js';
