import { Canvas } from '@react-three/fiber'
import { OrbitControls, Preload } from '@react-three/drei'

export default function Scene({ children, ...props }) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas {...props}>
      <directionalLight intensity={0.75} color={'#733bbe'} />
      {/* <directionalLight intensity={0.1} color={'#ffffff'} /> */}
      <ambientLight intensity={1.0} color={'#733bbe'} />
      {/* <hemisphereLight intensity={15.0} skyColor={'#ffffff'} /> */}
      {children}
      <Preload all />
      {/* <OrbitControls /> */}
    </Canvas>
  )
}
