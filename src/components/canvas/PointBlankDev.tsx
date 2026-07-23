import { Suspense, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import type * as THREE from 'three'
import Rig from './Rig'
import { useInteraction } from '@/store'

const PointBlankDevComponent = () => {
  return (
    <Suspense fallback={null}>
      {/* Rig owns pointer tilt; Logo owns idle animation + pulse underneath */}
      <Rig>
        <Logo />
      </Rig>
    </Suspense>
  )
}

const Logo = () => {
  const logo = useRef<THREE.Group>(null)
  const height = useThree((s) => s.size.height)
  const baseScale = height / 1000
  const pulse = useRef({ seen: 0, strength: 0 })

  useFrame((state, delta) => {
    if (!logo.current) return
    const t = state.clock.getElapsedTime()

    // Click pulse: DOM handlers bump pulseCount in the store; we animate a
    // short scale pop here without any React re-render.
    const { pulseCount } = useInteraction.getState()
    if (pulseCount !== pulse.current.seen) {
      pulse.current.seen = pulseCount
      pulse.current.strength = 1
    }
    pulse.current.strength = Math.max(0, pulse.current.strength - delta * 2)

    // Idle bob and wobble
    logo.current.position.y = Math.sin(t) * 0.03
    logo.current.rotation.x = 0.13 + Math.PI / 4 + Math.cos(t / 3) * 0.1
    logo.current.rotation.y = Math.sin(t / 4) * 0.01
    logo.current.rotation.z = Math.sin(t) * 0.01

    logo.current.scale.setScalar(baseScale * (1 + 0.08 * Math.sin(pulse.current.strength * Math.PI)))
  })
  const { nodes, materials } = useGLTF('point-blank-dev.glb', true)
  const material = materials['SVGMat.001']
  return (
    <group ref={logo} rotation={[Math.PI / 4, 0, 0]} position={[0, 0, 2]}>
      <mesh material={material} geometry={(nodes.Curve1 as THREE.Mesh).geometry} />
      <mesh material={material} geometry={(nodes.Curve2 as THREE.Mesh).geometry} />
      <mesh material={material} geometry={(nodes.Curve3 as THREE.Mesh).geometry} />
      <mesh material={material} geometry={(nodes.Curve4 as THREE.Mesh).geometry} />
    </group>
  )
}
export default PointBlankDevComponent
