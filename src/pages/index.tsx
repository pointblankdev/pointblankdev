import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Geist, Geist_Mono, Newsreader } from 'next/font/google'
import ClientLogos from '@/components/dom/ClientLogos'
import Services from '@/components/dom/Services'
import Work from '@/components/dom/Work'
import Contact from '@/components/dom/Contact'
import About from '@/components/dom/About'
import Process from '@/components/dom/Process'

/*
 * Home (redesign, direction A "Machined"): a quiet black page, one gunmetal sculpture of the logo,
 * one ask (book a call), and client proof directly under the hero.
 */

const display = Newsreader({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-display' })
const sans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

// Text renders first; the coin fades in once it's built
const HeroCoin = dynamic(() => import('@/components/canvas/HeroCoin'), { ssr: false })

const EMAIL = 'ross@pointblankdev.com'
// TODO: swap for a scheduling link (Cal.com / Calendly) once there is one
const BOOK = `mailto:${EMAIL}?subject=${encodeURIComponent('Intro call')}`

const Arrow = () => (
  <svg width='14' height='14' viewBox='0 0 14 14' fill='none' aria-hidden='true'>
    <path
      d='M2 7h10M8 3l4 4-4 4'
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default function Page() {
  return (
    <div className={`${display.variable} ${sans.variable} ${mono.variable} home`}>
      <header className='nav'>
        <Link href='/' className='mark'>
          POINT BLANK <span>DEV</span>
        </Link>
        <nav className='links' aria-label='Sections'>
          <a href='#services'>Services</a>
          <a href='#work'>Work</a>
          <a href='#process'>Process</a>
          <a href='#about'>About</a>
          <a href='#contact'>Contact</a>
          <a className='btn btn-sm' href={BOOK}>
            Book a call
          </a>
        </nav>
      </header>

      <main>
        <section className='hero'>
          <div className='copy'>
            <p className='eyebrow'>Independent engineering studio · Since 2020</p>
            <h1>
              Senior engineering,
              <br />
              <em>on call.</em>
            </h1>
            <p className='lede'>
              We help teams ship AI features, full-stack products, online stores and security fixes. Deep experience in
              enterprise tech and fast-moving startups.
            </p>
            <div className='actions'>
              <a className='btn' href={BOOK}>
                Book a call <Arrow />
              </a>
              <span className='or'>
                or email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </span>
            </div>
            <dl className='facts'>
              <div>
                <dt>$25M+</dt>
                <dd>in transaction volume</dd>
              </div>
              <div>
                <dt>20+ yrs</dt>
                <dd>in fintech, AI and cloud infrastructure</dd>
              </div>
              <div>
                <dt>$5K/mo</dt>
                <dd>where retainers start</dd>
              </div>
            </dl>
          </div>
          <HeroCoin className='sculpture' />
        </section>

        <section className='clients' aria-labelledby='clients-label'>
          <p className='eyebrow' id='clients-label'>
            Trusted by teams at
          </p>
          <ClientLogos />
        </section>

        <Services />

        <Work />

        <Process />

        <About />

        <Contact email={EMAIL} book={BOOK} />
      </main>

      <footer className='foot'>
        <span>© {new Date().getFullYear()} Point Blank Dev, LLC</span>
        <Link href='/privacy'>Privacy</Link>
        <a href='https://github.com/pointblankdev' target='_blank' rel='noopener noreferrer'>
          GitHub
        </a>
      </footer>

      <style jsx global>{`
        /* Machined: near-black ground, warm-white type, gunmetal 3D, brand green only on the ask */
        :root {
          --bg: #070708;
          --fg: #ecece8;
          --dim: #8a8c86;
          --faint: #5a5c56;
          --line: #1c1d1b;
          --green: #8dc63f;
          color-scheme: dark;
        }
        html,
        body {
          background: var(--bg);
        }
        html {
          scroll-behavior: smooth;
        }
        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
        }
      `}</style>
      <style jsx>{`
        .home {
          min-height: 100vh;
          overflow-x: clip; /* the coin's light rays may spill past the edge; never scroll sideways */
          background: var(--bg);
          color: var(--fg);
          font-family: var(--font-sans), system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .home :global(a) {
          color: inherit;
        }
        .home :global(a:focus-visible) {
          outline: 2px solid var(--green);
          outline-offset: 3px;
          border-radius: 4px;
        }

        .nav {
          position: absolute;
          inset: 0 0 auto 0;
          max-width: 1360px;
          margin: 0 auto;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 22px clamp(16px, 4vw, 56px);
        }
        .nav :global(.mark) {
          font: 500 13px/1 var(--font-mono), monospace;
          letter-spacing: 0.16em;
          text-decoration: none;
        }
        .nav :global(.mark span) {
          color: var(--dim);
        }
        .links {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .links a:not(.btn) {
          font-size: 14px;
          color: var(--dim);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .links a:not(.btn):hover {
          color: var(--fg);
        }
        @media (max-width: 640px) {
          .links a:not(.btn) {
            display: none;
          }
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 22px;
          border-radius: 999px;
          background: var(--green);
          color: #0a0b08 !important;
          font: 500 15px/1 var(--font-sans), sans-serif;
          text-decoration: none;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .btn:hover {
          background: #9bd34c;
          transform: translateY(-1px);
        }
        .btn-sm {
          padding: 10px 16px;
          font-size: 14px;
        }

        .hero {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          align-items: center;
          gap: 24px;
          min-height: min(94vh, 900px);
          padding: 120px clamp(16px, 4vw, 56px) 48px;
          max-width: 1360px;
          margin: 0 auto;
        }
        .copy {
          display: grid;
          gap: 28px;
          min-width: 0;
        }
        .eyebrow {
          margin: 0;
          font: 500 12px/1 var(--font-mono), monospace;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--dim);
        }
        h1 {
          margin: 0;
          font-family: var(--font-display), Georgia, serif;
          font-weight: 400;
          font-size: clamp(48px, 6.4vw, 96px);
          line-height: 0.98;
          letter-spacing: -0.025em;
        }
        h1 em {
          color: var(--dim);
        }
        .lede {
          margin: 0;
          max-width: 34em;
          font-size: clamp(17px, 1.4vw, 19px);
          line-height: 1.6;
          color: var(--dim);
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 14px 22px;
        }
        .or {
          font-size: 14px;
          color: var(--faint);
        }
        .or a {
          color: var(--dim);
          text-underline-offset: 3px;
        }
        .facts {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          margin: 12px 0 0;
          padding-top: 22px;
          border-top: 1px solid var(--line);
          max-width: 580px;
        }
        .facts dt {
          font-family: var(--font-display), Georgia, serif;
          font-size: 28px;
          line-height: 1;
          margin-bottom: 8px;
        }
        .facts dd {
          margin: 0;
          font-size: 13px;
          line-height: 1.45;
          color: var(--faint);
        }
        .hero :global(.sculpture) {
          width: 100%;
          max-width: 660px;
          aspect-ratio: 1;
          justify-self: end;
        }

        .clients {
          display: grid;
          gap: 26px;
          padding: 40px 0 72px;
          border-top: 1px solid var(--line);
        }
        .clients .eyebrow {
          text-align: center;
          color: var(--faint);
        }

        .foot {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 22px;
          padding: 28px clamp(16px, 4vw, 56px) 36px;
          border-top: 1px solid var(--line);
          font-size: 13px;
          color: var(--faint);
        }
        .foot :global(a) {
          text-decoration: none;
        }
        .foot :global(a:hover) {
          color: var(--fg);
        }

        @media (max-width: 900px) {
          .hero {
            grid-template-columns: 1fr;
            min-height: 0;
            padding-top: 104px;
            gap: 8px;
          }
          .hero :global(.sculpture) {
            order: -1;
            justify-self: center;
            max-width: 340px;
            margin-bottom: -12px;
          }
        }
        @media (max-width: 520px) {
          .facts {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .facts div {
            display: grid;
            grid-template-columns: 96px 1fr;
            align-items: baseline;
          }
          .facts dt {
            font-size: 22px;
            margin: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .btn {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}

export async function getStaticProps() {
  return { props: { title: 'Point Blank Dev · Senior engineering, on call' } }
}
