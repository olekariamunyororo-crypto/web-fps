import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { usePlayerStore } from './store'

// Real clip names pulled from exported-model.glb. No rifle set exists in this
// library, so pistol clips stand in as the bot's ranged-weapon animations.
const CLIP = {
  idle: 'Idle_A',
  patrol: 'Walk',
  chase: 'Sprint',
  aim: 'Pistol_Aim_Neutral',
  hit: 'Hit_Chest',
  death: 'Death_A',
}

const SIGHT_RANGE = 14
const ATTACK_RANGE = 9
const MOVE_SPEED = 3.2
const DAMAGE_INTERVAL = 1.2 // seconds between hits once player is in range
const DAMAGE_PER_HIT = 10

export default function Bot({ url = '/models/bot.glb', spawn = [0, 1, -8], patrolPoints, health: startHealth = 100 }) {
  const group = useRef()
  const body = useRef()
  const { scene, animations } = useGLTF(url)
  const [cloned] = useState(() => scene.clone(true))
  const { actions, names } = useAnimations(animations, group)
  const damagePlayer = usePlayerStore((s) => s.damagePlayer)

  const state = useRef('idle')
  const health = useRef(startHealth)
  const dead = useRef(false)
  const fireTimer = useRef(0)
  const currentClip = useRef(null)
  const patrolIndex = useRef(0)
  const patrolTarget = useRef(new THREE.Vector3(...(patrolPoints?.[0] ?? spawn)))

  const play = (key, { fade = 0.2, loop = true, onFinish } = {}) => {
    const clipName = CLIP[key]
    if (currentClip.current === clipName) return
    const action = actions[clipName]
    if (!action) {
      console.warn(`Bot: missing clip "${clipName}". Available: ${names.join(', ')}`)
      return
    }
    Object.values(actions).forEach((a) => a.isRunning() && a.fadeOut(fade))
    action.reset()
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1)
    action.clampWhenFinished = !loop
    action.fadeIn(fade).play()
    currentClip.current = clipName
    if (!loop && onFinish) {
      const mixer = action.getMixer()
      const handler = (e) => {
        if (e.action !== action) return
        mixer.removeEventListener('finished', handler)
        onFinish()
      }
      mixer.addEventListener('finished', handler)
    }
  }

  useEffect(() => {
    play('idle')
  }, [])

  // Hook for Phase 2's weapon raycast: on hit, walk up from the intersected
  // object to find this node and call `.userData.takeDamage(amount)`.
  useEffect(() => {
    if (!group.current) return
    group.current.userData.takeDamage = (amount) => {
      if (dead.current) return
      health.current -= amount
      if (health.current <= 0) {
        dead.current = true
        currentClip.current = null // force death clip to play even if hit was mid-loop
        play('death', { loop: false })
      } else {
        const prevClip = currentClip.current
        currentClip.current = null
        play('hit', { loop: false, onFinish: () => (currentClip.current = null) })
      }
    }
  }, [actions])

  useFrame((_, delta) => {
    if (dead.current || !body.current) return

    const botPos = body.current.translation()
    const playerPos = usePlayerStore.getState().position
    const toPlayer = new THREE.Vector3(playerPos.x - botPos.x, 0, playerPos.z - botPos.z)
    const dist = toPlayer.length()

    if (dist < ATTACK_RANGE) state.current = 'attack'
    else if (dist < SIGHT_RANGE) state.current = 'chase'
    else state.current = 'patrol'

    if (state.current === 'chase') {
      toPlayer.normalize().multiplyScalar(MOVE_SPEED)
      body.current.setLinvel({ x: toPlayer.x, y: 0, z: toPlayer.z }, true)
      group.current.rotation.y = Math.atan2(toPlayer.x, toPlayer.z)
      play('chase')
    } else if (state.current === 'attack') {
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      group.current.rotation.y = Math.atan2(toPlayer.x, toPlayer.z)
      play('aim')
      fireTimer.current += delta
      if (fireTimer.current >= DAMAGE_INTERVAL) {
        fireTimer.current = 0
        damagePlayer(DAMAGE_PER_HIT)
      }
    } else if (state.current === 'patrol' && patrolPoints?.length) {
      const target = patrolTarget.current
      const toTarget = new THREE.Vector3(target.x - botPos.x, 0, target.z - botPos.z)
      if (toTarget.length() < 0.5) {
        patrolIndex.current = (patrolIndex.current + 1) % patrolPoints.length
        patrolTarget.current.set(...patrolPoints[patrolIndex.current])
      } else {
        toTarget.normalize().multiplyScalar(MOVE_SPEED * 0.5)
        body.current.setLinvel({ x: toTarget.x, y: 0, z: toTarget.z }, true)
        group.current.rotation.y = Math.atan2(toTarget.x, toTarget.z)
      }
      play('patrol')
    } else {
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      play('idle')
    }
  })

  return (
    <RigidBody ref={body} colliders="capsule" mass={1} lockRotations position={spawn}>
      <group ref={group}>
        <primitive object={cloned} />
      </group>
    </RigidBody>
  )
}

useGLTF.preload('/models/bot.glb')
