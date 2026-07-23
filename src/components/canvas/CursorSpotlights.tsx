import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'

// The logo group sits at z=2; aim the lights at that plane.
const LOGO_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2)

/**
 * The reveal flashlight: a TIGHT white beam that follows the cursor across
 * the logo's plane, plus a faint wider halo. Only the small portion of the
 * asset under the beam is visible at once — move the mouse to explore the
 * rest of the form. Everything else in the scene only hints at the shape.
 */
export default function CursorSpotlights() {
  const targetA = useMemo(() => new THREE.Object3D(), [])
  const targetB = useMemo(() => new THREE.Object3D(), [])
  const hit = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    state.raycaster.setFromCamera(state.pointer, state.camera)
    if (state.raycaster.ray.intersectPlane(LOGO_PLANE, hit)) {
      // Beam leads tight on the cursor; halo trails slightly behind it
      easing.damp3(targetA.position, [hit.x, hit.y, 2], 0.1, delta)
      easing.damp3(targetB.position, [hit.x, hit.y, 2], 0.28, delta)
    }
  })

  return (
    <>
      {/* Tight reveal beam — narrow cone, near the camera axis so the pool
       * stays round on the face */}
      <spotLight
        target={targetA}
        position={[0.5, 1, 6]}
        angle={0.13}
        penumbra={0.9}
        decay={0}
        intensity={7}
        color='#ffffff'
      />
      {/* Faint trailing halo hinting just beyond the beam's edge */}
      <spotLight
        target={targetB}
        position={[-0.5, -0.5, 6]}
        angle={0.24}
        penumbra={1}
        decay={0}
        intensity={1.2}
        color='#ffffff'
      />
      <primitive object={targetA} />
      <primitive object={targetB} />
    </>
  )
}
