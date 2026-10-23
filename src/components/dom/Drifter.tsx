import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import type { EmblemShape } from '@/components/canvas/HeroCoin'

/*
 * Eye candy: one of the emblem's forms drifting in beside a section. On wide screens it slides in from the side
 * into the empty gutter, hovers there (drifting a little slower than the page) while its section is in view, then
 * slides back out as you scroll past. On phones there's no gutter, so it pops into a corner as the section arrives
 * and ducks back out. It mounts only as its section comes near, and sits out entirely for reduced motion.
 */

const HeroCoin = dynamic(() => import('@/components/canvas/HeroCoin'), { ssr: false })

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => t * t * (3 - 2 * t)

type Props = { section: string; shape: EmblemShape; side: 'left' | 'right' }

export default function Drifter({ section, shape, side }: Props) {
  const el = useRef<HTMLDivElement>(null!)
  const [near, setNear] = useState(false)

  useEffect(() => {
    const target = document.getElementById(section)
    if (!target) return
    // build the 3D emblem only once its section is within a screen or so
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '100% 0px' })
    io.observe(target)

    let raf = 0
    const place = () => {
      raf = 0
      const r = target.getBoundingClientRect(),
        vh = window.innerHeight
      // wide screens: in as the section rises into view, out as it scrolls away
      const shown = ease(clamp(Math.min((vh - r.top) / (vh * 0.4), r.bottom / (vh * 0.4))))
      // phones: a brief pop while the section's top passes through the middle of the screen
      const peek = ease(clamp(Math.min((vh * 0.95 - r.top) / (vh * 0.2), (r.top + vh * 0.15) / (vh * 0.2))))
      const drift = (r.top + r.height / 2 - vh / 2) * 0.12 // a little slower than the page
      el.current.style.setProperty('--shown', shown.toFixed(3))
      el.current.style.setProperty('--peek', peek.toFixed(3))
      el.current.style.setProperty('--drift', `${drift.toFixed(1)}px`)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(place)
    }
    place()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [section])

  return (
    <div ref={el} className={`drifter ${side}`} aria-hidden='true'>
      {near && <HeroCoin shape={shape} className='emblem' />}

      <style jsx>{`
        .drifter {
          /* as wide as the gutter allows; the gutter is what's left beside the page's 1360px column */
          --size: clamp(150px, calc((100vw - 1360px) / 2 + 90px), 300px);
          --rest: max(calc(var(--size) * -0.35), calc((100vw - 1360px) / 4 + 28px - var(--size) / 2));
          position: fixed;
          top: 50%;
          z-index: 3;
          width: var(--size);
          aspect-ratio: 1;
          opacity: var(--shown, 0);
          pointer-events: none;
          will-change: transform, opacity;
        }
        .right {
          right: var(--rest);
          transform: translate(calc((1 - var(--shown, 0)) * (100% + 80px)), calc(-50% + var(--drift, 0px)));
        }
        .left {
          left: var(--rest);
          transform: translate(calc((var(--shown, 0) - 1) * (100% + 80px)), calc(-50% + var(--drift, 0px)));
        }
        .drifter :global(.emblem) {
          width: 100%;
          height: 100%;
        }
        /* just the emblem and its glow: no rays or embers out here */
        .drifter :global(.rays),
        .drifter :global(.embers) {
          display: none;
        }
        /* where the gutter is wide enough not to cover anything, it can be clicked (flipped, or unlocked) */
        @media (min-width: 1600px) {
          .drifter {
            pointer-events: auto;
          }
        }
        /* phones: a small pop into the lower corner, half tucked off the edge */
        @media (max-width: 900px) {
          .drifter {
            --size: 112px;
            top: auto;
            bottom: 84px;
            opacity: var(--peek, 0);
          }
          .right {
            right: -22px;
            transform: translateX(calc((1 - var(--peek, 0)) * 130%)) scale(calc(0.6 + 0.4 * var(--peek, 0)));
          }
          .left {
            left: -22px;
            transform: translateX(calc((var(--peek, 0) - 1) * 130%)) scale(calc(0.6 + 0.4 * var(--peek, 0)));
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .drifter {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
