import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

/*
 * The hero's one 3D moment: the Point Blank dog struck as a minted coin, built the same way as the
 * Charisma token coins (charisma/assets/video/token-tales): a silver rim with the name engraved around it
 * and a reeded edge, a green enamel field with an engine-turned sunburst, and the dog raised in black enamel
 * with polished silver bevels. It floats facing front, swaying a little and leaning toward the cursor, and catches
 * a glint every few seconds. Click it to flip it; click fast and the spins stack up.
 * Everything is generated in code; only the dog's vector outline is loaded.
 */

const TAU = Math.PI * 2
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

const COLORS = {
  silver: '#d4d6db',
  engrave: '#2f3236',
  enamel: '#7cb53a',
  green: '#8dc63f',
  deep: '#2c5414',
  enamelBlack: '#0e0f11',
  bevel: '#d2d5da',
}
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

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}
const ctx = (c: HTMLCanvasElement) => c.getContext('2d', { willReadFrequently: true })!
const tex = (c: HTMLCanvasElement, srgb: boolean, wrap = false) => {
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (wrap) t.wrapS = THREE.RepeatWrapping
  return t
}

// a height map (grey canvas) → a tangent-space normal map
function normalFromHeight(hc: HTMLCanvasElement, strength: number, wrapX = false) {
  const w = hc.width,
    h = hc.height,
    src = ctx(hc).getImageData(0, 0, w, h).data
  const out = canvas(w, h),
    ox = ctx(out),
    img = ox.createImageData(w, h),
    d = img.data
  const at = (x: number, y: number) => {
    x = wrapX ? (x + w) % w : clamp(x, 0, w - 1)
    y = clamp(y, 0, h - 1)
    return src[(y * w + x) * 4] / 255
  }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength,
        dy = (at(x, y + 1) - at(x, y - 1)) * strength
      const l = Math.hypot(dx, dy, 1),
        i = (y * w + x) * 4
      d[i] = ((-dx / l) * 0.5 + 0.5) * 255
      d[i + 1] = ((dy / l) * 0.5 + 0.5) * 255
      d[i + 2] = ((1 / l) * 0.5 + 0.5) * 255
      d[i + 3] = 255
    }
  ox.putImageData(img, 0, 0)
  return out
}

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

// the enamel field: brand green over an engine-turned (guilloché) sunburst
function fieldMaps() {
  const Z = 1024,
    h = Z / 2,
    ht = canvas(Z, Z),
    hx = ctx(ht),
    img = hx.createImageData(Z, Z),
    d = img.data
  for (let y = 0; y < Z; y++)
    for (let x = 0; x < Z; x++) {
      const dx = x - h,
        dy = y - h,
        r = Math.hypot(dx, dy) / h,
        a = Math.atan2(dy, dx)
      const v = 128 + 100 * Math.sin(a * 120 + 2.4 * Math.sin(r * 22)) * clamp(r * 6),
        i = (y * Z + x) * 4
      d[i] = d[i + 1] = d[i + 2] = v
      d[i + 3] = 255
    }
  hx.putImageData(img, 0, 0)
  const col = canvas(Z, Z),
    cx = ctx(col)
  const gr = cx.createRadialGradient(h * 0.75, h * 0.65, 0, h, h, h)
  gr.addColorStop(0, COLORS.green)
  gr.addColorStop(1, COLORS.enamel)
  cx.fillStyle = gr
  cx.fillRect(0, 0, Z, Z)
  cx.globalAlpha = 0.16
  cx.globalCompositeOperation = 'overlay'
  cx.drawImage(ht, 0, 0)
  return { map: tex(col, true), normal: tex(normalFromHeight(ht, 1.4), false) }
}

// a fine satin grain for the dog's face, like the raised design on a proof coin
function frostMap() {
  const Z = 512,
    ht = canvas(Z, Z),
    hx = ctx(ht),
    img = hx.createImageData(Z, Z),
    d = img.data
  for (let i = 0; i < Z * Z; i++) {
    const v = 128 + (Math.random() - 0.5) * 120
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v
    d[i * 4 + 3] = 255
  }
  hx.putImageData(img, 0, 0)
  const n = tex(normalFromHeight(ht, 1.1, true), false, true)
  n.wrapT = THREE.RepeatWrapping
  n.repeat.set(5, 5)
  return n
}

