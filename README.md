# One Mahogany Global — website prototype

Open `index.html`, or serve this folder with `python3 -m http.server 4173 --bind 127.0.0.1`.

The local website now contains all eight customer-journey pages: Home → What We Solve → Who We Help → How It Works → Results → About → Resources → Let's Talk. The Resources page includes six complete guides with topic filters. Navigation links open real pages.

## Current design

One continuous white website card on a soft blue-gray body, with full-width inner sections, centered content capped at 1528px, and a rounded homepage video opening. The frame and opening together occupy 100vh, and the #358AD2 brand accent. Poppins is self-hosted in four weights, with system sans-serif fallbacks. Buttons and active menu items use bright brand blue (#247AB5) with white text. Most interface and reading text is at least 16px; the small hero chapter label, slide counter, and compact resource metadata are exceptions. The initial white navigation pill remains; scrolling changes it to plain links over a flush navy header. The full-frame video overlay is light, with feathered contrast behind the copy and soft text shadows. Hero controls are unboxed with a progress ring around the play/pause button.

The customer is the protagonist. The content follows Tony's supplied purpose document, master guide, numbered page briefs, and customer-journey graphic. The user's current typography, color, layout, and hero preferences take precedence over older visual directions in those documents. Supplied documentary photographs are used throughout; asset provenance remains in `asset-sources.json`.

## Implementation

- `index.html` and `script.js`: homepage and existing video, pillar, contact-dialog, and industry-carousel interactions.
- `site.js`: subpage navigation, resource filters, and conversation email draft.
- `styles.css`, `modern.css`, `design-system.css`, `refresh.css`, `pages.css`: existing base styles followed by the current layout and shared page layer.
- `scripts/build-pages.py`: source for the seven static subpages and six resource reading pages. Run `python3 scripts/build-pages.py` from this folder to regenerate them. Shared header, footer, and SVG symbols come from `index.html`.

## Contact and evidence boundaries

The contact page and optional home contact dialog prepare an email draft. The visitor reviews and sends it from their email app. Nothing is submitted to a server or stored by this website. Live form delivery remains to be connected.

Results scenarios are illustrative, not client case studies. No client metrics or testimonials have been invented. Archival photographs support the About narrative and do not imply client endorsements. The six resource guides are newly written site content based on the supplied editorial direction.

This prototype is published separately from the live WordPress site, which has not changed. `noindex, nofollow` is retained for the prototype.

See `TONY-REQUIREMENTS-REVIEW.md` for the page-by-page review, corrections, and remaining production requirements.

Subpages use compact, left-aligned editorial heroes with supporting imagery; only Home retains the full-screen video opening. Desktop header branding is 200px wide.

## GitHub Pages

- Repository: https://github.com/vincentpalcon/one-mahogany-homepage
- Preview: https://vincentpalcon.github.io/one-mahogany-homepage/

GitHub Pages serves the committed static files from the root of `main`. The `.nojekyll` file keeps the site as plain HTML, CSS, JavaScript, and assets. Regenerate the subpages with `python3 scripts/build-pages.py`, then commit and push the generated HTML alongside the source changes.

Asset cache versions are generated automatically by `scripts/version-assets.py`, which runs at the end of the page build. CSS, JavaScript, favicons, photographs, videos and fonts get content-based versions; hero media has its own generated revision. Bump `CACHE_EPOCH` in that script when a deployment needs to force-refresh unchanged assets too. GitHub Pages controls HTTP cache headers; these asset URLs avoid reusing older asset responses after an update.
