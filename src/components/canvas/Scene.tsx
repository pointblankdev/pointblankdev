import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Preload, AdaptiveDpr, Environment, Lightformer } from '@react-three/drei'
import { useRef, type ComponentProps } from 'react'
import Rig from './Rig'
import CursorSpotlights from './CursorSpotlights'

// Dev-only: expose the r3f state on window so the scene can be inspected
// and lights toggled from the browser console / automation.
const DebugBridge = () => {
  const three = useThree()
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      ;(window as unknown as { __three?: unknown }).__three = three
    }
  }, [three])
  return null
}

// Multi-light setup with animated positions and intensities
const Lighting = () => {
  const primaryLight = useRef<THREE.DirectionalLight>(null)
  const secondaryLight = useRef<THREE.DirectionalLight>(null)
  const accentLight1 = useRef<THREE.DirectionalLight>(null)
  const spotLight1 = useRef<THREE.SpotLight>(null)
  const spotLight2 = useRef<THREE.SpotLight>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (primaryLight.current) {
      primaryLight.current.position.x = Math.sin(t * 0.2) * 5
      primaryLight.current.position.z = Math.cos(t * 0.2) * 5
      primaryLight.current.intensity = 2.4 + Math.sin(t * 0.5) * 0.3
    }

    if (secondaryLight.current) {
      secondaryLight.current.position.x = Math.sin(t * 0.15 + Math.PI) * 4
      secondaryLight.current.position.z = Math.cos(t * 0.15 + Math.PI) * 4
      secondaryLight.current.intensity = 0.65 + Math.sin(t * 0.7) * 0.15
    }

    if (accentLight1.current) {
      accentLight1.current.position.x = Math.sin(t * 0.3) * 6
      accentLight1.current.position.y = Math.cos(t * 0.3) * 2 + 3
      accentLight1.current.intensity = 0.95 + Math.sin(t * 0.6) * 0.3
    }

    if (spotLight1.current) {
      spotLight1.current.position.x = Math.sin(t * 0.1) * 3
      spotLight1.current.position.z = Math.cos(t * 0.1) * 3
      spotLight1.current.target.position.set(Math.sin(t * 0.2), 0, Math.cos(t * 0.2))
      spotLight1.current.target.updateMatrixWorld()
    }

    if (spotLight2.current) {
      spotLight2.current.position.x = Math.sin(t * 0.15 + Math.PI) * 4
      spotLight2.current.position.z = Math.cos(t * 0.15 + Math.PI) * 4
      spotLight2.current.target.position.set(Math.sin(t * 0.3 + Math.PI), 0, Math.cos(t * 0.3 + Math.PI))
      spotLight2.current.target.updateMatrixWorld()
    }
  })

  return (
    <>
      {/* Main brand light - purple */}
      <directionalLight
        ref={primaryLight}
        intensity={2.4}
        color={'#7c3aed'}
        position={[-5, -5, -5]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Secondary brand light - green */}
      <directionalLight ref={secondaryLight} intensity={0.65} color={'#16a34a'} position={[-5, -2, -5]} />

      {/* Soft ambient lighting */}
      <ambientLight intensity={1.9} color={'#ede9fe'} />

      {/* Accent directional lights */}
      <directionalLight ref={accentLight1} intensity={0.95} color={'#c4b5fd'} position={[6, 3, 2]} />
      <directionalLight intensity={0.5} color={'#ddd6fe'} position={[3, -3, 4]} />

      {/* Spotlights for focused highlights */}
      <spotLight
        ref={spotLight1}
        position={[3, 5, 3]}
        angle={0.3}
        penumbra={0.8}
        intensity={1.9}
        decay={0}
        color={'#8b5cf6'}
        distance={10}
        castShadow
      />
      <spotLight
        ref={spotLight2}
        position={[-3, 4, -3]}
        angle={0.4}
        penumbra={0.7}
        intensity={1.6}
        decay={0}
        color={'#34d399'}
        distance={12}
        castShadow
      />

      {/* Bottom fill light */}
      <pointLight position={[0, -4, 2]} intensity={0.65} decay={0} color={'#ede9fe'} distance={6} />
    </>
  )
}

export default function Scene({ children, ...props }: ComponentProps<typeof Canvas>) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas
      {...props}
      dpr={[1, 2]}
      camera={{
        position: [0, 0, 5],
        fov: 45,
        near: 0.1,
        far: 1000,
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
    >
      <AdaptiveDpr pixelated />
      <DebugBridge />
      {/* Slow, wide tilt of the whole light rig gives a parallax feel */}
      <Rig intensity={0.3} smoothing={0.8}>
        <Lighting />
      </Rig>
      {/* Outside the Rig so their aim tracks the cursor exactly */}
      <CursorSpotlights />
      {/* The logo material is near-black glossy metal: it lives off reflections,
       * so give it a procedural environment in brand colors to mirror. */}
      <Environment resolution={256}>
        <Lightformer intensity={6} color='#8b5cf6' position={[4, 2, 4]} scale={[4, 2, 1]} />
        <Lightformer intensity={4} color='#34d399' position={[-4, -1, 3]} scale={[3, 1.5, 1]} />
        <Lightformer intensity={10} color='#ffffff' position={[0, 4, -3]} scale={[5, 1, 1]} form='ring' />
        <Lightformer intensity={3} color='#ede9fe' position={[0, -3, 2]} scale={[6, 1, 1]} />
      </Environment>
      {children}
      <Preload all />
    </Canvas>
  )
}
