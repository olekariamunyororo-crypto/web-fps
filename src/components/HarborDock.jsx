import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

/**
 * Generator normalized output to a small unit bounding box regardless of the
 * real-world dimensions specified in the prompt (standard for text-to-3D
 * tools). scale=12.4 was derived by comparing a generated shipping container
 * against the real 6m x 2.4m x 2.9m standard — confirmed consistent across
 * all three dimensions, so this is a measured value, not a guess.
 *
 * 792 meshes under one static body — trimesh init may take a beat on first
 * load. If it's too slow in practice, swap colliders="trimesh" for a few
 * manually placed cuboid colliders around the pier/container footprints.
 */
export default function HarborDock({
  url = '/models/harbor-dock-shipyard.glb',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 12.4,
}) {
  const { scene } = useGLTF(url)

  return (
    <RigidBody type="fixed" colliders="trimesh" position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />
    </RigidBody>
  )
}

useGLTF.preload('/models/harbor-dock-shipyard.glb')
