/*
 * Why now: the curve, then the shift in four numbers, each from recent reporting and linked to its source.
 * The chart is plain HTML columns, so it stays crisp at any width; a hidden table carries the same numbers.
 */

type Stat = { n: string; text: string; source: string; href: string }

const AGENTS_1200 = 'https://thehackernews.com/2026/10/hackers-use-autonomous-ai-agents-to.html'
const EPOCH = 'https://epoch.ai/data/cve'

const STATS: Stat[] = [
  {
    n: '~5%',
    text: 'of every critical software flaw published since 2020 came out in three weeks of October 2026.',
    source: 'Epoch AI',
    href: EPOCH,
  },
  {
    n: '1,200+',
    text: 'websites hit by one hacker’s AI agents in October 2026. They broke into more than 100 companies.',
    source: 'The Hacker News',
    href: AGENTS_1200,
  },
  {
    n: '~$50',
    text: 'what each of those break-ins cost the hacker in AI fees.',
    source: 'The Hacker News',
    href: AGENTS_1200,
  },
  {
    n: '7 min',
    text: 'for AI agents to go from a first foothold to full control of a U.S. high school’s network.',
    source: 'VentureBeat',
    href: 'https://venturebeat.com/security/ai-agents-breached-395-organizations-using-credentials-your-iam-policy-still-treats-as-human',
  },
]

// Critical-severity CVEs published per month from January 2024 (Epoch AI's CVE data, updated Oct 23, 2026).
// The last month is partial: October through the 22nd.
const CRITICAL = [
  292, 333, 291, 282, 401, 297, 272, 307, 276, 360, 352, 296, 377, 264, 397, 318, 348, 282, 363, 365, 294, 304, 254,
  418, 420, 415, 620, 557, 673, 929, 1313, 1813, 1557, 1194,
]
const AVG_2025 = 332
const TOP = 2000
const TICKS = [0, 500, 1000, 1500, 2000]
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const MONTHS = CRITICAL.map((n, i) => ({
  n,
  month: MONTH[i % 12],
  year: 2024 + Math.floor(i / 12),
  partial: i === CRITICAL.length - 1,
  peak: n === Math.max(...CRITICAL),
}))

// the average line spans only 2025's twelve columns
const AVG_SPAN = {
  left: `${(12 / CRITICAL.length) * 100}%`,
  right: `${((CRITICAL.length - 24) / CRITICAL.length) * 100}%`,
}

const fmt = (n: number) => n.toLocaleString('en-US')
const tick = (n: number) => (n >= 1000 ? `${n / 1000}K` : String(n))
const pct = (n: number) => `${(n / TOP) * 100}%`

