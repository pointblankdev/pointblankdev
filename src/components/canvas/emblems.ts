import * as THREE from 'three'
import type { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { TessellateModifier } from 'three/examples/jsm/modifiers/TessellateModifier.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { COLORS, TAU, dogGeometry, enamelMaterials, smooth } from './mint'

/*
 * The hero emblem's other forms, struck like the coin: a polished silver frame, the green enamel field with
 * its engine-turned sunburst, and the dog raised in black enamel.
 *   kite     a tall Norman shield, bent gently across like the real thing, riveted round the frame
 *   buckler  a small round shield with a domed face
 *   padlock  a laminated hardware-store lock with the dog on its bumper band; press it and the shackle pops up
 *            and swings open, press again to lock it
 * The shields are built flat, finely tessellated, then pressed into their curve; their backs are dark steel
 * with a leather grip, since a shield has an inside.
 */

type V2 = THREE.Vector2
type Svg = ReturnType<SVGLoader['parse']>
type Curve = {
  f: (x: number, y: number) => number
  fx: (x: number, y: number) => number
  fy: (x: number, y: number) => number
}

type Spec = {
  outline: V2[] // the edge, closed, without a repeated last point
  depth: number // half the body's thickness
  edge: number // how rounded the body's edge is
  frame: number // width of the silver frame
  rivets: number
  dog: { span: number; y: number }
  sunburst: { y: number; size: number } // where the field's sunburst centres, and how wide it is
  grip?: number // width of the grip on the back
  curve: Curve
}

// signed area: positive when the outline runs counter-clockwise
const area = (p: V2[]) =>
  p.reduce((a, q, i) => {
    const r = p[(i + 1) % p.length]
    return a + q.x * r.y - r.x * q.y
  }, 0) / 2

// the outline moved inward by d, mitred at the corners
function inset(p: V2[], d: number) {
  const ccw = area(p) > 0,
    n = p.length
  const inward = (a: V2, b: V2) => {
    const dx = b.x - a.x,
      dy = b.y - a.y,
      l = Math.hypot(dx, dy) || 1
    return ccw ? new THREE.Vector2(-dy / l, dx / l) : new THREE.Vector2(dy / l, -dx / l)
  }
  return p.map((q, i) => {
    const na = inward(p[(i - 1 + n) % n], q),
      nb = inward(q, p[(i + 1) % n]),
      m = na.clone().add(nb).normalize()
    return q.clone().addScaledVector(m, d * Math.min(3, 1 / Math.max(0.2, m.dot(na))))
  })
}

// split long triangles so a flat-built surface can bend smoothly
const fine = (geo: THREE.BufferGeometry, edge = 0.03) => new TessellateModifier(edge, 10).modify(geo)

// everything drawn in one material of a (non-indexed) geometry, as its own geometry. An extrusion of several
// shapes (the dog is its head, eye and ear) has a lid group and a side group per shape, so gather them all.
function part(geo: THREE.BufferGeometry, material: number) {
  const groups = geo.groups.filter((g) => g.materialIndex === material),
    count = groups.reduce((n, g) => n + g.count, 0),
    out = new THREE.BufferGeometry()
  for (const name of ['position', 'normal', 'uv']) {
    const a = geo.getAttribute(name) as THREE.BufferAttribute,
      k = a.itemSize,
      arr = new Float32Array(count * k)
    let o = 0
    for (const g of groups) {
      arr.set(a.array.slice(g.start * k, (g.start + g.count) * k), o)
      o += g.count * k
    }
    out.setAttribute(name, new THREE.BufferAttribute(arr, k))
  }
  return out
}

// press a flat geometry into the emblem's curve: z drops by f(x, y), and the normals tilt to match
function press(geo: THREE.BufferGeometry, { f, fx, fy }: Curve) {
  const pos = geo.getAttribute('position'),
    nor = geo.getAttribute('normal'),
    n = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i),
      y = pos.getY(i),
      nz = nor.getZ(i)
    pos.setZ(i, pos.getZ(i) - f(x, y))
    n.set(nor.getX(i) + fx(x, y) * nz, nor.getY(i) + fy(x, y) * nz, nz).normalize()
    nor.setXYZ(i, n.x, n.y, n.z)
  }
  pos.needsUpdate = nor.needsUpdate = true
  geo.computeBoundingSphere()
  return geo
}

// flat UVs for the enamel, so the sunburst sits round and centred where it should
function planarUV(geo: THREE.BufferGeometry, cy: number, size: number) {
  const pos = geo.getAttribute('position'),
    uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / size + 0.5
    uv[i * 2 + 1] = (pos.getY(i) - cy) / size + 0.5
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  return geo
}

const silverMaterial = (roughness = 0.2) =>
  new THREE.MeshPhysicalMaterial({
    color: COLORS.silver,
    metalness: 1,
    roughness,
    clearcoat: 0.3,
    clearcoatRoughness: 0.1,
    envMapIntensity: 2.4,
  })

