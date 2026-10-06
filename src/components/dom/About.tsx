import type { ReactNode } from 'react'
import Image, { type StaticImageData } from 'next/image'
import { User } from 'lucide-react'
import ross from '@/assets/about/ross.jpg'

/*
 * The team: the founder (a real photo), a panel of expert peers brought in by project, and Claude, the AI
 * teammate, drawn as an original warm sparkle rather than Anthropic's own mark. Then Ross at a glance.
 *
 * To add an expert: drop their headshot in src/assets/about/, import it, and add them to EXPERTS.
 * Once EXPERTS has anyone in it, their cards replace the panel placeholder.
 */

const FACTS: [string, string][] = [
  ['6+ years', 'running Point Blank Dev, since 2020'],
  ['Fractional CTO', 'for startups in fintech, AI, esports, health and commerce'],
  ['$25M+', 'in transaction volume through Charisma, which we built and run'],
  ['Every layer', 'DevOps, backend, frontend, testing, AI and security'],
]

// Claude's portrait: warm clay light and a four-point sparkle
const ClaudeArt = () => (
  <svg viewBox='0 0 400 400' role='img' aria-label='A warm sparkle standing in for Claude'>
    <defs>
      <radialGradient id='clay' cx='38%' cy='34%' r='80%'>
        <stop offset='0' stopColor='#f0b894' />
        <stop offset='0.45' stopColor='#d97757' />
        <stop offset='1' stopColor='#5b2616' />
      </radialGradient>
      <radialGradient id='glow' cx='50%' cy='50%' r='50%'>
        <stop offset='0' stopColor='#fff4ea' stopOpacity='0.55' />
        <stop offset='1' stopColor='#fff4ea' stopOpacity='0' />
      </radialGradient>
    </defs>
    <rect width='400' height='400' fill='url(#clay)' />
    {[150, 110, 70].map((r) => (
      <circle key={r} cx='200' cy='200' r={r} fill='none' stroke='#fff4ea' strokeOpacity='0.12' />
    ))}
    <circle cx='200' cy='200' r='120' fill='url(#glow)' />
    <path
      d='M200 92 C208 168 232 192 308 200 C232 208 208 232 200 308 C192 232 168 208 92 200 C168 192 192 168 200 92 Z'
      fill='#fff8f1'
    />
    <path
      d='M318 92 C320 108 326 114 342 116 C326 118 320 124 318 140 C316 124 310 118 294 116 C310 114 316 108 318 92 Z'
      fill='#fff8f1'
      fillOpacity='0.8'
    />
    <path
      d='M96 286 C97 296 101 300 111 301 C101 302 97 306 96 316 C95 306 91 302 81 301 C91 300 95 296 96 286 Z'
      fill='#fff8f1'
      fillOpacity='0.6'
    />
  </svg>
)

// The expert panel, until real headshots arrive
const PanelArt = () => (
  <div className='panel-art' aria-hidden='true'>
    {[0, 1, 2].map((i) => (
      <span key={i}>
        <User size={44} strokeWidth={1.2} />
      </span>
    ))}
    <style jsx>{`
      .panel-art {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: radial-gradient(70% 60% at 50% 40%, #23251f, #0c0d0b);
      }
      span {
        display: grid;
        place-items: center;
        width: 31%;
        aspect-ratio: 1;
        margin: 0 -3.5%;
        border-radius: 50%;
        border: 3px solid #0e0f0d;
        background: linear-gradient(160deg, #4a4d54, #24262a);
        color: rgba(236, 236, 232, 0.7);
      }
      span:nth-child(2) {
        z-index: 1;
        transform: translateY(-6%) scale(1.08);
        background: linear-gradient(160deg, #6f9e33, #2f5416);
      }
    `}</style>
  </div>
)

type Member = { name: string; role: string; bio: string; pic: ReactNode }

// Senior peers, each an expert in their field (photo: a square headshot)
type Expert = { name: string; field: string; bio: string; photo: StaticImageData }
const EXPERTS: Expert[] = []

