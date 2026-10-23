import type { ReactNode } from 'react'
import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react'
import { BOOK, openCalendly } from '@/components/dom/Calendly'

/*
 * Gut check: three buckets a business owner can place themselves in without knowing anything technical,
 * each with a three-step risk meter (level shown by label and icon too, never colour alone), then the ask.
 */

type Bucket = {
  level: 1 | 2 | 3
  label: string
  icon: ReactNode
  title: string
  signs: string[]
  means: string
}

const BUCKETS: Bucket[] = [
  {
    level: 3,
    label: 'High risk',
    icon: <ShieldAlert size={16} strokeWidth={1.8} />,
    title: 'Nobody has touched it in years',
    signs: [
      'The person who built it moved on.',
      'It works, so nobody touches it.',
      'You’re not sure who has the logins.',
    ],
    means: 'It’s almost certainly missing years of security fixes. To an AI attacker, that’s an open door.',
  },
  {
    level: 2,
    label: 'Unknown risk',
    icon: <ShieldQuestion size={16} strokeWidth={1.8} />,
    title: 'Someone works on it, but security isn’t their job',
    signs: [
      'Your developer is busy building features.',
      'No one has ever checked it for security.',
      'You’ve never seen a security report.',
    ],
    means: 'New work gets stacked on old gaps. You can’t know what’s open until someone looks.',
  },
  {
    level: 1,
    label: 'Lower risk',
    icon: <ShieldCheck size={16} strokeWidth={1.8} />,
    title: 'Checked recently, and kept up',
    signs: [
      'Updates go in every month.',
      'It was security-tested this year.',
      'You’d know within a day if someone broke in.',
    ],
    means: 'You’re ahead of most. New flaws land every day, so it still needs a regular look.',
  },
]

export default function RiskCheck() {
  return (
    <section className='risk' id='risk' aria-labelledby='risk-title'>
      <header className='head'>
        <p className='eyebrow'>Gut check</p>
        <h2 id='risk-title'>
          How exposed <em>are you?</em>
        </h2>
        <p className='lede'>
          Most break-ins aren’t clever. They walk in through old software that nobody has looked at in a while. Find
          yourself below.
        </p>
      </header>

      <ul className='buckets'>
        {BUCKETS.map((b) => (
          <li key={b.label} className={`bucket l${b.level}`}>
            <div className='top'>
              <span className='pill'>
                {b.icon}
                {b.label}
              </span>
              <span className='meter' aria-hidden='true'>
                {[1, 2, 3].map((i) => (
                  <i key={i} className={i <= b.level ? 'on' : undefined} />
                ))}
              </span>
            </div>
            <h3>{b.title}</h3>
            <div className='signs'>
              <p className='k'>Sounds like you if</p>
              <ul>
                {b.signs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <p className='means'>{b.means}</p>
          </li>
        ))}
      </ul>

      <div className='ask'>
        <div>
          <p className='q'>Not sure which one you are?</p>
          <p className='a'>That’s usually the answer. Let’s find out, free.</p>
        </div>
        <a className='btn' href={BOOK} target='_blank' rel='noopener noreferrer' onClick={openCalendly}>
          Book a free risk check
        </a>
      </div>

      <style jsx>{`
        .risk {
          display: grid;
          gap: 48px;
          max-width: 1360px;
          margin: 0 auto;
          padding: 40px clamp(16px, 4vw, 56px) 120px;
          --high: #e5484d;
          --mid: #f5a524;
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

        .buckets {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .bucket {
          --tone: var(--green);
          display: grid;
          align-content: start;
          gap: 18px;
          padding: clamp(24px, 2.4vw, 32px);
          border: 1px solid var(--line);
          border-top: 2px solid var(--tone);
          border-radius: 16px;
          background: linear-gradient(180deg, #0d0e0c, #090a09);
        }
        .l3 {
          --tone: var(--high);
        }
        .l2 {
          --tone: var(--mid);
        }
        .top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 10px 6px 8px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--tone) 14%, transparent);
          color: var(--tone);
          font: 500 12px/1 var(--font-mono), monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .meter {
          display: flex;
          gap: 4px;
        }
        .meter i {
          width: 18px;
          height: 6px;
          border-radius: 3px;
          background: var(--line);
        }
        .meter i.on {
          background: var(--tone);
        }
        h3 {
          margin: 0;
          font-family: var(--font-display), Georgia, serif;
          font-weight: 400;
          font-size: clamp(26px, 2.2vw, 32px);
          line-height: 1.1;
          letter-spacing: -0.015em;
          text-wrap: balance;
        }
        .signs {
          display: grid;
          gap: 10px;
        }
        .k {
          margin: 0;
          font: 500 11px/1 var(--font-mono), monospace;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--faint);
        }
        .signs ul {
          display: grid;
          gap: 8px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .signs li {
          position: relative;
          padding-left: 18px;
          font-size: 15px;
          line-height: 1.45;
          color: rgba(236, 236, 232, 0.85);
        }
        .signs li::before {
          content: '';
          position: absolute;
          left: 2px;
          top: 0.6em;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--tone);
        }
        .means {
          margin: 0;
          padding-top: 16px;
          border-top: 1px solid var(--line);
          font-size: 15px;
          line-height: 1.55;
          color: var(--dim);
        }

        .ask {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 20px 32px;
          padding: clamp(24px, 3vw, 36px);
          border: 1px solid rgba(141, 198, 63, 0.3);
          border-radius: 16px;
          background: radial-gradient(120% 140% at 0% 0%, rgba(141, 198, 63, 0.12), transparent 60%), #0a0b09;
        }
        .q {
          margin: 0 0 6px;
          font-family: var(--font-display), Georgia, serif;
          font-size: clamp(26px, 2.6vw, 36px);
          line-height: 1.1;
        }
        .a {
          margin: 0;
          font-size: 16px;
          color: var(--dim);
        }
        .ask .btn {
          display: inline-flex;
          align-items: center;
          padding: 16px 26px;
          border-radius: 999px;
          background: var(--green);
          color: #0a0b08;
          font: 500 16px/1 var(--font-sans), sans-serif;
          text-decoration: none;
          white-space: nowrap;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .ask .btn:hover {
          background: #9bd34c;
          transform: translateY(-1px);
        }
        .ask .btn:focus-visible {
          outline: 2px solid var(--green);
          outline-offset: 3px;
        }

        @media (max-width: 1000px) {
          .buckets {
            grid-template-columns: 1fr;
            max-width: 620px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .btn {
            transition: none;
          }
        }
      `}</style>
    </section>
  )
}
