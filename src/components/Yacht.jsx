import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

/**
 * Source model imports at ~0.44m x 0.63m x 2m due to a baked-in unit
 * conversion mismatch (common with Sketchfab FBX exports). scale=12
 * brings it to a roughly 24m-long yacht — tune visually from there.
 *
 * Trimesh colliders only work on fixed/static bodies in Rapier, which
 * is fine here since this is scenery, not something that moves.
 */
export default function Yacht({
  url = '/models/yacht.glb',
  position = [0, -0.5, -30],
  rotation = [0, 0, 0],
  scale = 12,
}) {
  const { scene } = useGLTF(url)

  return (
    <RigidBody type="fixed" colliders="trimesh" position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />
    </RigidBody>
  )
}

useGLTF.preload('/models/yacht.glb')
