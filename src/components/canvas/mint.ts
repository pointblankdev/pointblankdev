import * as THREE from 'three'
import type { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

/*
 * The mint: what every hero emblem (the coin, and the shield variants) is struck from. Canvas-made textures,
 * the studio reflections, the enamel materials, and the dog raised from its vector outline.
 */

export const TAU = Math.PI * 2
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export const COLORS = {
  silver: '#d4d6db',
  engrave: '#2f3236',
  enamel: '#7cb53a',
  green: '#8dc63f',
  deep: '#2c5414',
  enamelBlack: '#0e0f11',
  bevel: '#d2d5da',
}

export const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}
export const ctx = (c: HTMLCanvasElement) => c.getContext('2d', { willReadFrequently: true })!
export const tex = (c: HTMLCanvasElement, srgb: boolean, wrap = false) => {
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (wrap) t.wrapS = THREE.RepeatWrapping
  return t
}

// a height map (grey canvas) → a tangent-space normal map
export function normalFromHeight(hc: HTMLCanvasElement, strength: number, wrapX = false) {
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

// the green enamel field, and the dog in black enamel with a satin grain, edged in polished silver
// (ExtrudeGeometry groups: 0 = faces, 1 = sides, so the dog takes [face, bevel])
export function enamelMaterials() {
  const field = fieldMaps(),
    frost = frostMap()
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
  return { enamel, face, bevel }
}

// soft boxes in brand colours, baked into the reflections
export function studio(renderer: THREE.WebGLRenderer) {
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

// the dog, from its vector outline, struck into the field: sunk in, standing just a hair proud of it.
// span is the dog's longer side in scene units; the field is at z = 0.
export const DOG_THICKNESS = 0.03 // total, bevels included
export const DOG_RAISE = 0.012 // how much of that shows above the field
export function dogGeometry(svg: ReturnType<SVGLoader['parse']>, span: number) {
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
  const k = span / Math.max(size.x, size.y)
  geo.translate(-mid.x, -mid.y, -box.min.z)
  geo.scale(k, k, DOG_THICKNESS / size.z)
  geo.translate(0, 0, DOG_RAISE - DOG_THICKNESS) // the rest sits below the field, out of sight
  return geo
}
