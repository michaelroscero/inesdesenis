# Inés de Senís website

Bilingual static portfolio for Inés de Senís. The visual design is implemented in plain HTML, CSS, and JavaScript; no build step or package installation is required.

## Files

- `index.html` — Spanish site
- `en.html` — English site
- `style.css`, `carousel.js`, `navigation.js` — shared presentation and interactions
- `assets/` — images and video used by the pages
- `netlify.toml` — Netlify static publishing configuration

## Preview locally

Open `index.html` in a browser, or start a local static server from this directory:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy

Connect this repository to Netlify and deploy from the repository root. The current `netlify.toml` publishes the root directory directly and does not run a build command.

The purchased domain can remain with its current registrar and be connected to the Netlify site later. Apply the DNS values shown in Netlify only after checking for existing email records. This repository does not yet include a CMS or online shop.

## Content editing

The current site content is written directly in `index.html` and `en.html`, which must be updated together. The planned CMS will be a separate feature; do not assume the existing site has a working admin editor yet.