const PANEL: Member[] = EXPERTS.length
  ? EXPERTS.map((e) => ({
      name: e.name,
      role: e.field,
      bio: e.bio,
      pic: <Image src={e.photo} alt={`${e.name}, headshot`} placeholder='blur' unoptimized />,
    }))
  : [
      {
        name: 'The expert panel',
        role: 'Senior specialists, by project',
        bio: 'Peers Ross has worked alongside, each an expert in their field, brought in when a project calls for that depth.',
        pic: <PanelArt />,
      },
    ]

const TEAM: Member[] = [
  {
    name: 'Ross Ragsdale',
    role: 'Founder · Fractional CTO',
    bio: 'Has run Point Blank Dev since 2020, stepping in as fractional CTO and founding engineer for startups that need to move fast without breaking things. He has done every job on the team, so nothing falls through the cracks. Pictured with Pogi, head of QA.',
    pic: <Image src={ross} alt='Ross Ragsdale holding Pogi, his corgi, at sunset' placeholder='blur' unoptimized />,
  },
  ...PANEL,
  {
    name: 'Claude',
    role: 'AI engineer · by Anthropic',
    bio: 'Reads the whole codebase before lunch, writes the tests nobody asked for, and has never once said “works on my machine.” Works nights. Takes no PTO.',
    pic: <ClaudeArt />,
  },
]

export default function About() {
  return (
    <section className='about' id='about' aria-labelledby='about-title'>
      <header className='head'>
        <p className='eyebrow'>The team</p>
        <h2 id='about-title'>
          Small team. <em>Experts only.</em>
        </h2>
        <p className='lede'>
          Ross leads every engagement and writes code himself. When a project calls for deep specialist knowledge, he
          brings in senior peers who are experts in their fields. Plus one very fast AI teammate.
        </p>
      </header>

      <ul className='team'>
        {TEAM.map((m) => (
          <li key={m.name}>
            <div className='pic'>{m.pic}</div>
            <div className='who'>
              <h3>{m.name}</h3>
              <p className='role'>{m.role}</p>
              <p className='bio'>{m.bio}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className='glance'>
        <p className='eyebrow'>Ross, at a glance</p>
        <dl className='facts'>
          {FACTS.map(([n, label]) => (
            <div key={label}>
              <dt>{n}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <style jsx>{`
        .about {
          display: grid;
          gap: 48px;
          max-width: 1360px;
          margin: 0 auto;
          padding: 40px clamp(16px, 4vw, 56px) 120px;
        }
        .head {
          display: grid;
          gap: 16px;
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
        .lede {
          margin: 0;
          max-width: 40em;
          font-size: 17px;
          line-height: 1.65;
          color: var(--dim);
        }

        .team {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 28px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .team li {
          display: grid;
          align-content: start;
          gap: 18px;
          min-width: 0;
        }
        .pic {
          aspect-ratio: 1;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 20px;
          background: #0c0d0b;
        }
        .pic :global(img),
        .pic :global(svg[role='img']) {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .who {
          display: grid;
          gap: 6px;
        }
        h3 {
          margin: 0;
          font-family: var(--font-display), Georgia, serif;
          font-weight: 400;
          font-size: 30px;
          line-height: 1.1;
        }
        .role {
          margin: 0;
          font: 500 12px/1.4 var(--font-mono), monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--green);
        }
        .bio {
          margin: 6px 0 0;
          font-size: 15px;
          line-height: 1.6;
          color: var(--dim);
        }

        .glance {
          display: grid;
          gap: 24px;
          padding-top: 28px;
          border-top: 1px solid var(--line);
        }
        .facts {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px 32px;
          margin: 0;
        }
        .facts dt {
          margin-bottom: 6px;
          font-family: var(--font-display), Georgia, serif;
          font-size: 34px;
          line-height: 1;
        }
        .facts dd {
          margin: 0;
          font-size: 14px;
          line-height: 1.45;
          color: var(--faint);
        }

        @media (max-width: 980px) {
          .team {
            grid-template-columns: 1fr;
            max-width: 480px;
          }
          .facts {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </section>
  )
}
