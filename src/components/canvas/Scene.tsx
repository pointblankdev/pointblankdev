
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Preload, AdaptiveDpr } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { Glitch } from '@react-three/postprocessing'

// Performance optimization component
const PerformanceOptimizer = () => {
  const { gl, performance } = useThree()

  useEffect(() => {
    // Optimize rendering performance
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Handle device performance
    if (performance.current < 1) {
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 1))
    }
  }, [gl, performance])

  return null
}

// Create dynamic lighting based on time
const DynamicLighting = () => {
  const [time, setTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => (prev + 0.01) % 1)
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Pulsating light intensities based on time
  const primaryIntensity = 0.75 + Math.sin(time * Math.PI * 2) * 0.1
  const ambientIntensity = 1.0 + Math.sin(time * Math.PI * 2 + Math.PI) * 0.1

  return (
    <>
      <directionalLight
        intensity={primaryIntensity}
        color={'#733bbe'}
        position={[1, 1, -5]}
        castShadow
      />
      <directionalLight
        intensity={0.2}
        color={'#733bbe'}
        position={[-5, -5, -5]}
      />
      <ambientLight
        intensity={ambientIntensity}
        color={'#733bbe'}
      />
      <pointLight
        position={[-1, 20, 0]}
        intensity={0.0001}
        color={'#ffffff'}
        distance={200}
      />
    </>
  )
}

// Enhanced multi-light setup with dynamic behaviors
const EnhancedLighting = () => {
  const [time, setTime] = useState(0)

  // Create refs for all our lights for animation and helpers
  const primaryLight = useRef()
  const secondaryLight = useRef()
  const accentLight1 = useRef()
  const accentLight2 = useRef()
  const accentLight3 = useRef()
  const accentLight4 = useRef()
  const spotLight1 = useRef()
  const spotLight2 = useRef()

  // Uncomment if you want to see the light helpers during development
  // useHelper(primaryLight, DirectionalLightHelper, 1, 'red')
  // useHelper(secondaryLight, DirectionalLightHelper, 1, 'green')
  // useHelper(spotLight1, SpotLightHelper, 'blue')
  // useHelper(spotLight2, SpotLightHelper, 'yellow')

  // Animate lights over time
  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // Orbit lights around in different paths and speeds
    if (primaryLight.current) {
      primaryLight.current.position.x = Math.sin(t * 0.2) * 5
      primaryLight.current.position.z = Math.cos(t * 0.2) * 5
      primaryLight.current.intensity = 0.75 + Math.sin(t * 0.5) * 0.1
    }

    if (secondaryLight.current) {
      secondaryLight.current.position.x = Math.sin(t * 0.15 + Math.PI) * 4
      secondaryLight.current.position.z = Math.cos(t * 0.15 + Math.PI) * 4
      secondaryLight.current.intensity = 0.2 + Math.sin(t * 0.7) * 0.05
    }

    if (accentLight1.current) {
      accentLight1.current.position.x = Math.sin(t * 0.3) * 6
      accentLight1.current.position.y = Math.cos(t * 0.3) * 2 + 3
      accentLight1.current.intensity = 0.3 + Math.sin(t * 0.6) * 0.1
    }

    if (accentLight2.current) {
      accentLight2.current.position.x = Math.sin(t * 0.25 + Math.PI) * 4
      accentLight2.current.position.y = Math.cos(t * 0.25 + Math.PI) * 1 + 2
      accentLight2.current.intensity = 0.25 + Math.sin(t * 0.8) * 0.1
    }

    if (spotLight1.current) {
      spotLight1.current.position.x = Math.sin(t * 0.1) * 3
      spotLight1.current.position.z = Math.cos(t * 0.1) * 3

      // Make spotlight follow a target position
      const targetX = Math.sin(t * 0.2) * 1
      const targetZ = Math.cos(t * 0.2) * 1
      spotLight1.current.target.position.set(targetX, 0, targetZ)
      spotLight1.current.target.updateMatrixWorld()
    }

    if (spotLight2.current) {
      spotLight2.current.position.x = Math.sin(t * 0.15 + Math.PI) * 4
      spotLight2.current.position.z = Math.cos(t * 0.15 + Math.PI) * 4

      // Make spotlight follow another target position
      const targetX = Math.sin(t * 0.3 + Math.PI) * 1
      const targetZ = Math.cos(t * 0.3 + Math.PI) * 1
      spotLight2.current.target.position.set(targetX, 0, targetZ)
      spotLight2.current.target.updateMatrixWorld()
    }
  })

  return (
    <>
      {/* Main brand light - purple */}
      <directionalLight
        ref={primaryLight}
        intensity={0.75}
        color={'#7c3aed'} // Purple from your theme
        position={[-5, -5, -5]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Secondary brand light - green */}
      <directionalLight
        ref={secondaryLight}
        intensity={0.2}
        color={'#16a34a'} // Green from your theme
        position={[-5, -2, -5]}
      />

      {/* Soft ambient lighting */}
      <ambientLight
        intensity={0.6}
        color={'#ede9fe'} // Light purple
      />

      {/* Accent directional lights with different colors */}
      <directionalLight
        ref={accentLight1}
        intensity={0.3}
        color={'#c4b5fd'} // Purple-300
        position={[6, 3, 2]}
      />

      <directionalLight
        ref={accentLight2}
        intensity={0.25}
        color={'#a7f3d0'} // Green-200
        position={[-4, 2, -30]}
      />

      <directionalLight
        ref={accentLight3}
        intensity={0.15}
        color={'#ddd6fe'} // Purple-200
        position={[3, -3, 4]}
      />

      <directionalLight
        ref={accentLight4}
        intensity={0.2}
        color={'#d8b4fe'} // Purple/Pink blend
        position={[-2, 4, -20]}
      />

      {/* Spotlights for focused highlights */}
      <spotLight
        ref={spotLight1}
        position={[3, 5, 3]}
        angle={0.3}
        penumbra={0.8}
        intensity={0.6}
        color={'#8b5cf6'} // Purple-500
        distance={10}
        castShadow
      />

      <spotLight
        ref={spotLight2}
        position={[-3, 4, -3]}
        angle={0.4}
        penumbra={0.7}
        intensity={0.5}
        color={'#34d399'} // Green-400
        distance={12}
        castShadow
      />

      {/* Rim light from behind */}
      <pointLight
        position={[0, -2, -5]}
        intensity={0.4}
        color={'#fafafa'}
        distance={8}
      />

      {/* Bottom fill light */}
      <pointLight
        position={[0, -4, 2]}
        intensity={0.2}
        color={'#ede9fe'} // Light purple
        distance={6}
      />
    </>
  )
}


export default function Scene({ children, ...props }) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas
      {...props}
      dpr={[1, 2]} // Responsive device pixel ratio
      camera={{
        position: [0, 0, 5],
        fov: 45,
        near: 0.1,
        far: 1000
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      }}
    >
      {/* Performance optimization */}
      <PerformanceOptimizer />
      <AdaptiveDpr pixelated />

      {/* Dynamic lighting system */}
      <DynamicLighting />

      <EnhancedLighting />

      {/* Scene content */}
      {children}

      {/* Preload all assets */}
      <Preload all />
    </Canvas>
  )
}