// soft boxes in brand colours, baked into the reflections
function studio(renderer: THREE.WebGLRenderer) {
  const s = new THREE.Scene()
  s.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(30, 32, 16),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0.04, 0.042, 0.04), side: THREE.BackSide }),
    ),
  )
  const panel = (w: number, h: number, color: string, k: number, pos: [number, number, number]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }),
    )
    m.position.set(...pos)
    m.lookAt(0, 0, 0)
    s.add(m)
  }
  panel(10, 3.5, '#ffffff', 5, [0, 7, 3]) // overhead key
  panel(2, 11, COLORS.green, 3.2, [-7, 0, 1.5]) // green strip, left
  panel(2, 11, '#cfe0ff', 2.6, [7, 0, -1]) // cool strip, right
  panel(14, 1.6, '#ffffff', 2, [0, 1.5, -8]) // rim from behind
  panel(1.2, 6, '#ffffff', 3, [-3, 1, 7]) // thin front strip for a crisp highlight
  panel(9, 5, '#f4f7ff', 0.9, [1, 2, 9]) // big soft front wash
  panel(6, 1, COLORS.green, 2, [0, -6, 2]) // green bounce from below
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(s, 0.03).texture
  pmrem.dispose()
  return env
}

// the dog, from its vector outline, struck into the field: sunk in, standing just a hair proud of it
const DOG_THICKNESS = 0.03 // total, bevels included
const DOG_RAISE = 0.012 // how much of that shows above the field
function dogGeometry(svg: ReturnType<SVGLoader['parse']>) {
  const shapes = svg.paths.flatMap((p) => p.toShapes())
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: 18,
    bevelEnabled: true,
    bevelThickness: 14,
    bevelSize: 6,
    bevelSegments: 5,
    curveSegments: 10,
  })
  geo.computeBoundingBox()
  const box = geo.boundingBox!,
    size = new THREE.Vector3(),
    mid = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(mid)
  const k = (RF * 2 * 0.74) / Math.max(size.x, size.y)
  geo.translate(-mid.x, -mid.y, -box.min.z)
  geo.scale(k, k, DOG_THICKNESS / size.z)
  geo.translate(0, 0, DOG_RAISE - DOG_THICKNESS) // the rest sits below the field, out of sight
  return geo
}

function useCoin(font: string) {
  const svg = useLoader(SVGLoader, '/pbd-mark.svg')
  const [coin] = useState(() => {
    const grp = new THREE.Group()
    grp.rotation.order = 'XYZ' // turn about the coin's own axis, then lean toward the viewer's cursor
    const rim = rimMaps(font),
      field = fieldMaps(),
      frost = frostMap()
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
    const enamel = new THREE.MeshPhysicalMaterial({
      map: field.map,
      emissive: '#ffffff',
      emissiveMap: field.map,
      emissiveIntensity: 0.22,
      normalMap: field.normal,
      normalScale: new THREE.Vector2(0.5, 0.5),
      metalness: 0,
      roughness: 0.42,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
    })
    // the dog in black enamel with a satin grain, edged in polished silver (ExtrudeGeometry groups: 0 = faces, 1 = sides)
    const face = new THREE.MeshPhysicalMaterial({
      color: COLORS.enamelBlack,
      metalness: 0.15,
      roughness: 0.5,
      normalMap: frost,
      normalScale: new THREE.Vector2(0.15, 0.15),
      clearcoat: 0.8,
      clearcoatRoughness: 0.12,
    })
    const bevel = new THREE.MeshPhysicalMaterial({ color: COLORS.bevel, metalness: 1, roughness: 0.12, clearcoat: 1 })
    const dog = dogGeometry(svg)
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

// at rest the coin shows its back face, turned slightly
const REST_TURN = Math.PI - 0.2

function Coin({ font, reduced, onReady }: { font: string; reduced: boolean; onReady: () => void }) {
  const coin = useCoin(font)
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
    spin.current.target += TAU
    glintAt.current = now.current // every flick catches the light
  }

  useFrame((state, delta) => {
    const t = (now.current = state.clock.elapsedTime)
    if (born.current === null) born.current = t
    const age = t - born.current
    // lean toward the cursor, eased
    const k = 1 - Math.exp(-delta * 3)
    lean.current.x += (pointer.current.y * 0.25 - lean.current.x) * k
    lean.current.y += (pointer.current.x * 0.45 - lean.current.y) * k
    // spin toward the target: fast when far, slowing as it lands
    const sp = spin.current
    sp.angle += (sp.target - sp.angle) * (1 - Math.exp(-delta * 2.4))
    if (Math.abs(sp.target - sp.angle) < 1e-4) sp.angle = sp.target
    // at rest it faces front and sways gently, floating
    const sway = reduced ? 0 : Math.sin((t * TAU) / 9) * 0.32 + Math.sin((t * TAU) / 5.3) * 0.06
    const bob = reduced ? 0 : Math.sin((t * TAU) / 4) * 0.06
    // no rising entrance: at its highest float and lean the coin's top must stay inside the canvas
    coin.position.set(0, bob, 0)
    coin.rotation.set(
      0.12 + Math.sin((t * TAU) / 8) * 0.05 + lean.current.x,
      REST_TURN + sway + sp.angle + lean.current.y,
      Math.sin((t * TAU) / 6) * 0.03,
    )
    coin.scale.setScalar(0.85 + 0.15 * smooth(0, 1.4, age))
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

export default function HeroCoin({ className }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null!)
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
            <Coin font={font} reduced={reduced} onReady={onReady} />
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
