import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import {
  COLORS,
  TAU,
  canvas,
  clamp,
  ctx,
  dogGeometry,
  enamelMaterials,
  normalFromHeight,
  smooth,
  studio,
  tex,
} from './mint'
import { bucklerShield, kiteShield, padlock } from './emblems'

/*
 * The hero's one 3D moment: the Point Blank dog struck as a minted coin, built the same way as the
 * Charisma token coins (charisma/assets/video/token-tales): a silver rim with the name engraved around it
 * and a reeded edge, a green enamel field with an engine-turned sunburst, and the dog raised in black enamel
 * with polished silver bevels. It floats facing front, swaying a little and leaning toward the cursor, and catches
 * a glint every few seconds. Click it to flip it; click fast and the spins stack up.
 * Everything is generated in code; only the dog's vector outline is loaded.
 *
 * The same stage can show the emblem's other forms (see ./emblems): a kite shield, a buckler, or a padlock
 * whose shackle opens and closes when clicked. The page picks one; on the hero, ?hero=coin|kite|buckler|padlock
 * previews another.
 */

const RING_TEXT = 'POINT BLANK DEV · EST. 2020 · '

// the coin's profile, back field edge → around the rim → front field edge (r, z); the field radius is RF
const RF = 0.62
const PROFILE: [number, number][] = [
  [RF, -0.045],
  [0.655, -0.072],
  [0.9, -0.072],
  [0.93, -0.086],
  [0.965, -0.093],
  [0.99, -0.08],
  [1, -0.052],
  [1, 0.052],
  [0.99, 0.08],
  [0.965, 0.093],
  [0.93, 0.086],
  [0.9, 0.072],
  [0.655, 0.072],
  [RF, 0.045],
]
const RING_SEG: [number, number][] = [
  [1, 2],
  [11, 12],
] // the engraved band on the back and front faces
const EDGE_SEG: [number, number] = [6, 7] // the reeded edge

// the rim's surface, unwrapped: u runs around the coin, v along the profile
function rimMaps(font: string) {
  const w = 2048,
    h = 512,
    n = PROFILE.length - 1
  const band = ([a, b]: [number, number]) => [(1 - b / n) * h, (1 - a / n) * h]
  const col = canvas(w, h),
    cx = ctx(col),
    ht = canvas(w, h),
    hx = ctx(ht),
    rough = canvas(w, h),
    rx = ctx(rough)
  cx.fillStyle = COLORS.silver
  cx.fillRect(0, 0, w, h)
  hx.fillStyle = 'rgb(128,128,128)'
  hx.fillRect(0, 0, w, h)
  rx.fillStyle = 'rgb(0,46,255)' // G = roughness, B = metalness
  rx.fillRect(0, 0, w, h)
  // reeding: fine ridges all the way around the edge
  const [e0, e1] = band(EDGE_SEG)
  for (let x = 0; x < w; x++) {
    const v = Math.round(128 + 110 * Math.cos((x / w) * 240 * TAU))
    hx.fillStyle = `rgb(${v},${v},${v})`
    hx.fillRect(x, e0, 1, e1 - e0)
  }
  // the name, engraved around both faces, with a fine line either side
  for (const sg of RING_SEG) {
    // seen from the front, u runs the other way round the coin, so that band is drawn turned 180° to read clockwise
    const flip = sg === RING_SEG[1]
    const [y0, y1] = band(sg),
      bh = y1 - y0,
      mid = (y0 + y1) / 2
    const squash = bh / (0.9 - 0.655) / (w / (TAU * 0.78)) // keeps the letters' shape on the stretched band
    const size = (bh * 0.5) / squash
    for (const [c, fill] of [
      [cx, COLORS.engrave],
      [hx, 'rgb(40,40,40)'],
      [rx, 'rgb(0,150,200)'],
    ] as [CanvasRenderingContext2D, string][]) {
      c.save()
      c.translate(flip ? w : 0, mid)
      c.scale(flip ? -1 : 1, flip ? -squash : squash)
      c.font = `500 ${size}px ${font}`
      c.letterSpacing = `${size * 0.32}px`
      const one = c.measureText(RING_TEXT).width,
        reps = Math.max(1, Math.floor(w / one))
      c.letterSpacing = `${size * 0.32 + (w - reps * one) / (reps * RING_TEXT.length)}px`
      c.fillStyle = fill
      c.textBaseline = 'middle'
      c.textAlign = 'left'
      c.fillText(RING_TEXT.repeat(reps), 0, 0)
      c.restore()
      c.fillStyle = fill
      c.fillRect(0, y0 + bh * 0.1, w, 2)
      c.fillRect(0, y1 - bh * 0.1 - 2, w, 2)
    }
  }
  hx.filter = 'blur(1px)'
  hx.drawImage(ht, 0, 0)
  hx.filter = 'none'
  return {
    map: tex(col, true, true),
    normal: tex(normalFromHeight(ht, 3.2, true), false, true),
    rough: tex(rough, false, true),
  }
}

