import { useEffect, useRef, useState, useCallback } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

/**
 * Map your mesh2motion export's clip names to semantic states here.
 * Log `names` once (see console.warn below) to see exactly what your
 * exported GLB calls each clip, then fill this in.
 */
const CLIP_MAP = {
  idle: 'Idle',
  walk: 'Walk',
  run: 'Run',
  crouchIdle: 'CrouchIdle',
  crouchWalk: 'CrouchWalk',
  aimIdle: 'AimIdle',
  fire: 'Fire',
  reload: 'Reload',
  hit: 'HitReaction',
  death: 'Death',
}

// Clips that play once and should return to the previous loop when done
const ONE_SHOT = new Set(['fire', 'reload', 'hit', 'death'])

export default function Character({ url = '/character.glb', state = 'idle', onDeath, ...props }) {
  const group = useRef()
  const { scene, animations } = useGLTF(url)
  const { actions, names } = useAnimations(animations, group)
  const prevLoopState = useRef('idle')

  const play = useCallback(
    (key, { crossfade = 0.25 } = {}) => {
      const clipName = CLIP_MAP[key]
      const action = actions[clipName]
      if (!action) {
        console.warn(`No clip mapped for "${key}" (looked for "${clipName}"). Available clips: ${names.join(', ')}`)
        return
      }

      Object.values(actions).forEach((a) => a !== action && a.isRunning() && a.fadeOut(crossfade))

      action.reset()
      if (ONE_SHOT.has(key)) {
        action.setLoop(2200, 1) // THREE.LoopOnce
        action.clampWhenFinished = true
      } else {
        action.setLoop(2201, Infinity) // THREE.LoopRepeat
      }
      action.fadeIn(crossfade).play()
      return action
    },
    [actions, names]
  )

  useEffect(() => {
    if (ONE_SHOT.has(state)) {
      const action = play(state)
      if (!action) return
      const mixer = action.getMixer()
      const onFinished = (e) => {
        if (e.action !== action) return
        if (state === 'death') {
          onDeath?.()
          return
        }
        play(prevLoopState.current)
      }
      mixer.addEventListener('finished', onFinished)
      return () => mixer.removeEventListener('finished', onFinished)
    }

    prevLoopState.current = state
    play(state)
  }, [state, play, onDeath])

  return <primitive ref={group} object={scene} {...props} />
}

// call useGLTF.preload('/character.glb') at app start if desired
