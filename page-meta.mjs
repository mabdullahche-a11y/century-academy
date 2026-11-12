import { pricing } from './pricing-data.mjs';
import { faqSchema } from './landing.mjs';
import { levelDefs } from './course-data.mjs';

export const origin = new URL(process.env.SITE_URL || 'https://century-academy-english.bloomycoot1.chatgpt.site').origin;
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const descriptions = {
  '/': 'Online English Language and Literature tuition for Cambridge IGCSE, O Level and AS & A Level. Find your course and arrange a free online trial.',
  '/about/': 'Get to know Century Academy, an independent online English tuition academy for students in the GCC and worldwide.',
  '/our-approach/': 'Learn how Century Academy teaches English through close reading, discussion and exam practice.',
  '/insights/': 'Read Century Academy’s notes on evidence, summaries, sentence structure and literary interpretation.',
  '/contact/': 'Prepare an enquiry about your English course and arrange a free first online trial.',
  '/sources/': 'Find the official Cambridge International syllabuses and artwork credits for Century Academy.',
};

export function pageMeta(route, title, course) {
  const url = origin + route;
  const description = course?.intro || descriptions[route] || levelDefs[route.split('/')[2]].intro;
  const image = origin + '/assets/share.jpg';
  const provider = {
    '@type': 'EducationalOrganization',
    '@id': origin + '/#academy',
    name: 'Century Academy',
    url: origin + '/',
    sameAs: [pricing.contact.instagram],
    areaServed: ['Gulf Cooperation Council', 'Worldwide'],
    description: 'Independent online English Language and Literature tuition.',
  };
  const graph = [provider];
  if (route === '/') graph.push(faqSchema);
  if (course) graph.push({
    '@type': 'Course', name: levelDefs[course.level].name + ' ' + course.official,
    url, description, courseCode: course.code, provider: { '@id': provider['@id'] },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online' },
  });
  return `<meta name="page-type" content="service">
<meta name="site-kind" content="other">
<meta name="description" content="${escape(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Century Academy wordmark over Raphael’s School of Athens">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escape(title)}">
<meta name="twitter:description" content="${escape(description)}">
<meta name="twitter:image" content="${image}">
<link rel="preload" as="font" type="font/woff2" href="/assets/cormorant.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/dm-sans.woff2" crossorigin>
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c')}</script>`;
}

export function responsiveImage(name, cls, alt) {
  const hero = cls.includes('hero');
  const stem = name.slice(0, -4);
  const athens = stem === 'school-of-athens';
  const sizes = hero ? '(max-width: 600px) calc(100vw - 48px), (max-width: 1336px) 49vw, 650px' : '(max-width: 600px) calc(100vw - 48px), 440px';
  const set = (suffix, format) => [640, 960, 1280, 1600, 2000].map(width =>
    '/assets/' + stem + suffix + '-' + width + '.' + format + ' ' + width + 'w').join(', ');
  const sources = (suffix, mobile) => (mobile ? ['avif', 'webp', 'jpg'] : ['avif', 'webp']).map(format =>
    `<source ${mobile ? 'media="(max-width: 600px)" ' : ''}type="image/${format === 'jpg' ? 'jpeg' : format}" srcset="${set(suffix, format)}" sizes="${sizes}">`).join('');
  return `<picture>${hero ? sources('-portrait', true) : ''}${sources('', false)}
    <img src="/assets/${name}" srcset="${set('', 'jpg')}" sizes="${sizes}" alt="${escape(alt)}"
      ${hero ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="${athens ? 1280 : 954}" height="${athens ? 1000 : 1200}">
  </picture>`;
}
