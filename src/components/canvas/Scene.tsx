import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { Preload, AdaptiveDpr, Environment, Lightformer } from '@react-three/drei'
import { useRef, type ComponentProps } from 'react'
import Rig from './Rig'
import CursorSpotlights from './CursorSpotlights'
import { useControls } from 'leva'
import { easing } from 'maath'
import { useInteraction } from '@/store'

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

  // Mysterious base state: barely-there key and ambient. The form is only
  // fully revealed by the white cursor spotlights; the sweep lights below
  // rake edges as they orbit past.
  const key = useControls('key light', {
    position: [2, 3, 7],
    intensity: { value: 0.6, min: 0, max: 10 },
    color: '#7c3aed',
  })
  const amb = useControls('ambient', {
    intensity: { value: 0.35, min: 0, max: 10 },
    color: '#ede9fe',
  })

  useFrame((state) => {
    if (keyLight.current) {
      // Gentle breathing so the scene feels alive without moving any light
      keyLight.current.intensity = key.intensity + Math.sin(state.clock.getElapsedTime() * 0.4) * 0.1
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

      {/* Faint fills so the silhouette is just barely separable from black */}
      <directionalLight intensity={0.25} color={'#c4b5fd'} position={[4, 3, 3]} />
      <directionalLight intensity={0.2} color={'#34d399'} position={[5, -2, 4]} />
      <pointLight position={[0, -4, 2]} intensity={0.3} decay={0} color={'#ede9fe'} distance={6} />
    </>
  )
}

// Neon sweep lights: orbit the full circle around the logo at different
// slow speeds. As each passes the front it rakes across edges of the shape,
// hinting at the form without revealing it — then slips behind and vanishes.
const SweepLights = () => {
  const s1 = useRef<THREE.SpotLight>(null)
  const s2 = useRef<THREE.SpotLight>(null)
  const s3 = useRef<THREE.SpotLight>(null)
  const target = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(0, 0, 2)
    return o
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (s1.current) s1.current.position.set(Math.sin(t * 0.11) * 5, 2.5, 2 + Math.cos(t * 0.11) * 5)
    if (s2.current) s2.current.position.set(Math.sin(t * 0.17 + 2) * 5, -1.5, 2 + Math.cos(t * 0.17 + 2) * 5)
    if (s3.current) s3.current.position.set(Math.sin(t * 0.07 + 4) * 6, 4, 2 + Math.cos(t * 0.07 + 4) * 6)
  })

  return (
    <>
      <primitive object={target} />
      <spotLight ref={s1} target={target} angle={0.45} penumbra={1} decay={0} intensity={2} color='#ff2d95' />
      <spotLight ref={s2} target={target} angle={0.45} penumbra={1} decay={0} intensity={1.8} color='#39ff14' />
      <spotLight ref={s3} target={target} angle={0.5} penumbra={1} decay={0} intensity={2.2} color='#8b5cf6' />
    </>
  )
}

// One camera vantage per service card; index 0 is the default framing.
// Clicking a card glides the camera there, changing the whole scene's mood.
const CAMERA_VIEWS: [number, number, number][] = [
  [0, 0, 5], // default: straight on
  [-2.5, -1.5, 4.5], // low-left: looking up, imposing
  [2.5, 2, 5.5], // high-right: looking down, overview
  [0.8, 0.5, 3.2], // close-up: intimate
]

const CameraRig = () => {
  useFrame((state, delta) => {
    const { view } = useInteraction.getState()
    easing.damp3(state.camera.position, CAMERA_VIEWS[view] ?? CAMERA_VIEWS[0], 0.6, delta)
    state.camera.lookAt(0, 0, 2)
  })
  return null
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
      <CameraRig />
      {/* Slow, wide tilt of the whole light rig gives a parallax feel */}
      <Rig intensity={0.3} smoothing={0.8}>
        <Lighting />
      </Rig>
      {/* Outside the Rig so their aim tracks the cursor exactly */}
      <CursorSpotlights />
      <SweepLights />
      {/* The logo material is near-black glossy metal: it lives off reflections,
       * so give it a procedural environment in brand colors to mirror. */}
      <Environment resolution={256}>
        <Lightformer intensity={1.5} color='#8b5cf6' position={[4, 2, 4]} scale={[4, 2, 1]} />
        <Lightformer intensity={1} color='#34d399' position={[-4, -1, 3]} scale={[3, 1.5, 1]} />
        <Lightformer intensity={2.5} color='#ffffff' position={[0, 4, -3]} scale={[5, 1, 1]} form='ring' />
        <Lightformer intensity={0.8} color='#ede9fe' position={[0, -3, 2]} scale={[6, 1, 1]} />
        <Lightformer intensity={0.8} color='#ff2d95' position={[-3, 3, 4]} scale={[2, 1, 1]} />
      </Environment>
      {children}
      <Preload all />
    </Canvas>
  )
}
