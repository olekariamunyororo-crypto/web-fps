Bundled here:

  bot.glb                     - rigged character, 162 mesh2motion clips
  yacht.glb                   - "Frickie's Yacht" - CC-BY-NC-4.0, NON-COMMERCIAL
                                 ONLY, attribution required. Swap before any
                                 commercial release.
  harbor-dock-shipyard.glb    - Thrixel-generated, licensed to you directly

NOT included: the "luxurious mega yacht" - it needs decimation and
cleanup in Blender first (3,025 meshes / 1.4M triangles as exported,
plus what looks like a full surrounding scene bundled in with it).
Wiring it in as-is would tank performance or hang the browser on the
trimesh collider generation.

NOTE: These .glb files are large. bot.glb (~102 MB) exceeds GitHub's
100 MB hard limit and requires Git LFS. The other two (yacht ~11 MB,
harbor ~8.5 MB) can be uploaded via the GitHub web UI or git push.

Place the three .glb files in this directory for the game to load them.
