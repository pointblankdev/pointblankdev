import useReveal from '@/hooks/useReveal'

/*
 * Why now: the curve, then the pace of it. The chart stacks every month's flaws by severity in a warm ramp, worst
 * on top, so each spike ends in dark red; it's plain HTML columns, crisp at any width, and a hidden table carries
 * the same numbers. Under it, this year's AI-driven events on a timeline (the shift is newer than any annual report),
 * the days between them shrinking, the latest pulsing; then one line on why patching on schedule no longer cuts it.
 * The chart draws itself and the timeline runs out the first time each comes into view.
 */

type Event = { date: string; title: string; text: string; source: string; href: string }

const DBIR = 'https://www.verizon.com/business/resources/reports/dbir/'
const GTIG = 'https://www.helpnetsecurity.com/2026/10/01/google-ai-discovered-vulnerabilities-remote-code-execution/'
const EPOCH = 'https://epoch.ai/data/cve'

const EVENTS: Event[] = [
  {
    date: '2026-04-07',
    title: 'Anthropic holds back its newest AI',
    text: 'It found thousands of serious hidden flaws in major software, some decades old. Too risky to release.',
    source: 'The Hacker News',
    href: 'https://thehackernews.com/2026/04/anthropics-claude-mythos-finds.html',
  },
  {
    date: '2026-09-09',
    title: 'An AI swarm hits 395 organizations',
    text: 'One attacker, hundreds of AI agents, 48 countries. A school fell in 7 minutes.',
    source: 'VentureBeat',
    href: 'https://venturebeat.com/security/ai-agents-breached-395-organizations-using-credentials-your-iam-policy-still-treats-as-human',
  },
  {
    date: '2026-10-02',
    title: 'AI agents take on 1,200+ websites',
    text: 'They broke into more than 100 companies, at about $50 a break-in.',
    source: 'The Hacker News',
    href: 'https://thehackernews.com/2026/10/hackers-use-autonomous-ai-agents-to.html',
  },
  {
    date: '2026-10-21',
    title: '“Black October”: patch PHP or go offline',
    text: 'AI finds two takeover flaws in PHP, which runs ~70% of websites. The NSA tells anyone who can’t patch to go dark.',
    source: 'Axios',
    href: 'https://www.axios.com/2026/10/22/php-vulnerability-security-update-websites',
  },
  {
    date: '2026-10-22',
    title: '“It was always going to be this way. We tried to warn the world.”',
    text: 'Anthropic’s deputy security chief, Jason Clinton: it will get a lot worse before it gets better.',
    source: 'OfficeChai',
    href: 'https://officechai.com/ai/it-was-always-going-to-be-this-way-we-tried-to-warn-the-world-anthropics-deputy-ciso-jason-clinton-on-recent-cyberattacks/',
  },
  {
    date: '2026-10-23',
    title: '3% of all critical flaws ever found turned up in the last month',
    text: 'So says Chris Krebs, former director of CISA, the US cyber defense agency.',
    source: 'CNBC',
    href: 'https://www.cnbc.com/2026/10/23/php-vulnerabilities-ai-cybersecurity.html',
  },
]

const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
const later = (days: number) => `${days} ${days === 1 ? 'day' : 'days'} later`
const shortDate = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

