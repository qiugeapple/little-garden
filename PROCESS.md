# Process · Little Garden

## Direction and iteration

The project evolved from a procedural tabletop garden into a scene-led, pastel windowsill world. The owner supplied mood references and directed the return from a visible desktop-style control interface to interactions embedded in objects. Feedback shaped transparent materials, natural clouds, softer curtains, varied flowers and leaves, richer groundcover, pixel pets, day/night lighting and a restrained toy-like cottage.

The current interaction uses twelve flowers rather than twenty-four. Planting and watering precede growth; only a fully watered and grown garden triggers the cottage finale. The house is a completion reward rather than the default night environment. A separate preview is available without granting a permanent unlock.

## Blender to browser

Blender scenes contain the window, devices, watering can, flowers, layered vegetation, curtains and cottage. Five runtime GLBs separate the main scene, six botanical templates, meadow, voile and reward cottage. The cottage is loaded on demand. Original packed Blender files are compressed separately in `source/` to keep the editable assets available without putting them in the website deployment.

Browser materials, lighting and reflections are adapted for real-time rendering. They approximate the Blender aesthetic rather than reproducing an offline render pixel for pixel. Screens use animated canvas textures. Cloud panorama motion and soft shader-based transition mist avoid a cluster of obvious spherical cloud meshes.

Curtains use exported mesh morphs, with different timing for rail and hem. Flower growth samples elapsed age directly. Mature flowers keep their final scale rather than being reset by a repeatedly paused animation mixer. Layered Blender groundcover replaces the earlier spherical border.

## Recent regression fixes

- Fixed flowers disappearing after growth by making the final growth state stable.
- Replaced lumpy transition cloud geometry with soft transparent mist.
- Gated completion on exactly twelve watered flowers at growth age 7.5 seconds or later.
- Kept reward preview separate from persistent completion state.
- Restored coloured cottage materials and adjusted its night window emission.
- Corrected curtain morph playback and retained staggered cloth movement.

## Validation and evidence

Automated checks cover completion boundaries, preview/unlock state, repeated mature growth sampling, GLB integrity and expected asset structures. The static build contains only runtime files. Desktop visual checks and staged completed-state captures were used to inspect the composition. Blender study images document modelling separately; they are not browser screenshots. A staged capture is presentation evidence, not proof that every step was manually played through.

A full fresh-save twelve-flower manual run, physical mobile testing, broader GPU/browser testing and keyboard accessibility remain outstanding. No user study or performance benchmark is claimed.

## Contributions and asset provenance

The owner provided references, priorities, visual critiques and interaction requirements throughout. OpenAI Codex assisted with scene construction and changes through Blender tooling, generated/processed project textures, wrote and revised the Three.js interaction code and audio synthesis, and prepared documentation and the Figma presentation. The portfolio should describe this as an AI-assisted creative development process.

Raster textures and pixel-pet imagery were created for this project with AI assistance. Piano and ambient effects are synthesized project audio, not a licensed commercial recording. External reference screenshots informed art direction; they are not shipped as website assets. Three.js and supporting loaders are retained under their MIT licence.

## Presentation

Two frames in the existing portfolio file present the web experience and Blender modelling. The second page shows six botanical silhouettes and the simplified pastel cottage, with editable explanatory text. The original procedural website is retained in `legacy/procedural-v1/` for historical comparison.
