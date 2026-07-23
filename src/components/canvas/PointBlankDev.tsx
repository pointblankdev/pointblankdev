import { Suspense, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'

const PointBlankDevComponent = () => {
  return (
    <Suspense fallback={null}>
      <Logo />
    </Suspense>
  )
}

const Logo = () => {
  const logo = useRef<THREE.Group>(null)
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (!logo.current) return
    logo.current.position.y = Math.sin(t) * 0.03
    logo.current.rotation.x = 0.13 + Math.PI / 4 + Math.cos(t / 3) * 0.1
    logo.current.rotation.y = Math.sin(t / 4) * 0.01
    logo.current.rotation.z = Math.sin(t) * 0.01
    logo.current.scale.setScalar(screen.height / 1000)
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
