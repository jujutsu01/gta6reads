import { randomUUID } from 'node:crypto';
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const provenance = JSON.parse(await readFile(join(root, 'references', 'image-sources.json'), 'utf8'));
const mediaDir = join(root, 'content', 'media');
const characterDir = join(root, 'content', 'characters');
try { await access(join(characterDir, 'jason-duval.json')); throw new Error('Character seed already exists; this script runs once.'); }
catch (error) { if (error?.code !== 'ENOENT') throw error; }
await mkdir(mediaDir, { recursive: true });
await mkdir(characterDir, { recursive: true });
const images = [
  ['hero-jason-lucia.jpg', 'Jason and Lucia in official GTA VI promotional artwork'],
  ['jason-duval.jpg', 'Official artwork of Jason Duval'],
  ['lucia-caminos.jpg', 'Official artwork of Lucia Caminos'],
  ['cal-hampton.jpg', 'Official artwork of Cal Hampton'],
  ['boobie-ike.jpg', 'Official artwork of Boobie Ike'],
  ['drequan-priest.jpg', "Official artwork of Dre'Quan Priest"],
  ['real-dimez.jpg', 'Official group artwork of Real Dimez'],
  ['raul-bautista.jpg', 'Official artwork of Raul Bautista'],
  ['brian-heder.jpg', 'Official artwork of Brian Heder']
];
const mediaIds = new Map();
for (const [filename, alt] of images) {
  const reference = provenance.assets.find(asset => asset.file === `images/${filename}`);
  if (!reference) throw new Error(`Missing provenance for ${filename}`);
  const source = join(root, 'references', 'images', filename);
  const dimensions = await sharp(source).metadata();
  if (!dimensions.width || !dimensions.height) throw new Error(`Unreadable dimensions: ${filename}`);
  const id = randomUUID();
  const original = `originals/${id}.jpg`;
  await mkdir(join(mediaDir, 'originals'), { recursive: true });
  await copyFile(source, join(mediaDir, original));
  const record = { schemaVersion: 1, id, original, mime: 'image/jpeg', width: dimensions.width, height: dimensions.height, alt, caption: '', credit: reference.owner, sourceUrl: reference.sourcePage, focalX: 0.5, focalY: 0.5 };
  await writeFile(join(mediaDir, `${id}.json`), `${JSON.stringify(record, null, 2)}\n`, { flag: 'wx' });
  mediaIds.set(filename, id);
}
const source = { label: 'Rockstar Games — Only in Leonida', url: 'https://www.rockstargames.com/VI/only-in-leonida' };
const people = [
  ['jason-duval', 'Jason Duval', 'Person in the GTA VI story', 'Jason is trying to build a better life in Leonida while his connection with Lucia draws him into a larger criminal story.', 'Rockstar places Jason in the Leonida Keys and describes his work for local drug runners. His bond with Lucia is central to the official story outline.', 'jason-duval.jpg'],
  ['lucia-caminos', 'Lucia Caminos', 'Person in the GTA VI story', 'Lucia leaves the Leonida Penitentiary with a plan to improve her future, and Jason is part of the story ahead.', 'Rockstar says Lucia served time after fighting for her family. She wants a better life and intends to pursue it through deliberate moves.', 'lucia-caminos.jpg'],
  ['cal-hampton', 'Cal Hampton', 'Jason’s friend', 'Cal is a friend of Jason and an associate of Brian who prefers watching the world from home.', 'Rockstar describes Cal as Jason’s friend and Brian’s fellow associate. His interest in Coast Guard communications and conspiracy ideas shapes his outlook.', 'cal-hampton.jpg'],
  ['boobie-ike', 'Boobie Ike', 'Vice City business figure', 'Boobie runs a mix of legitimate businesses and is invested in the success of Only Raw Records.', 'Rockstar presents Boobie as a Vice City figure with interests in real estate, a club and a recording studio. His partnership with Dre’Quan centers on their record label.', 'boobie-ike.jpg'],
  ['dre-quan-priest', "Dre'Quan Priest", 'Music entrepreneur', 'Dre’Quan wants to make his mark in music and has signed Real Dimez to Only Raw Records.', 'Rockstar describes Dre’Quan’s long interest in music and his work with Boobie. Signing Real Dimez is part of his move into the Vice City scene.', 'drequan-priest.jpg'],
  ['real-dimez', 'Real Dimez', 'Rap duo', 'Bae-Luxe and Roxy perform together as Real Dimez and are signed to Only Raw Records.', 'Rockstar identifies Bae-Luxe and Roxy as longtime friends who built a following through music and social media. The duo is seeking another success with Only Raw Records.', 'real-dimez.jpg'],
  ['bae-luxe', 'Bae-Luxe', 'Real Dimez member', 'Bae-Luxe is one half of Real Dimez, the duo signed to Only Raw Records.', 'Rockstar names Bae-Luxe as a member of Real Dimez alongside Roxy. The shared official group artwork shows the duo; it is not identified as a solo portrait.', 'real-dimez.jpg'],
  ['roxy', 'Roxy', 'Real Dimez member', 'Roxy is one half of Real Dimez, the duo signed to Only Raw Records.', 'Rockstar names Roxy as a member of Real Dimez alongside Bae-Luxe. The shared official group artwork shows the duo; it is not identified as a solo portrait.', 'real-dimez.jpg'],
  ['raul-bautista', 'Raul Bautista', 'Bank robber', 'Raul is an experienced bank robber whose appetite for risk shapes his crew’s choices.', 'Rockstar describes Raul as a seasoned bank robber searching for capable partners. His willingness to take bigger risks raises the stakes for his crew.', 'raul-bautista.jpg'],
  ['brian-heder', 'Brian Heder', 'Keys smuggler', 'Brian runs a boat yard in the Keys and has an arrangement with Jason.', 'Rockstar says Brian still moves product through his boat yard. Jason stays at one of Brian’s properties and helps with local work in return.', 'brian-heder.jpg']
];
const ids = new Map(people.map(item => [item[0], randomUUID()]));
const links = new Map([
  ['jason-duval', ['lucia-caminos', 'cal-hampton', 'brian-heder']],
  ['lucia-caminos', ['jason-duval']],
  ['cal-hampton', ['jason-duval', 'brian-heder']],
  ['boobie-ike', ['dre-quan-priest']],
  ['dre-quan-priest', ['boobie-ike', 'real-dimez']],
  ['real-dimez', ['bae-luxe', 'roxy', 'dre-quan-priest']],
  ['bae-luxe', ['real-dimez', 'roxy']],
  ['roxy', ['real-dimez', 'bae-luxe']],
  ['brian-heder', ['jason-duval', 'cal-hampton']]
]);
for (const [slug, name, role, summary, biography, filename] of people) {
  const shared = slug === 'bae-luxe' || slug === 'roxy';
  const record = {
    schemaVersion: 1, id: ids.get(slug), slug, name, kind: slug === 'real-dimez' ? 'group' : 'person', status: 'published',
    role, summary, biographyHtml: `<p>${biography.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</p>`, imageId: mediaIds.get(filename),
    imageCaption: shared ? 'Shared official Real Dimez group artwork; this is not an individual portrait.' : '',
    facts: [], relationshipIds: (links.get(slug) || []).map(key => ids.get(key)),
    memberIds: slug === 'real-dimez' ? [ids.get('bae-luxe'), ids.get('roxy')] : [],
    sources: [source], updatedAt: new Date().toISOString(), seo: {}
  };
  await writeFile(join(characterDir, `${slug}.json`), `${JSON.stringify(record, null, 2)}\n`, { flag: 'wx' });
}
const settingsPath = join(root, 'content', 'settings', 'site.json');
const settings = JSON.parse(await readFile(settingsPath, 'utf8'));
settings.heroImageId = mediaIds.get('hero-jason-lucia.jpg');
await writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
