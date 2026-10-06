/* eslint-disable @next/next/no-img-element -- small static logo files; next/image adds nothing here */
import type { ReactNode } from 'react'
import { Instrument_Serif, Orbitron } from 'next/font/google'

/*
 * Client logo marquee. Every logo is shown in one muted white so the strip reads as a set.
 * Logos without a usable file (or whose logo is just a mark plus a typeface) are rebuilt
 * from their mark and their own brand font.
 */

const orbitron = Orbitron({ subsets: ['latin'], weight: '600', preload: false })
const instrument = Instrument_Serif({ subsets: ['latin'], weight: '400', preload: false })

const Img = ({ src, h }: { src: string; h: number }) => <img src={src} alt='' style={{ height: h }} />

// Apex Growth's zigzag mark, from apexgrowth.co
const ApexMark = () => (
  <svg viewBox='0 0 24 24' fill='none' style={{ height: 26 }}>
    <path
      d='M2.5 19.5 L9 8.5 L13 14 L20 3.5'
      stroke='currentColor'
      strokeWidth='2.6'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <circle cx='20' cy='3.5' r='2.9' fill='currentColor' />
  </svg>
)

// Blockbeat's bracket mark, from blockbeat.io
const BracketMark = () => (
  <svg viewBox='0 0 20 20' fill='none' style={{ height: 24 }}>
    <path
      stroke='currentColor'
      strokeLinecap='square'
      strokeWidth='1.667'
      d='M5.833 3.333h-2.5v13.334h2.5m8.333-13.334h2.5v13.334h-2.5'
    />
  </svg>
)

const CLIENTS: { name: string; logo: ReactNode }[] = [
  { name: 'Google', logo: <Img src='/logos/google.svg' h={30} /> },
  { name: 'AWS', logo: <Img src='/logos/aws.svg' h={36} /> },
  { name: 'Discover', logo: <Img src='/logos/discover.svg' h={20} /> },
  { name: 'Comcast', logo: <Img src='/logos/comcast.svg' h={40} /> },
  { name: 'Unisys', logo: <Img src='/logos/unisys.svg' h={24} /> },
  { name: 'Loop', logo: <Img src='/logos/loop.png' h={19} /> },
  {
    name: 'Stacks',
    logo: (
      <>
        <Img src='/logos/stacks-mark.svg' h={24} />
        <span className='word'>Stacks</span>
      </>
    ),
  },
  { name: 'Abra', logo: <Img src='/logos/abra.svg' h={24} /> },
  { name: 'MBX Systems', logo: <Img src='/logos/mbx.png' h={38} /> },
  { name: 'Gather', logo: <Img src='/logos/gather.svg' h={30} /> },
  {
    name: 'Apex Growth',
    logo: (
      <>
        <ApexMark />
        <span className='word' style={{ ...instrument.style, fontSize: 30, fontWeight: 400, letterSpacing: 0 }}>
          Apex Growth
        </span>
      </>
    ),
  },
  {
    name: 'Blockbeat',
    logo: (
      <>
        <BracketMark />
        <span className='word' style={{ ...orbitron.style, fontSize: 20, letterSpacing: '0.04em' }}>
          BLOCKBEAT
        </span>
      </>
    ),
  },
  { name: 'Innovative Solutions & Support', logo: <span className='word'>IS&amp;S</span> },
  { name: 'Merkatta', logo: <span className='word'>Merkatta</span> },
  { name: 'Tango', logo: <Img src='/logos/tango.png' h={30} /> },
  {
    name: 'Charisma',
    logo: (
      <>
        <Img src='/logos/charisma-mark.png' h={30} />
        <span className='word'>Charisma</span>
      </>
    ),
  },
]

export default function ClientLogos() {
  return (
    <div className='marquee'>
      <ul className='track'>
        {[...CLIENTS, ...CLIENTS].map(({ name, logo }, i) => (
          <li key={i} aria-hidden={i >= CLIENTS.length || undefined}>
            <span className='sr'>{name}</span>
            <span className='logo' aria-hidden='true'>
              {logo}
            </span>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .marquee {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
        }
        .track {
          display: flex;
          align-items: center;
          width: max-content;
          gap: 76px;
          margin: 0;
          padding: 0 38px;
          list-style: none;
          animation: scroll 70s linear infinite;
        }
        .marquee:hover .track {
          animation-play-state: paused;
        }
        li {
          display: flex;
          align-items: center;
          height: 44px;
        }
        .logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }
        li:hover .logo {
          opacity: 0.9;
        }
        .logo :global(img) {
          display: block;
          width: auto;
          filter: brightness(0) invert(1);
        }
        .logo :global(.word) {
          font: 600 22px/1 var(--font-sans), sans-serif;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }
        .sr {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }
        @keyframes scroll {
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .track {
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
            width: auto;
            gap: 24px 48px;
          }
          li[aria-hidden] {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