function useCoin(font: string) {
  const svg = useLoader(SVGLoader, '/pbd-mark.svg')
  const [coin] = useState(() => {
    const grp = new THREE.Group()
    grp.rotation.order = 'XYZ' // turn about the coin's own axis, then lean toward the viewer's cursor
    const rim = rimMaps(font)
    const lathe = new THREE.LatheGeometry(
      PROFILE.map(([r, z]) => new THREE.Vector2(r, z)),
      256,
    )
    lathe.rotateX(Math.PI / 2)
    grp.add(
      new THREE.Mesh(
        lathe,
        new THREE.MeshPhysicalMaterial({
          color: '#ffffff',
          envMapIntensity: 2.4,
          map: rim.map,
          normalMap: rim.normal,
          roughnessMap: rim.rough,
          metalnessMap: rim.rough,
          roughness: 1,
          metalness: 1,
          clearcoat: 0.3,
          clearcoatRoughness: 0.1,
        }),
      ),
    )
    // the green enamel field, and the dog in black enamel edged in polished silver
    const { enamel, face, bevel } = enamelMaterials()
    const dog = dogGeometry(svg, RF * 2 * 0.74)
    for (const side of [1, -1]) {
      const f = new THREE.Mesh(new THREE.CircleGeometry(RF + 0.002, 192), enamel)
      const m = new THREE.Mesh(dog, [face, bevel])
      for (const o of [f, m]) {
        o.position.z = side * 0.045
        if (side < 0) o.rotation.y = Math.PI
        grp.add(o)
      }
    }
    return grp
  })
  return coin
}

