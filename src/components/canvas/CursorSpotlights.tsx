import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'

// The logo group sits at z=2; aim the lights at that plane.
const LOGO_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2)

/**
 * Two colored spotlights that chase the cursor across the logo's plane.
 * Each frame the pointer is raycast onto the plane and the light targets
 * ease toward the hit point — offset from each other so the purple and
 * green beams cross-light the logo instead of stacking.
 */
export default function CursorSpotlights() {
  const targetA = useMemo(() => new THREE.Object3D(), [])
  const targetB = useMemo(() => new THREE.Object3D(), [])
  const hit = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    state.raycaster.setFromCamera(state.pointer, state.camera)
    if (state.raycaster.ray.intersectPlane(LOGO_PLANE, hit)) {
      // The purple light leads; the green one trails slightly behind it.
      easing.damp3(targetA.position, [hit.x + 0.25, hit.y + 0.15, 2], 0.12, delta)
      easing.damp3(targetB.position, [hit.x - 0.25, hit.y - 0.15, 2], 0.3, delta)
    }
  })

  return (
    <>
      <spotLight
        target={targetA}
        position={[2.5, 2.5, 5]}
        angle={0.35}
        penumbra={1}
        decay={0}
        intensity={1.6}
        color='#8b5cf6'
      />
      <spotLight
        target={targetB}
        position={[-2.5, -1.5, 5]}
        angle={0.4}
        penumbra={1}
        decay={0}
        intensity={1.1}
        color='#34d399'
      />
      <primitive object={targetA} />
      <primitive object={targetB} />
    </>
  )
}
