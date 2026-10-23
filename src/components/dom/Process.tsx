import Image from 'next/image'
import ross from '@/assets/about/ross.jpg'

/*
 * How I work: the four steps of a retainer, beside an example of the async thread clients see every day.
 * The thread is an illustration, and it's labelled as one.
 */

const STEPS: [string, string][] = [
  ['Map', 'A kickoff call. I learn what you’ve built, what matters most and where it faces the internet.'],
  ['Attack', 'I test it the way automated attackers will, then rank what I find by real risk, in plain words.'],
  ['Fix', 'I ship the fixes myself, in your code, with tests, so nothing else breaks.'],
  [
    'Watch',
    'Short updates in your Slack, a weekly walkthrough, and a close eye on every new flaw that touches your stack.',
  ],
]

const Avatar = ({ who }: { who: 'ross' | 'you' }) => (
  <span className={`av ${who}`} aria-hidden='true'>
    {who === 'ross' && <Image src={ross} alt='' width={36} height={36} unoptimized />}
    {who === 'you' && 'Y'}
    <style jsx>{`
      .av {
        display: grid;
        place-items: center;
        flex: none;
        width: 36px;
        height: 36px;
        overflow: hidden;
        border-radius: 9px;
        font: 600 15px/1 var(--font-sans), sans-serif;
      }
      .av :global(img) {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .you {
        background: linear-gradient(160deg, #4a4d54, #24262a);
        color: rgba(236, 236, 232, 0.85);
      }
    `}</style>
  </span>
)

type Message = { who: 'ross' | 'you'; name: string; time: string; text: string }

const THREAD: Message[] = [
  {
    who: 'ross',
    name: 'Ross Ragsdale',
    time: '9:12 AM',
    text: 'Morning! Overnight I found an admin page on staging open to the whole internet. Closed it, and added a test so it stays closed.',
  },
  {
    who: 'ross',
    name: 'Ross Ragsdale',
    time: '11:40 AM',
    text: 'Heads up: a new flaw was published this morning in a package you use. Already patched and deployed. Nothing for you to do.',
  },
  { who: 'you', name: 'You', time: '11:52 AM', text: 'That fast? Can we walk through it in Friday’s demo?' },
  { who: 'ross', name: 'Ross Ragsdale', time: '11:53 AM', text: 'Already on the list for Friday.' },
]

export default function Process() {
  return (
    <section className='process' id='process' aria-labelledby='process-title'>
      <div className='copy'>
        <p className='eyebrow'>How I work</p>
        <h2 id='process-title'>
          No black box. <em>You see it every week.</em>
        </h2>
        <ol className='steps'>
          {STEPS.map(([title, text], i) => (
            <li key={title}>
              <span className='n'>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <figure className='thread' aria-label='Example of a project thread in Slack'>
        <div className='bar'>
          <span className='chan'># project-updates</span>
          <span className='tag'>Example thread</span>
        </div>
        <ul>
          {THREAD.map((m, i) => (
            <li key={i}>
              <Avatar who={m.who} />
              <div className='msg'>
                <p className='meta'>
                  <b>{m.name}</b>
                  <time>{m.time}</time>
                </p>
                <p className='text'>{m.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </figure>

      <style jsx>{`
        .process {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          align-items: center;
          gap: clamp(32px, 6vw, 96px);
          max-width: 1360px;
          margin: 0 auto;
          padding: 40px clamp(16px, 4vw, 56px) 120px;
        }
        .copy {
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
          margin: 0 0 12px;
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
        .steps {
          display: grid;
          margin: 0;
          padding: 0;
          list-style: none;
          border-top: 1px solid var(--line);
        }
        .steps li {
          display: grid;
          grid-template-columns: 48px minmax(0, 1fr);
          gap: 12px;
          padding: 22px 0;
          border-bottom: 1px solid var(--line);
        }
        .n {
          padding-top: 6px;
          font: 500 13px/1 var(--font-mono), monospace;
          color: var(--green);
        }
        h3 {
          margin: 0 0 6px;
          font-family: var(--font-display), Georgia, serif;
          font-weight: 400;
          font-size: 26px;
          line-height: 1.15;
        }
        .steps p {
          margin: 0;
          max-width: 34em;
          font-size: 15px;
          line-height: 1.6;
          color: var(--dim);
        }

        .thread {
          margin: 0;
          min-width: 0;
          border: 1px solid var(--line);
          border-radius: 18px;
          overflow: hidden;
          background: #0e0f0d;
          box-shadow: 0 30px 80px -40px rgba(141, 198, 63, 0.25);
        }
        .bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--line);
        }
        .chan {
          font: 600 15px/1 var(--font-sans), sans-serif;
        }
        .tag {
          padding: 5px 9px;
          border: 1px solid var(--line);
          border-radius: 999px;
          font: 500 11px/1 var(--font-mono), monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--faint);
        }
        .thread ul {
          display: grid;
          gap: 18px;
          margin: 0;
          padding: 22px 20px 24px;
          list-style: none;
        }
        .thread li {
          display: flex;
          gap: 12px;
          min-width: 0;
        }
        .msg {
          min-width: 0;
        }
        .meta {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin: 0 0 3px;
        }
        .meta b {
          font-weight: 600;
          font-size: 15px;
        }
        time {
          font-size: 12px;
          color: var(--faint);
        }
        .text {
          margin: 0;
          font-size: 15px;
          line-height: 1.5;
          color: rgba(236, 236, 232, 0.85);
        }

        @media (max-width: 960px) {
          .process {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