const usePointer = () => {
  const p = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const move = (e: PointerEvent) => {
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1
      p.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
  return p
}

// how each one floats: the coin rests on its back face, turned slightly, and sways wide; the other forms are
// taller (and curved), so they face front and only drift a little, never seeming to turn away
type Motion = { rest: number; sway: number; lean: number }
const COIN_MOTION: Motion = { rest: Math.PI - 0.2, sway: 1, lean: 1 }
const FORM_MOTION: Motion = { rest: -0.05, sway: 0.25, lean: 0.5 }

export type EmblemShape = 'coin' | 'kite' | 'buckler' | 'padlock'
const FORMS = { kite: kiteShield, buckler: bucklerShield, padlock }

type StageProps = { reduced: boolean; onReady: () => void }

function Coin({ font, ...stage }: StageProps & { font: string }) {
  return <Emblem object={useCoin(font)} motion={COIN_MOTION} {...stage} />
}

function Form({ shape, ...stage }: StageProps & { shape: Exclude<EmblemShape, 'coin'> }) {
  const svg = useLoader(SVGLoader, '/pbd-mark.svg')
  const [object] = useState(() => FORMS[shape](svg))
  return <Emblem object={object} motion={FORM_MOTION} {...stage} />
}

// the emblem afloat: swaying, leaning toward the cursor, catching a glint; a click flips it (or, if the emblem
// has its own press, such as the padlock's shackle, does that instead)
function Emblem({ object: coin, motion, reduced, onReady }: StageProps & { object: THREE.Object3D; motion: Motion }) {
  const pointer = usePointer()
  const lean = useRef({ x: 0, y: 0 })
  const born = useRef<number | null>(null)
  const now = useRef(0)
  // each click adds a full turn to where the coin is headed; it eases there, so rapid clicks pile up
  // into a faster, longer spin that always lands facing front
  const spin = useRef({ angle: 0, target: 0 })
  const glintAt = useRef(0)
  const key = useRef<THREE.SpotLight>(null!)
  const pool = useRef<THREE.Sprite>(null!)

  useEffect(onReady, [onReady])

  const flick = () => {
    if (coin.userData.press) coin.userData.press()
    else spin.current.target += TAU
    glintAt.current = now.current // every flick catches the light
  }

  useFrame((state, delta) => {
    const t = (now.current = state.clock.elapsedTime)
    if (born.current === null) born.current = t
    const age = t - born.current
    // lean toward the cursor, eased
    const k = 1 - Math.exp(-delta * 3)
    lean.current.x += (pointer.current.y * 0.25 - lean.current.x) * k
    lean.current.y += (pointer.current.x * 0.45 * motion.lean - lean.current.y) * k
    // spin toward the target: fast when far, slowing as it lands
    const sp = spin.current
    sp.angle += (sp.target - sp.angle) * (1 - Math.exp(-delta * 2.4))
    if (Math.abs(sp.target - sp.angle) < 1e-4) sp.angle = sp.target
    // at rest it faces front and sways gently, floating
    const sway = reduced ? 0 : (Math.sin((t * TAU) / 9) * 0.32 + Math.sin((t * TAU) / 5.3) * 0.06) * motion.sway
    const bob = reduced ? 0 : Math.sin((t * TAU) / 4) * 0.06
    // no rising entrance: at its highest float and lean the coin's top must stay inside the canvas
    coin.position.set(0, bob, 0)
    coin.rotation.set(
      0.12 + Math.sin((t * TAU) / 8) * 0.05 + lean.current.x,
      motion.rest + sway + sp.angle + lean.current.y,
      Math.sin((t * TAU) / 6) * 0.03,
    )
    coin.scale.setScalar(0.85 + 0.15 * smooth(0, 1.4, age))
    coin.userData.update?.(delta)
    // the glint: a light sweeps across the face every seven seconds, and on every click
    if (t - glintAt.current > 7) glintAt.current = t
    const g = reduced ? 1 : (t - glintAt.current) / 1.2
    key.current.intensity = g < 1 ? 26 * Math.sin(Math.PI * g) : 0
    key.current.position.set(-6 + 12 * clamp(g), 4 - 6 * clamp(g), 6)
    // the pool of light under the coin brightens as it dips
    pool.current.material.opacity = 0.32 - bob * 1.4
    pool.current.scale.set(2.2 - bob * 2, 0.3 - bob * 0.3, 1)
  })

  return (
    <>
      <primitive
        object={coin}
        onPointerDown={flick}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = '')}
      />
      <spotLight ref={key} angle={0.3} penumbra={1} decay={2} distance={20} intensity={0} color='#ffffff' />
      <sprite ref={pool} position={[0, -1.0, -0.5]}>
        <spriteMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color={COLORS.green}
          opacity={0.3}
          map={glowTexture()}
        />
      </sprite>
    </>
  )
}

let GLOW: THREE.Texture | null = null
function glowTexture() {
  if (GLOW) return GLOW
  const c = canvas(128, 128),
    x = ctx(c),
    g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,.35)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 128, 128)
  GLOW = new THREE.CanvasTexture(c)
  return GLOW
}

// the studio's reflections, built once and attached to the scene
function Studio() {
  const gl = useThree((s) => s.gl)
  const [env] = useState(() => studio(gl))
  return <primitive object={env} attach='environment' />
}

// embers: where each one starts, how big, how fast (fixed, so server and client agree)
const EMBERS = Array.from({ length: 16 }, (_, i) => ({
  left: `${14 + ((i * 37) % 72)}%`,
  size: 3 + (i % 3) * 2,
  duration: `${7 + (i % 5) * 1.6}s`,
  delay: `${-i * 0.9}s`,
  drift: `${(i % 2 ? 1 : -1) * 30}px`,
  white: i % 3 === 0,
}))

type HeroCoinProps = { className?: string; shape?: EmblemShape; previewable?: boolean }

