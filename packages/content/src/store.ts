import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { postMeta, type PostMeta } from '@gta6/contracts';
import { assertSlug, atomicWrite, contained, discover, postRoute, revisionOf, sanitizeHtml, serializePost, type Post } from './index.js';

export class RevisionConflict extends Error { constructor() { super('This record changed on disk. Reload before saving.'); } }
const queues = new Map<string, Promise<unknown>>();
async function serial<T>(key: string, operation: () => Promise<T>): Promise<T> {
  const prior = queues.get(key) || Promise.resolve();
  const current = prior.catch(() => undefined).then(operation);
  queues.set(key, current);
  try { return await current; } finally { if (queues.get(key) === current) queues.delete(key); }
}
function postPath(root: string, cat: string, name: string): string {
  postRoute(cat, name);
  return contained(root, 'content', 'posts', assertSlug(cat), `${assertSlug(name)}.html`);
}
export async function savePost(root: string, input: { meta: PostMeta; category: string; bodyHtml: string; expectedRevision?: string }): Promise<{ revision: string; route: string }> {
  const meta = postMeta.parse(input.meta);
  const path = postPath(root, input.category, meta.slug);
  return serial(meta.id, async () => {
    const catalog = await discover(root);
    if (catalog.errors.length) throw new Error('Resolve catalog errors before saving records');
    const existing = catalog.posts.find(item => item.meta.id === meta.id);
    if (existing) {
      if (!input.expectedRevision || input.expectedRevision !== existing.revision) throw new RevisionConflict();
      if (existing.source !== path) throw new Error('Moving a post requires an explicit route-change operation');
      if (existing.meta.publishedAt && meta.publishedAt !== existing.meta.publishedAt) throw new Error('Publication date cannot be changed by ordinary edits');
    } else {
      if (input.expectedRevision) throw new RevisionConflict();
      if (catalog.posts.some(item => item.source === path || item.route === postRoute(input.category, meta.slug))) throw new Error('The post route is already in use');
    }
    const updated: PostMeta = { ...meta, modifiedAt: new Date().toISOString() };
    const output = serializePost(updated, sanitizeHtml(input.bodyHtml));
    if (existing) {
      const revisionDir = contained(root, '.local', 'revisions', meta.id);
      await mkdir(revisionDir, { recursive: true });
      await atomicWrite(root, join(revisionDir, `${Date.now()}-${randomUUID()}.html`), await readFile(path));
      const revisions = (await readdir(revisionDir)).filter(name => name.endsWith('.html')).sort();
      // Recent 50 are retained; standalone backups are never touched here.
      for (const old of revisions.slice(0, Math.max(0, revisions.length - 50))) {
        await rm(contained(revisionDir, old));
      }
    }
    await atomicWrite(root, path, output);
    return { revision: revisionOf(output), route: postRoute(input.category, meta.slug) };
  });
}
export async function trashPost(root: string, id: string, expectedRevision: string): Promise<string> {
  return serial(id, async () => {
    const catalog = await discover(root);
    const record = catalog.posts.find(post => post.meta.id === id);
    if (!record) throw new Error('Record not found');
    if (record.revision !== expectedRevision) throw new RevisionConflict();
    const trashId = randomUUID();
    const trashDir = contained(root, '.local', 'trash', trashId);
    await mkdir(trashDir, { recursive: true });
    await copyFile(record.source, join(trashDir, 'record.html'));
    await atomicWrite(root, join(trashDir, 'manifest.json'), JSON.stringify({ schemaVersion: 1, id: record.meta.id, category: record.category, slug: record.meta.slug, originalRevision: record.revision }));
    await rename(record.source, join(trashDir, 'source.html'));
    return trashId;
  });
}
export async function restorePost(root: string, trashId: string): Promise<Post> {
  const safeId = cryptoUuid(trashId);
  const trashDir = contained(root, '.local', 'trash', safeId);
  const manifest = JSON.parse(await readFile(join(trashDir, 'manifest.json'), 'utf8'));
  const destination = postPath(root, manifest.category, manifest.slug);
  const catalog = await discover(root);
  if (catalog.posts.some(item => item.meta.id === manifest.id || item.source === destination)) throw new Error('Record ID or route is already in use');
  const source = join(trashDir, 'source.html');
  const text = await readFile(source, 'utf8');
  const { parsePost } = await import('./index.js');
  const parsed = parsePost(text, manifest.category, `${manifest.slug}.html`);
  if (parsed.meta.id !== manifest.id) throw new Error('Trash record ID mismatch');
  await mkdir(join(root, 'content', 'posts', manifest.category), { recursive: true });
  await rename(source, destination);
  return { ...parsed, source: destination };
}
function cryptoUuid(value: string): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new Error('Invalid trash ID');
  return value;
}