// Software flaws (CVEs) published per month from January 2024, by severity: critical, high, medium, low, and not
// yet rated (Epoch AI's CVE data, updated Oct 23, 2026). The last month is partial, October through the 22nd;
// PACE scales its total to all 31 days.
const MONTHLY = [
  [292, 915, 1227, 142, 6],
  [333, 887, 1266, 126, 167],
  [291, 1120, 1620, 136, 121],
  [282, 1252, 1683, 178, 199],
  [401, 1891, 1942, 200, 557],
  [297, 925, 1608, 94, 151],
  [272, 1129, 1335, 92, 276],
  [307, 994, 1333, 59, 202],
  [276, 887, 1111, 71, 167],
  [360, 1275, 1552, 101, 260],
  [352, 1403, 2016, 161, 26],
  [296, 1129, 1793, 91, 83],
  [377, 1427, 2268, 109, 68],
  [264, 1207, 1754, 136, 310],
  [397, 1411, 1974, 149, 62],
  [318, 1452, 2016, 149, 93],
  [348, 1117, 2031, 135, 346],
  [282, 1077, 1904, 126, 283],
  [363, 1304, 1715, 105, 238],
  [365, 1134, 1785, 117, 97],
  [294, 1276, 2330, 149, 263],
  [304, 1414, 1963, 145, 409],
  [254, 991, 1579, 126, 60],
  [418, 1810, 2325, 153, 726],
  [420, 1615, 1927, 146, 167],
  [415, 1490, 2077, 256, 179],
  [620, 2306, 2603, 255, 139],
  [557, 2004, 2635, 243, 211],
  [673, 2574, 2606, 290, 681],
  [929, 3197, 3109, 307, 273],
  [1313, 4108, 3558, 385, 392],
  [1813, 5235, 4110, 406, 691],
  [1557, 6191, 5253, 563, 1366],
  [1194, 5249, 5244, 479, 840],
]
// an ordered warm ramp, darkest red for the worst (checked for step-to-step separation, colour blindness included,
// and contrast on the dark card); no green here, since green on this page means safe
const SEVERITY = [
  { label: 'Critical', color: '#b72533' },
  { label: 'High', color: '#f85743' },
  { label: 'Medium', color: '#ffa228' },
  { label: 'Low', color: '#feea74' },
  { label: 'Not yet rated', color: '#64635d' },
]
const sum = (r: number[]) => r.reduce((a, b) => a + b, 0)
const PACE = Math.round((sum(MONTHLY[MONTHLY.length - 1]) * 31) / 22)
const AVG_2025 = Math.round(sum(MONTHLY.slice(12, 24).map(sum)) / 12)
const TOP = 20000
const TICKS = [0, 5000, 10000, 15000, 20000]
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const MONTHS = MONTHLY.map((parts, i) => ({
  parts,
  n: sum(parts),
  month: MONTH[i % 12],
  year: 2024 + Math.floor(i / 12),
  partial: i === MONTHLY.length - 1,
}))

// the average line spans only 2025's twelve columns
const AVG_SPAN = {
  left: `${(12 / MONTHLY.length) * 100}%`,
  right: `${((MONTHLY.length - 24) / MONTHLY.length) * 100}%`,
}

const fmt = (n: number) => n.toLocaleString('en-US')
const about = (n: number) => `~${fmt(Math.round(n / 100) * 100)}`
const tick = (n: number) => (n >= 1000 ? `${n / 1000}K` : String(n))
const pct = (n: number) => `${(n / TOP) * 100}%`