export default function HeroCoin({ className, shape = 'coin', previewable = false }: HeroCoinProps) {
  const wrap = useRef<HTMLDivElement>(null!)
  // on the previewable one, ?hero=coin (or kite, buckler, padlock) shows another form without changing the page
  const [form] = useState<EmblemShape>(() => {
    const q = previewable ? new URLSearchParams(window.location.search).get('hero') : null
    return q === 'coin' || (q && q in FORMS) ? (q as EmblemShape) : shape
  })
  const [font, setFont] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  // Client-only component (loaded with ssr: false), so window is available on first render
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [onReady] = useState(() => () => setReady(true))

  useEffect(() => {
    // the engraving uses the page's mono face; wait for it so the coin never bakes in a fallback
    const family = getComputedStyle(wrap.current).getPropertyValue('--font-mono').trim() || 'monospace'
    // load just the real face (the generated fallback can't be fetched), and never let a hiccup block the coin
    document.fonts
      .load(`500 40px ${family.split(',')[0]}`)
      .catch(() => undefined)
      .then(() => setFont(family))
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    // stop rendering once the hero scrolls out of view
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    io.observe(wrap.current)
    return () => {
      mq.removeEventListener('change', onChange)
      io.disconnect()
    }
  }, [])

  return (
    <div ref={wrap} className={`coin-stage ${ready ? 'is-ready' : ''} ${className ?? ''}`} aria-hidden='true'>
      <div className='rays' />
      <div className='halo' />
      <div className='embers'>
        {EMBERS.map((e, i) => (
          <i
            key={i}
            className={e.white ? 'white' : undefined}
            style={{
              left: e.left,
              width: e.size,
              height: e.size,
              animationDuration: e.duration,
              animationDelay: e.delay,
              ['--drift' as string]: e.drift,
            }}
          />
        ))}
      </div>
      {font && (
        <Canvas
          frameloop={visible ? 'always' : 'never'}
          dpr={[1, 2]}
          camera={{ position: [0, 0, 4.7], fov: 30 }} // far enough that float + lean never clip the rim
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.1
          }}
        >
          <Suspense fallback={null}>
            <Studio />
            {form === 'coin' ? (
              <Coin font={font} reduced={reduced} onReady={onReady} />
            ) : (
              <Form shape={form} reduced={reduced} onReady={onReady} />
            )}
          </Suspense>
        </Canvas>
      )}

      <style jsx>{`
        .coin-stage {
          position: relative;
          opacity: 0;
          transition: opacity 1.4s ease;
        }
        .coin-stage.is-ready {
          opacity: 1;
        }
        .coin-stage :global(canvas) {
          position: relative;
          z-index: 1;
        }
        /* light rays turning slowly behind the coin */
        .rays {
          position: absolute;
          inset: -8%;
          background: repeating-conic-gradient(
            from 0deg,
            rgba(141, 198, 63, 0.24) 0deg 3deg,
            transparent 3deg 14deg,
            rgba(255, 255, 255, 0.1) 14deg 15.5deg,
            transparent 15.5deg 24deg
          );
          -webkit-mask-image: radial-gradient(closest-side, #000 18%, transparent 72%);
          mask-image: radial-gradient(closest-side, #000 18%, transparent 72%);
          animation: turn 120s linear infinite;
        }
        .halo {
          position: absolute;
          inset: 12%;
          border-radius: 50%;
          background: radial-gradient(
            closest-side,
            rgba(141, 198, 63, 0.28),
            rgba(141, 198, 63, 0.08) 55%,
            transparent
          );
          filter: blur(10px);
          animation: breathe 4s ease-in-out infinite;
        }
        /* embers drifting up, far behind */
        .embers i {
          position: absolute;
          bottom: 8%;
          border-radius: 50%;
          background: ${COLORS.green};
          box-shadow: 0 0 12px 2px rgba(141, 198, 63, 0.7);
          opacity: 0;
          animation: rise 8s linear infinite;
        }
        .embers i.white {
          background: #fff;
          box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.5);
        }
        @keyframes turn {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes breathe {
          50% {
            transform: scale(1.06);
            opacity: 0.8;
          }
        }
        @keyframes rise {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-420px) translateX(var(--drift)) scale(1);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .rays,
          .halo {
            animation: none;
          }
          .embers {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
