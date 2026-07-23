import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector2 } from 'three'
import { easing } from 'maath'

/**
 * Smoothed pointer position in normalized device coordinates (-1..1).
 *
 * Reads r3f's state.pointer each frame and eases toward it, so effects
 * driven by the returned vector move gently instead of snapping.
 * Read `.current` inside useFrame; the ref never changes identity.
 */
export function useDampedPointer(smoothing = 0.25) {
  const pointer = useRef(new Vector2())
  useFrame((state, delta) => {
    easing.damp2(pointer.current, state.pointer, smoothing, delta)
  })
  return pointer
}
