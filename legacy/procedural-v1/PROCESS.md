# Process and contribution record

## Brief

The user requested a small 3D website as an additional interactive portfolio piece. Codex selected a tabletop flower garden as the initial direction and implemented the prototype. The user had not supplied a garden-specific visual brief or original 3D assets.

## Implementation

The scene uses Three.js r170 with a perspective camera, hemisphere and directional lighting, and soft shadows. A circular planter, soil, pebbles, stems, leaves and flowers are generated with primitive geometry. Pointer raycasting maps a click on the soil into a planting position. Pointer movement orbits the camera, and wheel/pinch input changes the viewing distance.

Flower type, location, capacity and minimum spacing are checked before planting. Local storage retains the flower records. Invalid records are filtered on load. An intentionally empty garden stays empty after a refresh.

## AI assistance

OpenAI Codex generated the initial HTML, CSS and JavaScript, procedural 3D forms, interface copy and project documentation. It also performed desktop browser checks and fixed persistence behaviour. This project should be described as AI-assisted prototyping rather than entirely handwritten development.

## Checks performed

- JavaScript syntax check.
- Desktop browser visual inspection.
- Clicking the soil increased the flower count.
- Undo removed the last flower.
- Day/night control changed its selected state and lighting settings.

Physical-device, full accessibility and cross-browser testing remain incomplete. Do not claim these checks as a user study.
