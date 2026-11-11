# Inés de Senís website

Bilingual static portfolio for Inés de Senís. The visual design is implemented in plain HTML, CSS, and JavaScript; no compilation or package installation is required. Netlify runs a content validation script before publishing.

## Files

- `index.html` — Spanish site
- `en.html` — English site
- `style.css`, `carousel.js`, `navigation.js` — shared presentation and interactions
- `content/site.json` — artwork content, publication/availability states, and homepage-feature selection
- `content-loader.js` — renders the localized content while preserving the existing visual design
- `admin/` — Decap CMS editor and content form configuration
- `assets/` — images and video used by the pages
- `netlify.toml` — Netlify static publishing configuration

## Preview locally

Start a local static server from this directory so the pages can fetch their JSON content:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy

Connect this repository to Netlify and deploy from the repository root. `netlify.toml` validates artwork content and publishes the root directory directly.
The build log lists each artwork image/video path and the resolved file path; CMS paths can be relative or root-relative, but must point inside `assets/`.

The purchased domain can remain with its current registrar and be connected to the Netlify site later. Apply the DNS values shown in Netlify only after checking for existing email records.

## Content editing

The CMS editor is at `/admin/`; artwork content is stored in `content/site.json`. The CMS configuration uses Netlify Identity and Git Gateway, which must be enabled and configured on the Netlify site before editors can sign in. Restrict registration to invited editors. The GitHub repository still needs to be connected to Netlify and configured before the editor is live.

The original HTML artwork markup remains as a fallback if the content file cannot be loaded. Once the JSON is loaded, the portfolio and homepage feature render from the CMS-managed content.

The current editor is for portfolio content only. Availability labels and enquiry emails do not process orders or payments.
