# Web FPS

Single-player browser FPS scaffold — React Three Fiber + Rapier physics.

## Setup

```
npm install
npm run dev
```

Then add your model files into `public/models/` — see
`public/models/README.txt` for exactly which filenames are expected.

## What's here

- `src/components/FPSGame.jsx` — root scene: physics world, arena,
  pointer-lock player controller, bots, environment pieces
- `src/components/Bot.jsx` — enemy AI (patrol → chase → attack → death),
  driven by the mesh2motion animation set. No rifle clips exist in that
  library, so pistol animations stand in for now.
- `src/components/Character.jsx` — standalone animation-state component,
  not currently wired into the scene
- `src/components/Yacht.jsx` / `HarborDock.jsx` — static environment
  pieces (fixed rigid bodies, trimesh colliders)
- `src/components/store.js` — zustand store sharing player position/health

## Still to build

- Weapon system: hitscan raycasting, ammo, reload, muzzle flash, HUD
- Rifle animation set (none in the current library — see Bot.jsx notes)
- Hit-reaction wiring from weapon → `Bot`'s `userData.takeDamage`

## Licensing note

`yacht.glb` (if you use the original "Frickie's Yacht" asset) is
CC-BY-NC-4.0 — non-commercial use only, attribution required. Swap it
before any commercial release. The harbor/dock model is Thrixel-generated
and licensed to you directly.

## Models

The 3D models (`bot.glb`, `yacht.glb`, `harbor-dock-shipyard.glb`) are large and must be added separately (especially `bot.glb` which exceeds GitHub's 100 MB limit without Git LFS). See `public/models/README.txt`.