export default function WhyNow() {
  return (
    <section className='why' id='why-now' aria-labelledby='why-title'>
      <header className='head'>
        <p className='eyebrow'>Why now</p>
        <h2 id='why-title'>
          The attackers <em>are machines now.</em>
        </h2>
        <p className='lede'>
          AI is now finding serious software flaws faster than ever recorded. Swarms of AI agents never sleep, cost
          almost nothing to run, and test big companies and small ones alike, looking for one way in.
        </p>
      </header>

      <figure className='chart'>
        <figcaption className='cap'>
          <span className='title'>Critical software flaws published each month</span>
          <span className='sub'>January 2024 to October 2026 · October counts through the 22nd</span>
        </figcaption>

        <div className='plot' aria-hidden='true'>
          {TICKS.map((t) => (
            <div className='grid' key={t} style={{ bottom: pct(t) }}>
              <span>{tick(t)}</span>
            </div>
          ))}
          <div className='avg' style={{ bottom: pct(AVG_2025), left: AVG_SPAN.left, right: AVG_SPAN.right }}>
            <span>2025 average: {AVG_2025}</span>
          </div>
          <ol className='bars'>
            {MONTHS.map((m) => (
              <li key={`${m.year}-${m.month}`} className={m.partial ? 'partial' : undefined}>
                <span className='bar' style={{ height: pct(m.n) }}>
                  {m.peak && <b className='peak'>{fmt(m.n)}</b>}
                </span>
                {m.month === 'Jan' && <span className='yr'>{m.year}</span>}
                <span className='tip'>
                  {m.month} {m.year} · {fmt(m.n)}
                  {m.partial && ' so far'}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className='sr'>
          <table>
            <caption>Critical software flaws published each month, January 2024 to October 2026</caption>
            <thead>
              <tr>
                <th scope='col'>Month</th>
                <th scope='col'>Critical flaws</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((m) => (
                <tr key={`${m.year}-${m.month}`}>
                  <th scope='row'>
                    {m.month} {m.year}
                  </th>
                  <td>
                    {fmt(m.n)}
                    {m.partial && ' (through the 22nd)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <a className='src' href={EPOCH} target='_blank' rel='noopener noreferrer'>
          Epoch AI, from CVE records ↗
        </a>
      </figure>

      <dl className='stats'>
        {STATS.map((s) => (
          <div key={s.n}>
            <dt>{s.n}</dt>
            <dd>
              <p>{s.text}</p>
              <a href={s.href} target='_blank' rel='noopener noreferrer'>
                {s.source} ↗
              </a>
            </dd>
          </div>
        ))}
      </dl>

      <style jsx>{`
        .why {
          display: grid;
          gap: 48px;
          max-width: 1360px;
          margin: 0 auto;
          padding: 112px clamp(16px, 4vw, 56px) 40px;
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

        /* the curve */
        .chart {
          position: relative; /* keeps the hidden table inside the page's clip */
          display: grid;
          gap: 28px;
          margin: 0;
          padding: clamp(20px, 3vw, 36px);
          border: 1px solid var(--line);
          border-radius: 16px;
          background: linear-gradient(180deg, #0d0e0c, #090a09);
        }
        .cap {
          display: grid;
          gap: 8px;
        }
        .title {
          font-size: 17px;
          font-weight: 500;
        }
        .sub {
          font-size: 14px;
          color: var(--faint);
        }
        .plot {
          position: relative;
          height: clamp(220px, 28vw, 340px);
          margin: 0 0 26px 40px; /* room for year labels below, tick labels to the left */
        }
        .grid,
        .avg {
          position: absolute;
          left: 0;
          right: 0;
          height: 0;
          border-top: 1px solid var(--line);
        }
        .grid span {
          position: absolute;
          right: calc(100% + 10px);
          transform: translateY(-50%);
          font: 400 11px/1 var(--font-mono), monospace;
          font-variant-numeric: tabular-nums;
          color: var(--faint);
        }
        .avg {
          z-index: 1;
          border-top-color: rgba(236, 236, 232, 0.45);
          pointer-events: none;
        }
        .avg span {
          position: absolute;
          left: 0;
          bottom: 26px; /* clear of 2025's tallest column */
          font-size: 12px;
          color: var(--dim);
          white-space: nowrap;
        }
        .bars {
          position: absolute;
          inset: 0;
          display: flex;
          gap: 2px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .bars li {
          position: relative;
          flex: 1;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          min-width: 0;
        }
        .bar {
          position: relative;
          width: 100%;
          max-width: 24px;
          border-radius: 4px 4px 0 0;
          background: var(--green);
          opacity: 0.85;
          transition: opacity 0.2s ease;
        }
        .partial .bar {
          opacity: 0.4;
        }
        .bars li:hover .bar {
          opacity: 1;
        }
        .peak {
          position: absolute;
          left: 50%;
          bottom: calc(100% + 8px);
          transform: translateX(-50%);
          font: 500 13px/1 var(--font-sans), sans-serif;
          color: var(--fg);
          white-space: nowrap;
        }
        .yr {
          position: absolute;
          left: 0;
          top: calc(100% + 10px);
          font: 400 11px/1 var(--font-mono), monospace;
          color: var(--faint);
        }
        .tip {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          z-index: 2;
          transform: translateX(-50%);
          padding: 6px 9px;
          border: 1px solid var(--line);
          border-radius: 6px;
          background: #141513;
          font-size: 12px;
          color: var(--fg);
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease;
        }
        .bars li:first-child .tip {
          left: 0;
          transform: none;
        }
        .bars li:last-child .tip {
          left: auto;
          right: 0;
          transform: none;
        }
        .bars li:hover .tip {
          opacity: 1;
        }
        .chart .src {
          justify-self: start;
          font: 500 11px/1 var(--font-mono), monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          color: var(--faint);
          transition: color 0.2s ease;
        }
        .chart .src:hover {
          color: var(--fg);
        }
        .sr {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          clip-path: inset(50%);
          white-space: nowrap;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px 32px;
          margin: 0;
        }
        .stats > div {
          display: grid;
          align-content: start;
          gap: 14px;
          padding-top: 24px;
          border-top: 1px solid var(--line);
        }
        dt {
          font-family: var(--font-display), Georgia, serif;
          font-size: clamp(48px, 4.6vw, 64px);
          line-height: 1;
          letter-spacing: -0.02em;
          color: var(--green);
        }
        dd {
          display: grid;
          gap: 10px;
          margin: 0;
        }
        dd p {
          margin: 0;
          font-size: 15px;
          line-height: 1.55;
          color: var(--dim);
        }
        dd a {
          justify-self: start;
          font: 500 11px/1 var(--font-mono), monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          color: var(--faint);
          transition: color 0.2s ease;
        }
        dd a:hover {
          color: var(--fg);
        }

        @media (max-width: 980px) {
          .stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 520px) {
          .stats {
            grid-template-columns: 1fr;
          }
          .bars {
            gap: 1px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bar,
          .tip {
            transition: none;
          }
        }
      `}</style>
    </section>
  )
}
