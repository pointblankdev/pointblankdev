import { useEffect, useRef, useState } from 'react'
import Image, { type StaticImageData } from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import loop from '@/assets/work/loop.jpg'
import charisma from '@/assets/work/charisma.jpg'
import zesty from '@/assets/work/zesty.jpg'
import blazeWallet from '@/assets/work/blaze-wallet.jpg'

/*
 * Selected work: live, public products, each shown at its signature screen inside a browser frame
 * that carries its real address, in a rail that shows three at a time: swipe it, or use the arrows.
 * (Most client work is private, behind logins; the copy says so.)
 */

type Project = { name: string; url: string; image: StaticImageData; blurb: string; tags: string[] }

const PROJECTS: Project[] = [
  {
    name: 'Loop',
    url: 'https://loop.health',
    image: loop,
    blurb: 'A health membership with clinician-guided care, coaching and a member app.',
    tags: ['Next.js', 'Supabase', 'Stripe'],
  },
  {
    name: 'Charisma',
    url: 'https://charisma.rocks',
    image: charisma,
    blurb: 'An open-source DeFi suite on Stacks: swap at the best price, earn from liquidity, launch a token.',
    tags: ['DeFi', 'Open source', 'Real-time'],
  },
  {
    name: 'Blaze Wallet',
    url: 'https://wallet.charisma.rocks',
    image: blazeWallet,
    blurb: 'A Chrome wallet that signs once for limit orders and scheduled buys that run on their own.',
    tags: ['Browser extension', 'Security'],
  },
  {
    name: 'Zesty',
    url: 'https://zesty.charisma.rocks',
    image: zesty,
    blurb: 'Trade ZEST in three taps: pick a side, set a price, walk away. It sells for you.',
    tags: ['Trading', 'Automation'],
  },
]

const host = (url: string) => new URL(url).host

