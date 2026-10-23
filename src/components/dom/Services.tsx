import type { ReactNode } from 'react'
import { BrainCircuit, Radar, ShieldCheck, Wrench } from 'lucide-react'

/*
 * Services: find, fix, AI, watch. Four cards, each a promise, what's in it, and one real project as proof.
 */

type Service = {
  icon: ReactNode
  tag: string
  title: string
  lede: string
  items: [string, string][]
  recent: string
}

const SERVICES: Service[] = [
  {
    icon: <ShieldCheck size={20} strokeWidth={1.6} />,
    tag: 'Security review',
    title: 'Find the gaps first',
    lede: 'I look at your product the way the AI swarms do, then hand you a clear fix list, ranked by risk and written in plain words.',
    items: [
      ['Seen from outside', 'What an attacker finds when they scan you.'],
      ['Code and architecture', 'Where the real risks are in how it’s built.'],
      ['Access and secrets', 'Logins, permissions and keys, hardened.'],
      ['Dependencies and cloud', 'Old packages, open ports, misconfigurations.'],
    ],
    recent: 'Financial systems at Discover',
  },
  {
    icon: <Wrench size={20} strokeWidth={1.6} />,
    tag: 'Fixes',
    title: 'Fixed, not just found',
    lede: 'Most security work ends in a report. Mine ends in shipped fixes. I’ve built every layer myself, so I repair what I find, on your stack.',
    items: [
      ['Fixes shipped', 'In your code, reviewed and tested.'],
      ['Any stack', 'TypeScript, React, Next.js, Node, Postgres, AWS and more.'],
      ['Nothing breaks', 'Tests and CI/CD around every change.'],
      ['Safer from here', 'Better defaults so the same gap doesn’t come back.'],
    ],
    recent: 'Real-time tournament platform for Gather, with a 12-engineer team',
  },
  {
    icon: <BrainCircuit size={20} strokeWidth={1.6} />,
    tag: 'AI security',
    title: 'AI that works for you, not them',
    lede: 'Chatbots, assistants and agents open new ways in. I build and review AI features so they don’t leak data or take actions they shouldn’t.',
    items: [
      ['Hijack attempts', 'Hidden instructions that try to take over your AI.'],
      ['Data leaks', 'Your AI only sees, and says, what it should.'],
      ['Agent permissions', 'Agents get only the access they need.'],
      ['AI-built code', 'Apps built fast with AI tools, checked for what they missed.'],
    ],
    recent: 'AI summarization pipeline for Blockbeat’s news terminal',
  },
  {
    icon: <Radar size={20} strokeWidth={1.6} />,
    tag: 'Ongoing watch',
    title: 'Watched, every week',
    lede: 'Thousands of new flaws are published every month, so a one-time check goes stale fast. On retainer, I keep watching and act the day something new touches your stack.',
    items: [
      ['New-flaw alerts', 'When something you use is hit, you hear it from me first.'],
      ['Kept current', 'Packages and servers patched before attackers arrive.'],
      ['Weekly check-in', 'What changed, what I fixed, what’s next.'],
      ['On call', 'If something goes wrong, I’m the first one in.'],
    ],
    recent: 'Charisma, the $25M+ DeFi platform I built and still run',
  },
]

export default function Services() {
  return (
    <section className='services' id='services' aria-labelledby='services-title'>
      <header className='head'>
        <p className='eyebrow'>Services</p>
        <h2 id='services-title'>
          Find it. Fix it. <em>Keep watching.</em>
        </h2>
      </header>

      <div className='grid'>
        {SERVICES.map((s) => (
          <article className='card' key={s.tag}>
            <div className='top'>
              <span className='icon' aria-hidden='true'>
                {s.icon}
              </span>
              <span className='tag'>{s.tag}</span>
            </div>
            <h3>{s.title}</h3>
            <p className='lede'>{s.lede}</p>
            <ul className='items'>
              {s.items.map(([name, detail]) => (
                <li key={name}>
                  <b>{name}</b>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
            <p className='recent'>
              <span>Recent</span>
              {s.recent}
            </p>
          </article>
        ))}
      </div>

      <style jsx>{`
        .services {
          display: grid;
          gap: 48px;
          max-width: 1360px;
          margin: 0 auto;
          padding: 112px clamp(16px, 4vw, 56px) 120px;
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

        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }
        .card {
          position: relative;
          display: grid;
          align-content: start;
          gap: 18px;
          padding: clamp(24px, 3vw, 40px);
          border: 1px solid var(--line);
          border-radius: 16px;
          background: linear-gradient(180deg, #0d0e0c, #090a09);
          overflow: hidden;
          transition: border-color 0.35s ease;
        }
        .card::before {
          content: '';
          position: absolute;
          inset: -40% 40% 55% -20%;
          background: radial-gradient(closest-side, rgba(141, 198, 63, 0.12), transparent);
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }
        .card:hover {
          border-color: rgba(141, 198, 63, 0.35);
        }
        .card:hover::before {
          opacity: 1;
        }
        .top {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(141, 198, 63, 0.1);
          color: var(--green);
        }
        .tag {
          font: 500 12px/1 var(--font-mono), monospace;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--dim);
        }
        h3 {
          margin: 6px 0 0;
          font-family: var(--font-display), Georgia, serif;
          font-weight: 400;
          font-size: clamp(28px, 2.6vw, 38px);
          line-height: 1.05;
          letter-spacing: -0.015em;
        }
        .lede {
          margin: 0;
          max-width: 40em;
          font-size: 16px;
          line-height: 1.6;
          color: var(--dim);
        }
        .items {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px 28px;
          margin: 6px 0 0;
          padding: 20px 0 0;
          list-style: none;
          border-top: 1px solid var(--line);
        }
        .items li {
          display: grid;
          align-content: start;
          gap: 4px;
          min-width: 0;
        }
        .items b {
          font-weight: 500;
          font-size: 15px;
        }
        .items span {
          font-size: 14px;
          line-height: 1.5;
          color: var(--faint);
        }
        .recent {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 12px;
          align-items: baseline;
          margin: 4px 0 0;
          font-size: 14px;
          line-height: 1.5;
          color: var(--dim);
        }
        .recent span {
          font: 500 11px/1 var(--font-mono), monospace;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--green);
        }

        @media (max-width: 960px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 520px) {
          .items {
            grid-template-columns: 1fr;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .card,
          .card::before {
            transition: none;
          }
        }
      `}</style>
    </section>
  )
}
