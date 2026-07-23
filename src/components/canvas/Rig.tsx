import { useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import type { Group } from 'three'

type RigProps = {
  children: ReactNode
  /** Max tilt in radians at the screen edges. */
  intensity?: number
  /** Damping smooth-time in seconds; higher = lazier follow. */
  smoothing?: number
}

/**
 * Wraps children in a group that tilts gently toward the pointer.
 * Applies rotation only, on its own group, so children remain free to run
 * their own idle animations (position/rotation/scale) underneath.
 */
export default function Rig({ children, intensity = 0.12, smoothing = 0.35 }: RigProps) {
  const group = useRef<Group>(null)
  useFrame((state, delta) => {
    if (!group.current) return
    easing.dampE(
      group.current.rotation,
      [-state.pointer.y * intensity, state.pointer.x * intensity, 0],
      smoothing,
      delta,
    )
  })
  return <group ref={group}>{children}</group>
}
