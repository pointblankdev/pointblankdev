import { Suspense, useEffect, useRef } from 'react'
import { Environment, useGLTF, useHelper, useProgress } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
// import { SpotLightHelper } from 'three'

const PointBlankDevComponent = () => {
  return (
    <Suspense fallback={null}>
      <Logo />
    </Suspense>
  )
}

const Logo = () => {
  let t = 0
  const mesh = {
    position: [0, 0, 1],
    rotation: [Math.PI / 4, 0, 0],
    scale: [1, 1, 1],
  }
  const logo = useRef({} as any)
  useFrame((state, delta) => {
    console.log(screen.width)
    t += delta
    logo.current.position.y = Math.sin(t) * 0.03
    logo.current.rotation.x = 0.13 + Math.PI / 4 + Math.cos(t / 3) * 0.1
    logo.current.rotation.y = Math.sin(t / 4) * 0.01
    logo.current.rotation.z = Math.sin(t) * 0.01
    logo.current.scale.x = screen.height / 1000
    logo.current.scale.y = screen.height / 1000
    logo.current.scale.z = screen.height / 1000
  })
  const { nodes, materials } = useGLTF('point-blank-dev.glb', true)
  return (
    <group ref={logo} scale={mesh.scale} rotation={mesh.rotation} position={mesh.position}>
      <mesh material={materials['SVGMat.001']} geometry={nodes.Curve1.geometry} />
      <mesh material={materials['SVGMat.001']} geometry={nodes.Curve2.geometry} />
      <mesh material={materials['SVGMat.001']} geometry={nodes.Curve3.geometry} />
      <mesh material={materials['SVGMat.001']} geometry={nodes.Curve4.geometry} />
    </group>
  )
}
export default PointBlankDevComponent
