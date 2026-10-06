import { useState, type MouseEvent } from 'react'

/*
 * The closing ask: one panel lit by a slow green light field, one button, and the email to copy.
 */

export default function Contact({ email, book }: { email: string; book: string }) {
  const [copied, setCopied] = useState<'idle' | 'copied' | 'select'>('idle')

  const copy = (e: MouseEvent<HTMLButtonElement>) => {
    const done = (state: 'copied' | 'select') => {
      setCopied(state)
      setTimeout(() => setCopied('idle'), 2000)
    }
    navigator.clipboard.writeText(email).then(
      () => done('copied'),
      () => {
        // no clipboard access: select the address so it can be copied by hand
        const code = e.currentTarget.parentElement?.querySelector('code')
        if (code) getSelection()?.selectAllChildren(code)
        done('select')
      },
    )
  }

  return (
    <section className='contact' id='contact' aria-labelledby='contact-title'>
      <div className='panel'>
        <div className='light' aria-hidden='true' />
        <div className='body'>
          <p className='eyebrow'>Book a call</p>
          <h2 id='contact-title'>
            Got something <em>worth building?</em>
          </h2>
          <p className='lede'>Retainers from $3K a month. Senior engineering on call, without a full-time hire.</p>
          <div className='actions'>
            <a className='btn' href={book}>
              Book a call
            </a>
            <div className='mail'>
              <code>{email}</code>
              <button type='button' onClick={copy}>
                {copied === 'copied' ? 'Copied' : copied === 'select' ? 'Press Ctrl+C' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact {
          max-width: 1360px;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 56px) 96px;
        }
        .panel {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 24px;
          background: #050806;
          isolation: isolate;
        }
        /* the light field: soft green pools drifting slowly, with faint rays */
        .light {
          position: absolute;
          inset: -30%;
          z-index: -1;
          background: radial-gradient(30% 35% at 30% 65%, rgba(141, 198, 63, 0.42), transparent 70%),
            radial-gradient(28% 40% at 70% 35%, rgba(70, 140, 40, 0.38), transparent 70%),
            radial-gradient(50% 40% at 50% 105%, rgba(141, 198, 63, 0.22), transparent 70%),
            repeating-conic-gradient(from 0deg at 50% 60%, rgba(255, 255, 255, 0.035) 0deg 2deg, transparent 2deg 12deg);
          filter: blur(14px);
          animation: drift 22s ease-in-out infinite alternate;
        }
        .body {
          display: grid;
          justify-items: center;
          gap: 22px;
          padding: clamp(64px, 10vw, 128px) clamp(20px, 5vw, 64px);
          text-align: center;
        }
        .eyebrow {
          margin: 0;
          font: 500 12px/1 var(--font-mono), monospace;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(236, 236, 232, 0.6);
        }
        h2 {
          margin: 0;
          font-family: var(--font-display), Georgia, serif;
          font-weight: 400;
          font-size: clamp(44px, 6.4vw, 92px);
          line-height: 0.98;
          letter-spacing: -0.025em;
          text-wrap: balance;
        }
        h2 em {
          color: rgba(236, 236, 232, 0.62);
        }
        .lede {
          margin: 0;
          max-width: 36em;
          text-wrap: balance;
          font-size: clamp(16px, 1.4vw, 19px);
          line-height: 1.6;
          color: rgba(236, 236, 232, 0.7);
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 14px;
          margin-top: 10px;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          padding: 16px 26px;
          border-radius: 999px;
          background: var(--green);
          color: #0a0b08;
          font: 500 16px/1 var(--font-sans), sans-serif;
          text-decoration: none;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .btn:hover {
          background: #9bd34c;
          transform: translateY(-1px);
        }
        .mail {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 6px 6px 18px;
          border: 1px solid rgba(236, 236, 232, 0.16);
          border-radius: 999px;
          background: rgba(5, 8, 6, 0.55);
          backdrop-filter: blur(6px);
        }
        .mail code {
          font: 400 14px/1 var(--font-mono), monospace;
          color: rgba(236, 236, 232, 0.85);
          user-select: all;
        }
        .mail button {
          padding: 10px 14px;
          border: 0;
          border-radius: 999px;
          background: rgba(236, 236, 232, 0.08);
          color: var(--fg);
          font: 500 13px/1 var(--font-sans), sans-serif;
          cursor: pointer;
          min-width: 64px;
        }
        .mail button:hover {
          background: rgba(236, 236, 232, 0.14);
        }
        .btn:focus-visible,
        .mail button:focus-visible {
          outline: 2px solid var(--green);
          outline-offset: 3px;
        }
        @keyframes drift {
          from {
            transform: translate(-3%, 2%) rotate(-4deg);
          }
          to {
            transform: translate(3%, -2%) rotate(4deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .light {
            animation: none;
          }
          .btn {
            transition: none;
          }
        }
      `}</style>
    </section>
  )
}
