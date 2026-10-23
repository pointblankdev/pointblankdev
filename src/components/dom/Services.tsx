import type { ReactNode } from 'react'
import { BrainCircuit, Radar, ShieldCheck, Wrench } from 'lucide-react'

/*
 * Services: find, fix, AI, watch. Four short cards, one line each, so the section reads at a glance.
 */

type Service = { icon: ReactNode; title: string; line: string }

const SERVICES: Service[] = [
  {
    icon: <ShieldCheck size={20} strokeWidth={1.6} />,
    title: 'Security review',
    line: 'I look at your app the way attackers do.',
  },
  {
    icon: <Wrench size={20} strokeWidth={1.6} />,
    title: 'Fixes, shipped',
    line: 'Not just a report. I fix it myself, on any stack.',
  },
  {
    icon: <BrainCircuit size={20} strokeWidth={1.6} />,
    title: 'AI security',
    line: 'Chatbots and agents are new ways in. I lock them down.',
  },
  {
    icon: <Radar size={20} strokeWidth={1.6} />,
    title: 'Ongoing watch',
    line: 'New flaws land daily. I catch the ones that touch you.',
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

      <ul className='grid'>
        {SERVICES.map((s) => (
          <li className='card' key={s.title}>
            <span className='icon' aria-hidden='true'>
              {s.icon}
            </span>
            <h3>{s.title}</h3>
            <p>{s.line}</p>
          </li>
        ))}
      </ul>

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
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .card {
          position: relative;
          display: grid;
          align-content: start;
          gap: 14px;
          padding: clamp(24px, 2.4vw, 32px);
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
        .icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          margin-bottom: 8px;
          border-radius: 10px;
          background: rgba(141, 198, 63, 0.1);
          color: var(--green);
        }
        h3 {
          margin: 0;
          font-family: var(--font-display), Georgia, serif;
          font-weight: 400;
          font-size: clamp(26px, 2.2vw, 32px);
          line-height: 1.05;
          letter-spacing: -0.015em;
        }
        p {
          margin: 0;
          font-size: 16px;
          line-height: 1.5;
          color: var(--dim);
        }

        @media (max-width: 1100px) {
          .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 600px) {
          .grid {
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
