import Image from 'next/image'
import ross from '@/assets/about/ross.jpg'

/*
 * About: one engineer. A real photo beside the story in a few short paragraphs, then Ross at a glance.
 */

const STORY = [
  'For more than 20 years, Ross has built the systems attackers want most: financial systems at Discover, cloud infrastructure, and Charisma, a DeFi platform that has moved more than $25M.',
  'He has done every job on a software team, from the servers to the screen. So he sees the gaps others miss, and closes them himself. Every engagement is his, start to finish.',
  'The attackers are machines now. They never sleep and never stop looking. Ross stands between them and what you’ve built.',
]

const FACTS: [string, string][] = [
  ['6+ years', 'running Point Blank Dev, since 2020'],
  ['Fractional CTO', 'for startups in fintech, AI, esports, health and commerce'],
  ['$25M+', 'in transaction volume through Charisma, which he built and runs'],
  ['Every layer', 'DevOps, backend, frontend, testing, AI and security'],
]

export default function About() {
  return (
    <section className='about' id='about' aria-labelledby='about-title'>
      <div className='intro'>
        <div className='pic'>
          <Image src={ross} alt='Ross Ragsdale holding Pogi, his corgi, at sunset' placeholder='blur' unoptimized />
        </div>
        <div className='story'>
          <p className='eyebrow'>About</p>
          <h2 id='about-title'>
            One engineer. <em>Every layer.</em>
          </h2>
          <p className='role'>Ross Ragsdale · Founder</p>
          {STORY.map((p) => (
            <p className='p' key={p}>
              {p}
            </p>
          ))}
        </div>
      </div>

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
          gap: 72px;
          max-width: 1360px;
          margin: 0 auto;
          padding: 40px clamp(16px, 4vw, 56px) 120px;
        }
        .intro {
          display: grid;
          grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr);
          align-items: center;
          gap: clamp(32px, 6vw, 96px);
        }
        .pic {
          aspect-ratio: 1;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 20px;
          background: #0c0d0b;
        }
        .pic :global(img) {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .story {
          display: grid;
          gap: 18px;
          min-width: 0;
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
        .role {
          margin: 0 0 6px;
          font: 500 12px/1.4 var(--font-mono), monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--green);
        }
        .p {
          margin: 0;
          max-width: 36em;
          font-size: 17px;
          line-height: 1.65;
          color: var(--dim);
        }
        .p:last-child {
          color: var(--fg);
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

        @media (max-width: 900px) {
          .intro {
            grid-template-columns: 1fr;
          }
          .pic {
            max-width: 480px;
          }
        }
        @media (max-width: 980px) {
          .facts {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </section>
  )
}
