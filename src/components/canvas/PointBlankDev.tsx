import { Suspense, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
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
  // The GLB ships with a PURE BLACK base color — and a metal's reflection
  // tint is its base color, so black metal reflects nothing. Clone (the
  // useGLTF material is a shared cache) and re-tint to a dark brand purple
  // so the logo mirrors the environment and lights. Tunable via ?debug.
  const mat = useControls('material', {
    color: '#4c3a75',
    metalness: { value: 0.9, min: 0, max: 1 },
    roughness: { value: 0.22, min: 0, max: 1 },
    envMapIntensity: { value: 1.5, min: 0, max: 10 },
  })
  const material = useMemo(() => {
    const m = (materials['SVGMat.001'] as THREE.MeshStandardMaterial).clone()
    m.color.set(mat.color)
    m.metalness = mat.metalness
    m.roughness = mat.roughness
    m.envMapIntensity = mat.envMapIntensity
    return m
  }, [materials, mat.color, mat.metalness, mat.roughness, mat.envMapIntensity])
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