export default function WhyNow() {
  const chart = useReveal<HTMLElement>()
  const timeline = useReveal<HTMLOListElement>()
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

      <figure className='chart' ref={chart}>
        <figcaption className='cap'>
          <span className='title'>Software flaws published each month, by severity</span>
          <span className='sub'>January 2024 to October 2026. October’s outline is its full-month pace.</span>
          <ul className='legend'>
            {SEVERITY.map((v) => (
              <li key={v.label}>
                <i style={{ background: v.color }} />
                {v.label}
              </li>
            ))}
          </ul>
        </figcaption>

        <div className='plot' aria-hidden='true'>
          {TICKS.map((t) => (
            <div className='grid' key={t} style={{ bottom: pct(t) }}>
              <span>{tick(t)}</span>
            </div>
          ))}
          <div className='avg' style={{ bottom: pct(AVG_2025), left: AVG_SPAN.left, right: AVG_SPAN.right }}>
            <span>2025 average: {fmt(AVG_2025)}</span>
          </div>
          <ol className='bars'>
            {MONTHS.map((m, i) => (
              <li key={`${m.year}-${m.month}`} style={{ ['--i' as string]: i }}>
                {m.partial && (
                  <span className='pace' style={{ height: pct(PACE) }}>
                    <b className='peak'>{about(PACE)} on pace</b>
                  </span>
                )}
                <span className='bar' style={{ height: pct(m.n) }}>
                  {m.parts.map((v, k) => (
                    <i key={k} style={{ flexGrow: v, background: SEVERITY[k].color }} />
                  ))}
                </span>
                {m.month === 'Jan' && <span className='yr'>{m.year}</span>}
                <span className='tip'>
                  {m.month} {m.year} · {fmt(m.n)} flaws{m.partial && ` so far (${about(PACE)} on pace)`} ·{' '}
                  {fmt(m.parts[0])} critical
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className='sr'>
          <table>
            <caption>Software flaws published each month by severity, January 2024 to October 2026</caption>
            <thead>
              <tr>
                <th scope='col'>Month</th>
                {SEVERITY.map((v) => (
                  <th scope='col' key={v.label}>
                    {v.label}
                  </th>
                ))}
                <th scope='col'>Total</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((m) => (
                <tr key={`${m.year}-${m.month}`}>
                  <th scope='row'>
                    {m.month} {m.year}
                  </th>
                  {m.parts.map((v, k) => (
                    <td key={k}>{fmt(v)}</td>
                  ))}
                  <td>
                    {fmt(m.n)}
                    {m.partial && ` (through the 22nd; on pace for ${about(PACE)})`}
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

      <div className='fall'>
        <p className='kicker'>2026, so far</p>
        <ol className='timeline' ref={timeline}>
          {EVENTS.map((e, i) => (
            <li
              key={e.date}
              className={i === EVENTS.length - 1 ? 'latest' : undefined}
              style={{ ['--i' as string]: i }}
            >
              {i > 0 && <span className='later'>{later(daysBetween(EVENTS[i - 1].date, e.date))}</span>}
              <time dateTime={e.date}>{shortDate(e.date)}</time>
              <span className='node' aria-hidden='true' />
              <h3>{e.title}</h3>
              <p>{e.text}</p>
              <a href={e.href} target='_blank' rel='noopener noreferrer'>
                {e.source} ↗
              </a>
            </li>
          ))}
        </ol>
      </div>

      <p className='gap'>
        Patching on schedule used to be enough. Now an <span className='nb'>AI-found</span> flaw can be under attack
        within <b>4 days</b>, and the typical company takes <b>43</b> to fix one.{' '}
        <a href={GTIG} target='_blank' rel='noopener noreferrer'>
          Google ↗
        </a>{' '}
        <a href={DBIR} target='_blank' rel='noopener noreferrer'>
          Verizon ↗
        </a>
      </p>

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
        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 18px;
          margin: 6px 0 0;
          padding: 0;
          list-style: none;
          font-size: 13px;
          color: var(--dim);
        }
        .legend li {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .legend i {
          width: 10px;
          height: 10px;
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
        /* square, seamless columns: one solid spike a month, heating from unrated at the base to critical at the tip */
        .bar {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 24px;
          opacity: 0.9;
          transition: opacity 0.2s ease;
        }
        .bar i {
          flex-basis: 0;
          min-height: 0;
        }
        .bars li:hover .bar {
          opacity: 1;
        }
        /* October's full-month pace: an outline behind the real count so far */
        .pace {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          max-width: 24px;
          margin: 0 auto;
          border: 1px solid rgba(236, 236, 232, 0.5);
          border-bottom: 0;
          background: rgba(236, 236, 232, 0.05);
        }
        .peak {
          position: absolute;
          right: 0;
          bottom: calc(100% + 8px);
          font: 500 13px/1 var(--font-sans), sans-serif;
          color: var(--fg);
          white-space: nowrap;
        }
        /* drawn on first view: the columns rise left to right, then October's pace grows, then the labels */
        .chart[data-reveal] .bar,
        .chart[data-reveal] .pace {
          transform: scaleY(0);
          transform-origin: bottom;
        }
        .chart[data-reveal] .avg,
        .chart[data-reveal] .peak {
          opacity: 0;
        }
        .chart[data-reveal='shown'] .bar,
        .chart[data-reveal='shown'] .pace {
          transform: none;
          transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) calc(var(--i) * 28ms), opacity 0.2s ease;
        }
        .chart[data-reveal='shown'] .pace {
          transition-delay: 1.1s;
        }
        .chart[data-reveal='shown'] .avg,
        .chart[data-reveal='shown'] .peak {
          opacity: 1;
          transition: opacity 0.6s ease 1.5s;
        }
        .chart[data-reveal='shown'] .peak {
          transition-delay: 1.9s; /* once October's outline has finished growing */
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

        /* this fall, on a rail: dates above, each event below its node, the days between them on the rail */
        .fall {
          display: grid;
          gap: 26px;
        }
        .kicker {
          margin: 0;
          font: 500 12px/1 var(--font-mono), monospace;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--dim);
        }
        .timeline {
          --rail: 36px;
          position: relative;
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 24px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: var(--rail);
          height: 1px;
          background: linear-gradient(90deg, var(--line), rgba(229, 72, 77, 0.7));
        }
        .timeline li {
          position: relative;
          display: grid;
          align-content: start;
          gap: 8px;
          min-width: 0;
          padding-top: calc(var(--rail) + 26px);
        }
        .timeline time {
          position: absolute;
          top: 0;
          left: 0;
          font: 500 12px/1 var(--font-mono), monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--fg);
        }
        .node {
          position: absolute;
          top: calc(var(--rail) - 5px);
          left: 0;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: var(--dim);
          box-shadow: 0 0 0 4px var(--bg);
        }
        .latest .node {
          background: var(--red);
          animation: ping 1.8s ease-out infinite;
        }
        /* the days since the last one, centred on the rail between the two nodes */
        .later {
          position: absolute;
          top: calc(var(--rail) - 22px);
          left: calc(-50% - 12px);
          transform: translateX(-50%);
          font: 500 11px/1 var(--font-mono), monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
          color: var(--faint);
        }
        .timeline h3 {
          margin: 0;
          font-family: var(--font-display), Georgia, serif;
          font-weight: 400;
          font-size: 20px;
          line-height: 1.15;
          text-wrap: balance;
        }
        .timeline p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          color: var(--dim);
        }
        .timeline a {
          justify-self: start;
          margin-top: 2px;
          font: 500 11px/1 var(--font-mono), monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          color: var(--faint);
          transition: color 0.2s ease;
        }
        .timeline a:hover {
          color: var(--fg);
        }
        /* on first view the rail runs out and the events arrive one after another */
        .timeline[data-reveal]::before {
          transform: scaleX(0);
          transform-origin: left;
        }
        .timeline[data-reveal] li {
          opacity: 0;
          transform: translateY(8px);
        }
        .timeline[data-reveal='shown']::before {
          transform: none;
          transition: transform 1.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .timeline[data-reveal='shown'] li {
          opacity: 1;
          transform: none;
          transition: opacity 0.5s ease, transform 0.5s ease;
          transition-delay: calc(var(--i) * 240ms + 150ms);
        }
        @keyframes ping {
          from {
            box-shadow: 0 0 0 4px var(--bg), 0 0 0 4px rgba(229, 72, 77, 0.5);
          }
          to {
            box-shadow: 0 0 0 4px var(--bg), 0 0 0 16px rgba(229, 72, 77, 0);
          }
        }

        /* the closing line: why patching on schedule no longer cuts it */
        .gap {
          margin: 12px 0 0;
          max-width: 26em;
          font-family: var(--font-display), Georgia, serif;
          font-size: clamp(26px, 2.6vw, 36px);
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: var(--dim);
          text-wrap: balance;
        }
        .gap .nb {
          white-space: nowrap;
        }
        .gap b {
          font-weight: 400;
          color: var(--fg);
        }
        .gap a {
          margin-left: 4px;
          font: 500 11px/1 var(--font-mono), monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
          vertical-align: middle;
          color: var(--faint);
          transition: color 0.2s ease;
        }
        .gap a:hover {
          color: var(--fg);
        }

        /* narrower screens: the rail turns and runs down the left */
        @media (max-width: 1240px) {
          .timeline {
            --rail: 0px;
            grid-template-columns: 1fr;
            gap: 0;
            padding-left: 30px;
          }
          .timeline::before {
            left: 5px;
            right: auto;
            top: 6px;
            bottom: 10px;
            width: 1px;
            height: auto;
            background: linear-gradient(180deg, var(--line), rgba(229, 72, 77, 0.7));
          }
          .timeline[data-reveal]::before {
            transform: scaleY(0);
            transform-origin: top;
          }
          .timeline[data-reveal='shown']::before {
            transform: none;
          }
          .timeline li {
            padding: 0 0 30px;
          }
          .timeline li:last-child {
            padding-bottom: 0;
          }
          .timeline time {
            position: static;
          }
          .node {
            top: 0;
            left: -30px;
          }
          .later ~ .node {
            top: 19px; /* level with the date, below the days-later line */
          }
          .later {
            position: static;
            transform: none;
            margin-bottom: 4px;
          }
        }
        @media (max-width: 520px) {
          .bars {
            gap: 1px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bar,
          .tip {
            transition: none;
          }
          .latest .node {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