export default function Work() {
  const rail = useRef<HTMLUListElement>(null!)
  const [edge, setEdge] = useState({ start: true, end: false })

  // which arrows make sense depends on how far the rail is scrolled
  const measure = () => {
    const r = rail.current
    setEdge({ start: r.scrollLeft < 4, end: r.scrollLeft + r.clientWidth > r.scrollWidth - 4 })
  }
  useEffect(() => {
    const r = rail.current
    const onResize = () => {
      const start = r.scrollLeft < 4,
        end = r.scrollLeft + r.clientWidth > r.scrollWidth - 4
      setEdge((e) => (e.start === start && e.end === end ? e : { start, end }))
    }
    window.addEventListener('resize', onResize)
    onResize()
    return () => window.removeEventListener('resize', onResize)
  }, [])
  // one card per press
  const step = (dir: 1 | -1) => {
    const card = rail.current.querySelector('li')
    const gap = parseFloat(getComputedStyle(rail.current).columnGap) || 0
    rail.current.scrollBy({ left: dir * ((card?.offsetWidth ?? 0) + gap), behavior: 'smooth' })
  }

  return (
    <section className='work' id='work' aria-labelledby='work-title'>
      <header className='head'>
        <div className='titles'>
          <p className='eyebrow'>Selected work</p>
          <h2 id='work-title'>
            Shipped, <em>and still running.</em>
          </h2>
          <p className='note'>A few of our public products. Most client work lives behind logins.</p>
        </div>
        <div className='arrows'>
          <button type='button' aria-label='Previous project' disabled={edge.start} onClick={() => step(-1)}>
            <ArrowLeft size={18} strokeWidth={1.6} />
          </button>
          <button type='button' aria-label='Next project' disabled={edge.end} onClick={() => step(1)}>
            <ArrowRight size={18} strokeWidth={1.6} />
          </button>
        </div>
      </header>

      <ul className='rail' ref={rail} onScroll={measure} aria-label='Projects'>
        {PROJECTS.map((p) => (
          <li key={p.name}>
            <a className='card' href={p.url} target='_blank' rel='noopener noreferrer'>
              <div className='frame'>
                <div className='bar' aria-hidden='true'>
                  <i />
                  <i />
                  <i />
                  <span>{host(p.url)}</span>
                </div>
                <div className='shot'>
                  <Image
                    src={p.image}
                    alt={`${p.name}, screenshot`}
                    placeholder='blur'
                    sizes='(max-width: 900px) 85vw, 440px'
                  />
                </div>
              </div>
              <div className='meta'>
                <h3>
                  {p.name}
                  <span className='go' aria-hidden='true'>
                    ↗
                  </span>
                </h3>
                <p>{p.blurb}</p>
                <ul className='tags'>
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </a>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .work {
          display: grid;
          gap: 48px;
          max-width: 1360px;
          margin: 0 auto;
          padding: 40px clamp(16px, 4vw, 56px) 120px;
        }
        .head {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }
        .titles {
          display: grid;
          gap: 16px;
        }
        .arrows {
          display: flex;
          gap: 10px;
        }
        .arrows button {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          border: 1px solid var(--line);
          border-radius: 50%;
          background: transparent;
          color: var(--fg);
          cursor: pointer;
          transition: border-color 0.25s ease, color 0.25s ease, opacity 0.25s ease;
        }
        .arrows button:hover:not(:disabled) {
          border-color: rgba(141, 198, 63, 0.5);
          color: var(--green);
        }
        .arrows button:disabled {
          opacity: 0.3;
          cursor: default;
        }
        .arrows button:focus-visible {
          outline: 2px solid var(--green);
          outline-offset: 3px;
        }
        .eyebrow {
          margin: 0;
          font: 500 12px/1 var(--font-mono), monospace;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--dim);
        }
        h2 {
          margin: 0;
          font-family: var(--font-display), Georgia, serif;
          font-weight: 400;
          font-size: clamp(40px, 5vw, 68px);
          line-height: 1;
          letter-spacing: -0.02em;
          text-wrap: balance;
        }
        h2 em {
          color: var(--dim);
        }
        .note {
          margin: 0;
          font-size: 16px;
          color: var(--faint);
        }

        /* three cards in view; the rest slide in */
        .rail {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: calc((100% - 2 * 24px) / 3);
          gap: 24px;
          margin: 0;
          padding: 6px 0 4px; /* room for the hover lift */
          list-style: none;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          overscroll-behavior-x: contain;
          scrollbar-width: none;
        }
        .rail::-webkit-scrollbar {
          display: none;
        }
        .rail > li {
          scroll-snap-align: start;
          min-width: 0;
        }
        .card {
          display: grid;
          gap: 20px;
          text-decoration: none;
          color: inherit;
        }
        .frame {
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
          background: #111210;
          transition: border-color 0.35s ease, transform 0.35s ease;
        }
        .card:hover .frame {
          border-color: rgba(141, 198, 63, 0.4);
          transform: translateY(-3px);
        }
        .bar {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 11px 14px;
          border-bottom: 1px solid var(--line);
        }
        .bar i {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #2a2c28;
        }
        .bar span {
          margin-left: 10px;
          padding: 4px 12px;
          border-radius: 6px;
          background: #1a1b19;
          font: 400 12px/1.2 var(--font-mono), monospace;
          color: var(--dim);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .shot {
          overflow: hidden;
        }
        .shot :global(img) {
          display: block;
          width: 100%;
          height: auto;
          aspect-ratio: 1600 / 937; /* every card the same shape */
          object-fit: cover;
          object-position: top;
          filter: grayscale(1) contrast(1.05) brightness(0.92); /* keeps the page's palette; colour returns on hover */
          transition: transform 0.6s ease, filter 0.6s ease;
        }
        .card:hover .shot :global(img),
        .card:focus-visible .shot :global(img) {
          transform: scale(1.02);
          filter: none;
        }
        .meta {
          display: grid;
          gap: 8px;
        }
        h3 {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin: 0;
          font-family: var(--font-display), Georgia, serif;
          font-weight: 400;
          font-size: 28px;
          line-height: 1.1;
        }
        .go {
          font-family: var(--font-sans), sans-serif;
          font-size: 16px;
          color: var(--faint);
          transition: color 0.3s ease, transform 0.3s ease;
        }
        .card:hover .go {
          color: var(--green);
          transform: translate(2px, -2px);
        }
        .meta p {
          margin: 0;
          max-width: 40em;
          font-size: 15px;
          line-height: 1.55;
          color: var(--dim);
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 4px 0 0;
          padding: 0;
          list-style: none;
        }
        .tags li {
          padding: 5px 10px;
          border: 1px solid var(--line);
          border-radius: 999px;
          font: 500 11px/1 var(--font-mono), monospace;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--faint);
        }
        .card:focus-visible {
          outline: none;
        }
        .card:focus-visible .frame {
          outline: 2px solid var(--green);
          outline-offset: 3px;
        }

        @media (max-width: 1100px) {
          .rail {
            grid-auto-columns: calc((100% - 24px) / 2);
          }
        }
        @media (max-width: 680px) {
          .rail {
            grid-auto-columns: 85%;
            gap: 16px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .frame,
          .shot :global(img),
          .go {
            transition: none;
          }
        }
      `}</style>
    </section>
  )
}
