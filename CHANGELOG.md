# Century Academy website upgrade

## 12 November 2026

| Area | Before | After |
| --- | --- | --- |
| Course discovery | Three qualification cards leading to six guides | Same routes and cards, plus a three-step finder. Results show the syllabus code, paper weightings and a trial link that carries through the course and year. |
| Course guides | Year and route selectors | Existing assessment explorers retained, with Cambridge source checks, clearer 0475, 2010 and 9695 notes and expandable 0500 task guidance. |
| Trial and fees | Instagram enquiry and trial links | Trial links throughout, an hourly and monthly fee switch, one confirmed incentive, six parent questions and an enquiry that visitors can copy into Instagram. |
| Design | Green, ivory and gold with framed classical art | Same palette, artwork and fonts, with clearer hierarchy, legible captions, sticky navigation, a phone trial bar, keyboard states and reduced-motion support. |
| Assets and sharing | Single artwork files and shared styles | Responsive AVIF, WebP and JPEG files, self-hosted fonts, local bundles, page metadata, structured data, sitemap and sharing artwork. |

### Transfer budgets

| Resource | Target | Measured |
| --- | ---: | ---: |
| Home HTML | 30 KB | 25.43 KB |
| CSS | 45 KB / 12 KB gzip | 44.93 KB / 9.96 KB gzip |
| First-load JavaScript | 15 KB gzip | 3.79 KB gzip |
| Self-hosted fonts, combined | 120 KB | 113.83 KB |
| 1280w hero, AVIF / WebP | 150 KB each | Desktop 73.48 / 144.92 KB. Portrait 84.64 / 148.01 KB. |

The home page requests course data only after the finder is opened. Font and CSS sizes are measured from the generated files. KB is 1,000 bytes.

### Browser checks

| Lighthouse, local Chromium | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile, simulated throttling | 97 | 100 | 100 | 100 | 2.41 s | 0 |
| Desktop | 100 | 100 | 100 | 100 | 0.55 s | 0 |

Mobile LCP exceeded the 2.0 s target in this run. Scores describe the homepage served locally and will depend on the production host and device.

- HTML validation passed all 15 pages. The link check resolved 487 internal links and assets. All 21 assessment combinations passed.
- Axe found zero violations across the 15 pages. The contrast script found zero measured text pairs below 4.5:1 and the text scan found zero visible text below 11px. The automated checks do not cover every accessibility criterion.
- Home screenshots at 320, 360, 390, 414, 768, 1024, 1280, 1536 and 1920 CSS pixels. All 15 pages also passed the overflow check at native 200% Chrome zoom. Checked keyboard focus and native radio navigation, touch drawer dismissal, finder, fees, FAQ, trial bar, course/year enquiry links and assessment changes. Reduced motion kept the first screen static. No browser errors were recorded.
- The automated design checker ended with 129 findings and no waivers. Findings include its rules for one section per screen, uncaptioned visuals, no scroll-driven effects on service sites and 7:1 body-text contrast. The site uses the brief’s compact sections, artwork credits, overlapping gallery label and 4.5:1 text contrast threshold. A separate keyboard check confirmed that the four controls the checker flagged for visibility were onscreen with 3px focus indicators. The full checker output is in `qa/taste-gate.log`.

### Needs owner input

- Confirm the billing currency, hourly and monthly prices, lesson counts, maximum group size, payment methods and cancellation or rescheduling terms. The preview shows clearly labelled AED demonstration rates and assumes four lessons per month.
- Confirm any additional incentives. The free first online trial is the sole published incentive.
- Provide the academy’s WhatsApp business number and email address if those enquiry channels should appear. Instagram is the configured channel.
- Provide approved teacher profiles or testimonials if you want them added. The current teaching experience statement uses the supplied 20+ years claim.
- Confirm the public production URL or restore access to the existing Sites project before publishing.

### Known limitations

- Wikimedia Commons file pages were accessible, but the original image downloads returned HTTP 403. The existing Vatican Museums and National Gallery of Art reproductions were used for the responsive exports. Larger versions are interpolated from those masters. Credits distinguish the actual assets from the Commons references.
- The existing Sites project returned `NOT_FOUND` for the connected account. The upgrade is available in the local build.
- Cross-document transitions, scroll-driven parallax and smooth native details transitions depend on browser support.
- Header compaction switches between two heights at the scroll threshold. Button hover uses a colour transition.
