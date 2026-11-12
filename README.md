# Century Academy — historic website preview

15-page static website, revised 12 November 2026. Forest green, ivory and muted gold with classical artwork, Cormorant Garamond headings and DM Sans body text.

## Build and preview

Run `node build.mjs` from this directory. Serve the generated `dist` directory with `python -m http.server 8765 --bind 127.0.0.1 --directory dist`. Open http://127.0.0.1:8765/ on this computer.

Edit `build.mjs` for shared templates, `landing.mjs` for home sections, `course-data.mjs` for Cambridge assessment data and `pricing-data.mjs` for fees, incentives and contact details. Edit the CSS and JavaScript partials in `src/`, then rebuild. Output in `dist/` is ready to serve without a JavaScript runtime. Set `SITE_URL` before building to change the production origin used in canonical URLs, sitemap and sharing metadata.

## Information architecture

- Home: qualification choices and course finder, how we teach, fees, first trial, philosophy, parent questions, experience and reading-room notes.
- Three qualification landing pages: IGCSE, O Level and AS & A Level.
- Six course pages: 0500, 0475, 1123, 2010, 9093 and 9695.
- The academy, Our approach, The reading room, Contact, Sources & artwork.
- Course pages contain the assessment guide, skill focus, tuition offer, official sources and an enquiry link that preserves the course code.

Course guides cover 2027 and 2028 examinations only. IGCSE Language uses First Language English 0500. Separate Second Language or 9–1 syllabuses are not represented by that code.

## Content and verification

Official Cambridge PDFs were downloaded and checked; original reference files and extracted text are stored in the parent `research` directory. The course data distinguishes 2027 and 2028 Literature structures, all displayed IGCSE alternative routes, optional 0500 speaking endorsement and AS-only versus full A Level weightings. O Level Literature 2010 carries the administrative-zone availability notice, especially the zone-4-only restriction from 2028. The displayed sources change with the examination year.

Run `node verify-assessments.mjs` to check all 21 year and route combinations. With the local server running, run `python verify-pages.py` for internal links, anchors, assets and HTTP responses. See [Course verification](COURSE_VERIFICATION.md) for the page-by-page source audit and [Changelog](CHANGELOG.md) for browser checks, budgets and outstanding launch inputs.

For the optional browser audit, run `pnpm --dir qa/tools install --frozen-lockfile` and `node qa/browser.mjs` while the preview is running. Set `CHROME_PATH` if Chrome is installed outside its default Windows location.

The 20+ years experience statement comes from the academy’s brief. Add named profiles and approved testimonials when supplied. Preview fees use illustrative AED rates. The enquiry helper prepares a message for the visitor to copy into Instagram and shows the profile as a fallback. WhatsApp and email require confirmed contact details.

Instagram review covered the public profile and all 12 accessible thumbnails. Individual captions and further posts were blocked by Instagram's sign-in requirement. Reading-room notes are newly written explanations inspired by visible topics, not transcripts or quotations of inaccessible captions.

## Artwork

- Raphael, The School of Athens, 1509–1511. Image from the Vatican Museums' artwork page: https://www.museivaticani.va/content/museivaticani/en/collezioni/musei/stanze-di-raffaello/stanza-della-segnatura/scuola-di-atene.html
- Jean Honoré Fragonard, Young Girl Reading, c. 1769. National Gallery of Art, Washington; Gift of Mrs. Mellon Bruce in memory of her father, Andrew W. Mellon. Museum Open Access image: https://www.nga.gov/artworks/46303-young-girl-reading

Credits appear below the artwork and on the Sources & artwork page. Artwork is illustrative and is not presented as academy premises or personnel.

## Hosting status

The existing Sites project in `.openai/hosting.json` returns `NOT_FOUND` for the currently connected account. The upgraded preview is available locally.
