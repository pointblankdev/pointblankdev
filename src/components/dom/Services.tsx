import type { ReactNode } from 'react'
import { Layers, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react'

/*
 * Services: four cards, each a promise, what's in it, and one real project as proof.
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
    icon: <Sparkles size={20} strokeWidth={1.6} />,
    tag: 'AI integration',
    title: 'AI your users actually use',
    lede: 'Assistants, search and automation inside your product and your operations. Built properly, measured, and safe with your data.',
    items: [
      ['Assistants and search', 'Chat and answers over your own data.'],
      ['Workflow automation', 'Repetitive work off support, ops and sales.'],
      ['Safe by design', 'Evaluation, guardrails and cost control from day one.'],
      ['Ship, then improve', 'Live in weeks, better every sprint.'],
    ],
    recent: "LLM summarization pipeline for Blockbeat's AI news terminal",
  },
  {
    icon: <Layers size={20} strokeWidth={1.6} />,
    tag: 'Full-stack development',
    title: 'From idea to production',
    lede: 'Senior engineers who design, build and run the whole stack with you, from the first sketch to the pager.',
    items: [
      ['Web apps and APIs', 'Front end to database, built to scale.'],
      ['Proven stack', 'TypeScript, React, Next.js, Node, Postgres, AWS.'],
      ['Quality built in', 'Reviews, tests, CI/CD and docs as standard.'],
      ['A team without hiring', 'Senior output from week one.'],
    ],
    recent: 'Real-time tournament platform for Gather, with a 12-engineer team',
  },
  {
    icon: <ShoppingBag size={20} strokeWidth={1.6} />,
    tag: 'E-commerce',
    title: 'Stores that sell',
    lede: 'Storefronts, checkout and payments that turn visits into revenue, and the testing to prove it.',
    items: [
      ['Custom storefronts', 'Fast, on-brand shopping around your products.'],
      ['Payments and subscriptions', 'Checkout, billing, taxes and refunds, handled.'],
      ['Integrations', 'Inventory, shipping and CRM, connected.'],
      ['Conversion testing', 'Edge A/B tests, measured by what sells.'],
    ],
    recent: 'Edge A/B testing and conversion work with Apex Growth',
  },
  {
    icon: <ShieldCheck size={20} strokeWidth={1.6} />,
    tag: 'Security review',
    title: 'Find the gaps first',
    lede: 'Practical security reviews that end in a clear, ranked fix list, before someone else finds the gaps.',
    items: [
      ['Code and architecture', 'Where the real risks are in how it’s built.'],
      ['Access and secrets', 'Auth, permissions and key handling, hardened.'],
      ['Dependencies and cloud', 'Old packages, open ports, misconfigurations.'],
      ['Fixes, not just findings', 'Ranked by risk, with help shipping them.'],
    ],
    recent: 'Discover financial systems and a $25M+ DeFi platform',
  },
]

export default function Services() {
  return (
    <section className='services' id='services' aria-labelledby='services-title'>
      <header className='head'>
        <p className='eyebrow'>Services</p>
        <h2 id='services-title'>
          Senior help, <em>where it counts.</em>
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
