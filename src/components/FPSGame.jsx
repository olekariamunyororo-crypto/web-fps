import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { usePlayerStore } from './store'
import Bot from './Bot'
import Yacht from './Yacht'
import HarborDock from './HarborDock'

/**
 * Phase 1: walk-around FPS scaffold.
 * npm i three @react-three/fiber @react-three/drei @react-three/rapier zustand
 */

const MOVE_SPEED = 6
const SPRINT_MULT = 1.6
const JUMP_FORCE = 6

function usePlayerInput() {
  const keys = useRef({ forward: false, back: false, left: false, right: false, sprint: false, jump: false })

  useEffect(() => {
    const down = (e) => setKey(e.code, true)
    const up = (e) => setKey(e.code, false)
    const setKey = (code, val) => {
      switch (code) {
        case 'KeyW': case 'ArrowUp': keys.current.forward = val; break
        case 'KeyS': case 'ArrowDown': keys.current.back = val; break
        case 'KeyA': case 'ArrowLeft': keys.current.left = val; break
        case 'KeyD': case 'ArrowRight': keys.current.right = val; break
        case 'ShiftLeft': keys.current.sprint = val; break
        case 'Space': keys.current.jump = val; break
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  return keys
}

function Player() {
  const body = useRef()
  const keys = usePlayerInput()
  const { camera } = useThree()
  const grounded = useRef(true)
  const direction = new THREE.Vector3()
  const frontVector = new THREE.Vector3()
  const sideVector = new THREE.Vector3()

  useFrame(() => {
    if (!body.current) return

    const { forward, back, left, right, sprint, jump } = keys.current
    frontVector.set(0, 0, (back ? 1 : 0) - (forward ? 1 : 0))
    sideVector.set((left ? 1 : 0) - (right ? 1 : 0), 0, 0)
    direction.subVectors(frontVector, sideVector).normalize()
    direction.applyEuler(camera.rotation)
    direction.y = 0
    direction.normalize().multiplyScalar(MOVE_SPEED * (sprint ? SPRINT_MULT : 1))

    const vel = body.current.linvel()
    body.current.setLinvel({ x: direction.x, y: vel.y, z: direction.z }, true)

    if (jump && grounded.current) {
      body.current.setLinvel({ x: vel.x, y: JUMP_FORCE, z: vel.z }, true)
      grounded.current = false
    }

    const pos = body.current.translation()
    camera.position.set(pos.x, pos.y + 0.6, pos.z) // eye offset above capsule center
    usePlayerStore.getState().setPosition(pos)
  })

  return (
    <RigidBody
      ref={body}
      colliders="capsule"
      mass={1}
      lockRotations
      position={[0, 2, 0]}
      onCollisionEnter={() => (grounded.current = true)}
    >
      <mesh visible={false}>
        <capsuleGeometry args={[0.4, 1.2]} />
      </mesh>
    </RigidBody>
  )
}

function Arena() {
  return (
    <>
      {/* Ground */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.5, 0]}>
          <boxGeometry args={[60, 1, 60]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      </RigidBody>

      {/* A few cover boxes to walk around / test collision */}
      {[[-6, 1, -4], [5, 1, 2], [0, 1, -10], [8, 1, -6]].map((p, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={p}>
          <mesh castShadow>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#8a6" />
          </mesh>
        </RigidBody>
      ))}

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 5]} intensity={1} castShadow />
    </>
  )
}

function Crosshair() {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: 4,
        height: 4,
        background: 'white',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        mixBlendMode: 'difference',
      }}
    />
  )
}

export default function FPSGame() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }}>
        <Physics gravity={[0, -20, 0]}>
          <Arena />
          <Player />
          <Bot spawn={[5, 1, -6]} patrolPoints={[[5, 1, -6], [5, 1, -14]]} />
          <Bot spawn={[-6, 1, -10]} patrolPoints={[[-6, 1, -10], [2, 1, -10]]} />
          <Yacht />
          <HarborDock position={[0, 0, -15]} />
        </Physics>
        <PointerLockControls />
      </Canvas>
      <Crosshair />
      <div style={{ position: 'fixed', bottom: 16, left: 16, color: '#fff', fontFamily: 'monospace', opacity: 0.6 }}>
        Click to lock mouse — WASD move, Shift sprint, Space jump
      </div>
    </div>
  )
}
