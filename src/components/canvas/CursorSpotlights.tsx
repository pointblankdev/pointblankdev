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
      // All three beams converge tightly on the cursor point; the tinted
      // pair trail slightly for a hint of chromatic lag
      easing.damp3(targetA.position, [hit.x, hit.y, 2], 0.08, delta)
      easing.damp3(targetB.position, [hit.x + 0.04, hit.y + 0.03, 2], 0.16, delta)
      easing.damp3(targetC.position, [hit.x - 0.04, hit.y - 0.03, 2], 0.2, delta)
    }
  })

  return (
    <>
      {/* Pure white core beam, near the camera axis */}
      <spotLight
        target={targetA}
        position={[0.4, 1, 6]}
        angle={0.08}
        penumbra={0.85}
        decay={0}
        intensity={12}
        color='#ffffff'
      />
      {/* White-green, from the right — catches right-facing bevels */}
      <spotLight
        target={targetB}
        position={[4.5, -1, 5]}
        angle={0.13}
        penumbra={1}
        decay={0}
        intensity={5}
        color='#c8ffdf'
      />
      {/* White-purple, from the upper-left — catches left/top bevels */}
      <spotLight
        target={targetC}
        position={[-4.5, 3.5, 5]}
        angle={0.13}
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
