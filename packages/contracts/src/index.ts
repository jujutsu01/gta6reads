import { z } from 'zod';

export const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
export const recordId = z.string().uuid();
export const isoDate = z.string().datetime({ offset: true });
export const status = z.enum(['draft', 'published']);
export const seo = z.object({
  title: z.string().max(120).optional(),
  description: z.string().max(300).optional(),
  canonical: z.string().url().optional(),
  index: z.boolean().optional(),
  follow: z.boolean().optional(),
  socialImageId: recordId.nullable().optional(),
  socialImageAlt: z.string().max(300).optional()
}).strict();
export const postMeta = z.object({
  schemaVersion: z.literal(1),
  id: recordId,
  title: z.string().trim().min(1).max(180),
  status,
  slug,
  excerpt: z.string().max(600).default(''),
  authorId: z.string().min(1).max(100),
  publishedAt: isoDate.nullable(),
  modifiedAt: isoDate,
  featuredImageId: recordId.nullable(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20),
  characterIds: z.array(recordId).max(30),
  seo
}).strict().superRefine((data, ctx) => {
  if (data.status === 'published' && !data.publishedAt) ctx.addIssue({ code: 'custom', path: ['publishedAt'], message: 'Published posts require publishedAt' });
});
export type PostMeta = z.infer<typeof postMeta>;

export const category = z.object({
  schemaVersion: z.literal(1), id: recordId, slug, name: z.string().trim().min(1).max(100),
  introduction: z.string().max(1000).default(''), coverMediaId: recordId.nullable().default(null),
  order: z.number().int().min(0).default(100), seo: seo.default({})
}).strict();
export const character = z.object({
  schemaVersion: z.literal(1), id: recordId, slug, name: z.string().trim().min(1),
  kind: z.enum(['person', 'group']), status, role: z.string().max(160), summary: z.string().max(600),
  biographyHtml: z.string(), imageId: recordId.nullable(), imageCaption: z.string().max(300).default(''),
  facts: z.array(z.object({ label: z.string(), value: z.string() }).strict()).default([]),
  relationshipIds: z.array(recordId).default([]), memberIds: z.array(recordId).default([]),
  sources: z.array(z.object({ label: z.string(), url: z.string().url() }).strict()).min(1),
  updatedAt: isoDate, seo: seo.default({})
}).strict();
export const media = z.object({
  schemaVersion: z.literal(1), id: recordId, original: z.string(), mime: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  width: z.number().int().positive(), height: z.number().int().positive(), alt: z.string().max(300),
  caption: z.string().max(500).default(''), credit: z.string().max(200), sourceUrl: z.string().url().nullable(),
  focalX: z.number().min(0).max(1).default(0.5), focalY: z.number().min(0).max(1).default(0.5)
}).strict();
export const siteSettings = z.object({
  schemaVersion: z.literal(1), siteName: z.string().min(1), tagline: z.string(),
  publicBaseUrl: z.string().url().nullable(), locale: z.string(), authorName: z.string().nullable(),
  heroImageId: recordId.nullable(), socialImageId: recordId.nullable()
}).strict();
export const releaseSettings = z.object({
  schemaVersion: z.literal(1), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mode: z.enum(['viewer-local-midnight', 'reference-zone-midnight', 'fixed-instant']),
  referenceZone: z.string().nullable(), instant: isoDate.nullable(),
  sourceUrl: z.string().url(), checkedAt: isoDate, availableNow: z.boolean().default(false)
}).strict();
export const redirect = z.object({ from: z.string().startsWith('/'), to: z.string().startsWith('/'), status: z.literal(301), recordId: recordId.nullable() }).strict();
export const redirects = z.object({ schemaVersion: z.literal(1), entries: z.array(redirect) }).strict();
export const apiError = z.object({ error: z.object({ code: z.string(), message: z.string(), fields: z.record(z.string(), z.string()).optional() }) });
