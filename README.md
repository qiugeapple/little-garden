# Little Garden · 一小片花园

A small interactive 3D garden built with Three.js. Choose a flower, click the soil to plant it, and rotate the scene to explore your garden.

## Features

- Three flower types: daisy, poppy and lavender.
- Click to plant up to 24 flowers, with spacing checks.
- Drag to orbit; use the mouse wheel or a two-finger pinch to zoom.
- Switch between day and night lighting.
- Undo the last flower or clear the garden with confirmation.
- Save the garden in browser local storage on the current device.
- Responsive interface and reduced-motion support for flower swaying.

## Run locally

This is a static HTML/CSS/JavaScript project. No npm installation, build step, API key or backend is required.

Open the project folder in VS Code and use the Live Server extension to open `index.html`.

Alternatively, with Python 3 installed, run:

```sh
python -m http.server 8000
```

Then open http://localhost:8000. Use a local HTTP server rather than opening the HTML file directly, because the app imports JavaScript modules.

## Publish with GitHub Pages

1. Upload the contents of this folder to the root of a GitHub repository. Keep `index.html`, `app.js`, `style.css` and `vendor/` at the same level.
2. In the repository, open **Settings → Pages**.
3. Select **GitHub Actions** as the source.
4. Open **Actions** and run **Deploy static site to Pages**, or push a commit to `main`.
5. Once deployment succeeds, GitHub Pages provides the website URL.

The workflow publishes only the website files. Repository visibility and GitHub plan may affect Pages availability. The previous Sites deployment is owner-private and is not a public portfolio link.

## Project structure

```text
index.html                    Interface and controls
style.css                     Typography, layout and responsive styles
app.js                        3D scene, procedural flowers and interactions
vendor/three.module.js        Bundled Three.js r170
vendor/THREE-LICENSE.txt       Third-party license
.github/workflows/pages.yml   GitHub Pages deployment
PROCESS.md                    Implementation notes and AI disclosure
THIRD_PARTY_NOTICES.md         Dependency and font credits
```

## Visual assets

All 3D objects are generated at runtime using primitive geometry. There are no external `.glb`, `.gltf`, texture or image assets. Materials use solid colours and procedural shapes.

The optional Noto Serif SC font loads from Google Fonts. If unavailable, the interface uses local serif fonts. Three.js is bundled locally; scene rendering does not depend on a CDN.

## Credits and limitations

Created as a portfolio prototype for Dezhen Zeng with substantial AI assistance from OpenAI Codex. Codex proposed the garden direction and generated the initial implementation in response to a request for a small 3D website. See `PROCESS.md` for the contribution record.

Desktop browser checks confirmed rendering, planting, undo and day/night switching. Touch controls and responsive styling are implemented but have not been verified on physical mobile devices. The canvas planting interaction does not yet have a keyboard equivalent. Saved gardens are browser-local and are not synced between devices. Clearing browser data removes them.

Three.js is distributed under its MIT license. No additional open-source license has been assigned to the original project code in this package.
