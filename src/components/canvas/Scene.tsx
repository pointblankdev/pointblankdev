import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { Preload, AdaptiveDpr, Environment, Lightformer } from '@react-three/drei'
import { useRef, type ComponentProps } from 'react'
import Rig from './Rig'
import CursorSpotlights from './CursorSpotlights'
import { useControls } from 'leva'

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

// Deterministic light rig: fixed, composed positions — the logo looks the
// same on every load. Motion comes only from pointer-driven effects
// (Rig tilt, CursorSpotlights) and a subtle breathing on the key light.
// Key/ambient remain tunable via the ?debug Leva panel.
const Lighting = () => {
  const keyLight = useRef<THREE.DirectionalLight>(null)

  // The logo faces the camera, so the key must sit near the camera axis
  // (high front) for its light to reflect into view — overhead would graze.
  const key = useControls('key light', {
    position: [2, 3, 7],
    intensity: { value: 2.2, min: 0, max: 10 },
    color: '#7c3aed',
  })
  const amb = useControls('ambient', {
    intensity: { value: 1.5, min: 0, max: 10 },
    color: '#ede9fe',
  })

  useFrame((state) => {
    if (keyLight.current) {
      // Gentle breathing so the scene feels alive without moving any light
      keyLight.current.intensity = key.intensity + Math.sin(state.clock.getElapsedTime() * 0.4) * 0.2
    }
  })

  return (
    <>
      {/* Key: purple, directly overhead — see note above */}
      <directionalLight
        ref={keyLight}
        intensity={key.intensity}
        color={key.color}
        position={key.position}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Soft ambient base */}
      <ambientLight intensity={amb.intensity} color={amb.color} />

      {/* Static fills and accents, all front hemisphere */}
      <directionalLight intensity={0.9} color={'#c4b5fd'} position={[4, 3, 3]} />
      <directionalLight intensity={0.5} color={'#ddd6fe'} position={[3, -3, 4]} />
      <directionalLight intensity={0.6} color={'#34d399'} position={[5, -2, 4]} />

      {/* Bottom fill glow */}
      <pointLight position={[0, -4, 2]} intensity={0.65} decay={0} color={'#ede9fe'} distance={6} />
    </>
  )
}

// Static neon accent spots from four different quadrants: each grazes a
// different set of bevel edges on the face-on extrusion, adding dimension.
// All share one target on the logo plane.
const AccentSpots = () => {
  const target = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(0, 0, 2)
    return o
  }, [])
  return (
    <>
      <primitive object={target} />
      {/* Neon pink, upper-left */}
      <spotLight target={target} position={[-4, 4, 4]} angle={0.5} penumbra={1} decay={0} intensity={4} color='#ff2d95' />
      {/* Neon green, lower-right */}
      <spotLight target={target} position={[5, -2, 3]} angle={0.5} penumbra={1} decay={0} intensity={3.5} color='#39ff14' />
      {/* Soft pink rim, lower-left, grazing */}
      <spotLight target={target} position={[-5, -3, 2.5]} angle={0.6} penumbra={1} decay={0} intensity={3} color='#ff6ec7' />
      {/* Brand green, upper-right, grazing */}
      <spotLight target={target} position={[4, 5, 2]} angle={0.55} penumbra={1} decay={0} intensity={3.5} color='#34d399' />
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
      <AccentSpots />
      {/* The logo material is near-black glossy metal: it lives off reflections,
       * so give it a procedural environment in brand colors to mirror. */}
      <Environment resolution={256}>
        <Lightformer intensity={6} color='#8b5cf6' position={[4, 2, 4]} scale={[4, 2, 1]} />
        <Lightformer intensity={4} color='#34d399' position={[-4, -1, 3]} scale={[3, 1.5, 1]} />
        <Lightformer intensity={10} color='#ffffff' position={[0, 4, -3]} scale={[5, 1, 1]} form='ring' />
        <Lightformer intensity={3} color='#ede9fe' position={[0, -3, 2]} scale={[6, 1, 1]} />
        <Lightformer intensity={2.5} color='#ff2d95' position={[-3, 3, 4]} scale={[2, 1, 1]} />
      </Environment>
      {children}
      <Preload all />
    </Canvas>
  )
}