function strike(svg: Svg, s: Spec) {
  const grp = new THREE.Group()
  const { enamel, face, bevel } = enamelMaterials()
  const silver = silverMaterial()
  const steel = new THREE.MeshPhysicalMaterial({
    color: '#2b2e33',
    metalness: 0.9,
    roughness: 0.45,
    envMapIntensity: 1.6,
  })
  const dark = new THREE.MeshStandardMaterial({ color: '#1c1612', roughness: 0.85 })
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material) => grp.add(new THREE.Mesh(press(geo, s.curve), mat))
  const T = s.depth,
    P = s.outline,
    inner = inset(P, s.frame)

  // the body's rounded silver edge (its flat faces are covered by the field in front and the steel behind)
  const body = new THREE.ExtrudeGeometry(new THREE.Shape(P), {
    depth: 2 * (T - s.edge),
    bevelEnabled: true,
    bevelThickness: s.edge,
    bevelSize: s.edge,
    bevelSegments: 6,
    curveSegments: 1,
  })
  body.translate(0, 0, s.edge - T)
  add(part(body, 1), silver)

  // the raised frame around the field
  const ring = new THREE.Shape(P)
  ring.holes.push(new THREE.Path(inner))
  const frame = new THREE.ExtrudeGeometry(ring, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.01,
    bevelSegments: 4,
    curveSegments: 1,
  })
  frame.translate(0, 0, T)
  add(fine(frame), silver)

  // rivets along the middle of the frame
  const mid = inset(P, s.frame / 2)
  for (let k = 0; k < s.rivets; k++) {
    const q = mid[Math.round((k * mid.length) / s.rivets) % mid.length]
    const rivet = new THREE.SphereGeometry(0.026, 18, 8, 0, TAU, 0, Math.PI / 2)
    rivet.rotateX(Math.PI / 2)
    rivet.translate(q.x, q.y, T + 0.024)
    add(rivet, silver)
  }

  // the green enamel field, tucked just under the frame's inner edge
  const field = planarUV(
    fine(new THREE.ShapeGeometry(new THREE.Shape(inset(P, s.frame * 0.7)))),
    s.sunburst.y,
    s.sunburst.size,
  )
  field.translate(0, 0, T + 0.001)
  add(field, enamel)

  // the dog: its black enamel face and polished silver bevels, both bent with the field
  const dog = dogGeometry(svg, s.dog.span)
  dog.translate(0, s.dog.y, T + 0.001)
  add(fine(part(dog, 0), 0.02), face)
  add(fine(part(dog, 1), 0.02), bevel)

  // the inside: dark steel and a leather grip
  const back = fine(new THREE.ShapeGeometry(new THREE.Shape(inset(P, 0.004))))
  back.rotateY(Math.PI)
  back.translate(0, 0, -T - 0.001)
  add(back, steel)
  if (s.grip) {
    const grip = new THREE.BoxGeometry(s.grip, 0.075, 0.05, 24, 1, 1)
    grip.translate(0, s.dog.y, -T - 0.04)
    add(grip, dark)
  }
  return grp
}

// wrap a built emblem so the hero can scale, turn and centre it freely
function mount(inner: THREE.Object3D, lift = 0, scale = 1) {
  const outer = new THREE.Group()
  outer.rotation.order = 'XYZ' // turn about the emblem's own axis, then lean toward the viewer's cursor
  inner.position.y = lift
  inner.scale.setScalar(scale)
  outer.add(inner)
  return outer
}

// a kite (Norman) shield: a gently arched top, sides that swell then sweep down to a point
function kiteOutline() {
  const path = new THREE.Path()
  path.moveTo(-0.72, 0.7)
  path.quadraticCurveTo(0, 0.92, 0.72, 0.7)
  path.bezierCurveTo(0.78, 0.15, 0.45, -0.55, 0, -1.12)
  path.bezierCurveTo(-0.45, -0.55, -0.78, 0.15, -0.72, 0.7)
  return path.getSpacedPoints(320).slice(0, -1)
}

const circleOutline = (r: number, n = 256) =>
  Array.from({ length: n }, (_, i) => new THREE.Vector2(Math.cos((i / n) * TAU) * r, Math.sin((i / n) * TAU) * r))

export function kiteShield(svg: Svg) {
  const B = 0.2 // how far it bends back across its width
  const shield = strike(svg, {
    outline: kiteOutline(),
    depth: 0.05,
    edge: 0.018,
    frame: 0.1,
    rivets: 14,
    dog: { span: 0.92, y: 0.16 },
    sunburst: { y: 0.16, size: 1.7 },
    grip: 0.8,
    curve: { f: (x) => B * x * x, fx: (x) => 2 * B * x, fy: () => 0 },
  })
  return mount(shield, 0.12)
}

export function bucklerShield(svg: Svg) {
  const R = 2.4 // the dome's radius of curvature: smaller is rounder
  const shield = strike(svg, {
    outline: circleOutline(1),
    depth: 0.05,
    edge: 0.018,
    frame: 0.16,
    rivets: 12,
    dog: { span: 0.92, y: 0 },
    sunburst: { y: 0, size: 1.7 },
    grip: 0.5,
    curve: { f: (x, y) => (x * x + y * y) / (2 * R), fx: (x) => x / R, fy: (_, y) => y / R },
  })
  return mount(shield)
}

