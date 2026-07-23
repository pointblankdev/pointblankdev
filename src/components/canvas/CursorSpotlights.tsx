import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'

// The logo group sits at z=2; aim the lights at that plane.
const LOGO_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2)

/**
 * The reveal flashlight: three tight beams — pure white core plus
 * white-green and white-purple tints — all from nearly the same origin,
 * so the tinted edges fringe the white pool like stage glass filters.
 * Only the portion of the asset under the beam is visible at once.
 */
export default function CursorSpotlights() {
  const targetA = useMemo(() => new THREE.Object3D(), [])
  const targetB = useMemo(() => new THREE.Object3D(), [])
  const targetC = useMemo(() => new THREE.Object3D(), [])
  const hit = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    state.raycaster.setFromCamera(state.pointer, state.camera)
    if (state.raycaster.ray.intersectPlane(LOGO_PLANE, hit)) {
      // White core leads; tinted beams trail with tiny offsets so their
      // color fringes the edge of the white pool
      easing.damp3(targetA.position, [hit.x, hit.y, 2], 0.08, delta)
      easing.damp3(targetB.position, [hit.x + 0.15, hit.y + 0.1, 2], 0.22, delta)
      easing.damp3(targetC.position, [hit.x - 0.15, hit.y - 0.1, 2], 0.3, delta)
    }
  })

  return (
    <>
      {/* Pure white core beam */}
      <spotLight
        target={targetA}
        position={[0.4, 1, 6]}
        angle={0.08}
        penumbra={0.85}
        decay={0}
        intensity={12}
        color='#ffffff'
      />
      {/* White-green fringe */}
      <spotLight
        target={targetB}
        position={[0.6, 0.9, 6]}
        angle={0.11}
        penumbra={1}
        decay={0}
        intensity={5}
        color='#c8ffdf'
      />
      {/* White-purple fringe */}
      <spotLight
        target={targetC}
        position={[0.2, 1.1, 6]}
        angle={0.11}
        penumbra={1}
        decay={0}
        intensity={5}
        color='#e2d6ff'
      />
      <primitive object={targetA} />
      <primitive object={targetB} />
      <primitive object={targetC} />
    </>
  )
}