// a laminated padlock, after the classic hardware-store kind: a stack of steel plates, a green enamel bumper
// band carrying the dog between engraved lines, rivets at the corners, and a tall chrome shackle
const LOCK = { w: 1.2, h: 1.12, d: 0.42, plates: 16, band: 0.4 }
// the shackle: its long left leg stays in the body as the short right leg pops out, rises this far, then swings
// this far open about the long leg
const SHACKLE = { legX: 0.34, long: 0.06, short: 0.44, top: 0.98, rise: 0.36, swing: 0.75, tube: 0.09 }

export function padlock(svg: Svg) {
  const lock = new THREE.Group()
  const { w, h, d, plates, band } = LOCK
  const steel = new THREE.MeshPhysicalMaterial({
    color: '#c9ccd2',
    metalness: 1,
    roughness: 0.3,
    clearcoat: 0.2,
    envMapIntensity: 2.2,
  })
  const polished = silverMaterial(0.08)
  const { face, bevel } = enamelMaterials()

  // the laminations: thin rounded plates, stacked with a hairline between each
  const pitch = h / plates,
    plate = new RoundedBoxGeometry(w, pitch - 0.006, d, 2, 0.022)
  for (let i = 0; i < plates; i++) {
    const m = new THREE.Mesh(plate, steel)
    m.position.y = -h / 2 + pitch * (i + 0.5)
    lock.add(m)
  }

  // the bumper band in green enamel, wrapped round the lower plates
  const by = -h / 2 + 0.07 + band / 2,
    front = d / 2 + 0.02
  const bumper = new THREE.Mesh(
    new RoundedBoxGeometry(w + 0.04, band, d + 0.04, 4, 0.05),
    new THREE.MeshPhysicalMaterial({
      color: COLORS.enamel,
      emissive: COLORS.enamel,
      emissiveIntensity: 0.15,
      roughness: 0.35,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    }),
  )
  bumper.position.y = by
  lock.add(bumper)

  // the dog on the band, flanked by three engraved lines each side
  const dog = new THREE.Mesh(dogGeometry(svg, band * 0.84), [face, bevel])
  dog.position.set(0, by, front)
  lock.add(dog)
  const line = new THREE.BoxGeometry(0.2, 0.016, 0.006)
  for (const side of [-1, 1])
    for (const k of [-1, 0, 1]) {
      const m = new THREE.Mesh(line, face)
      m.position.set(side * 0.3, by + k * 0.05, front + 0.002)
      lock.add(m)
    }

  // rivets at the corners, front and back
  const rivet = new THREE.SphereGeometry(0.03, 18, 8, 0, TAU, 0, Math.PI / 2)
  rivet.rotateX(Math.PI / 2)
  for (const side of [1, -1])
    for (const [x, y, z] of [
      [w / 2 - 0.09, h / 2 - pitch / 2, d / 2],
      [w / 2 - 0.08, by, front],
    ])
      for (const sx of [1, -1]) {
        const m = new THREE.Mesh(rivet, polished)
        m.position.set(sx * x, y, side * z)
        if (side < 0) m.rotation.y = Math.PI
        lock.add(m)
      }

  // the shackle: a polished U, built with its long leg on the pivot so it can swing open
  const { legX, long, short, top, tube } = SHACKLE
  const u = new THREE.CurvePath<THREE.Vector3>()
  u.add(new THREE.LineCurve3(new THREE.Vector3(0, long, 0), new THREE.Vector3(0, top, 0)))
  const arc = new THREE.EllipseCurve(legX, top, legX, legX, Math.PI, 0, true)
  u.add(
    new THREE.CatmullRomCurve3(
      arc.getPoints(48).map((p) => new THREE.Vector3(p.x, p.y, 0)),
      false,
      'centripetal',
    ),
  )
  u.add(new THREE.LineCurve3(new THREE.Vector3(2 * legX, top, 0), new THREE.Vector3(2 * legX, short, 0)))
  const pivot = new THREE.Group()
  pivot.position.x = -legX
  pivot.add(new THREE.Mesh(new THREE.TubeGeometry(u, 200, tube, 28, false), polished))
  for (const [x, y] of [
    [0, long],
    [2 * legX, short],
  ]) {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(tube, 28, 14), polished) // round off the tube's open ends
    cap.position.set(x, y, 0)
    pivot.add(cap)
  }
  lock.add(pivot)

  // locked (0) to open (1): first the shackle rises clear of the body, then it swings
  const state = { open: 0, target: 0 }
  const object = mount(lock, -0.47, 0.9)
  object.userData.press = () => (state.target = state.target ? 0 : 1)
  object.userData.update = (delta: number) => {
    state.open += (state.target - state.open) * (1 - Math.exp(-delta * 5))
    pivot.position.y = smooth(0, 0.55, state.open) * SHACKLE.rise
    pivot.rotation.y = -smooth(0.45, 1, state.open) * SHACKLE.swing
  }
  return object
}
