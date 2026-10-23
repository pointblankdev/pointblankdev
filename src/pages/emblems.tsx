import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import { Geist, Geist_Mono, Newsreader } from 'next/font/google'
import type { EmblemShape } from '@/components/canvas/HeroCoin'

/*
 * Emblems: the hero's coin beside its other forms, live, to choose between. Not linked from the site.
 */

const display = Newsreader({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-display' })
const sans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

const HeroCoin = dynamic(() => import('@/components/canvas/HeroCoin'), { ssr: false })

const FORMS: [EmblemShape, string, string][] = [
  ['coin', 'Coin', 'The current hero. Click to flip it.'],
  ['kite', 'Kite shield', 'Bent across like a real Norman shield. Click to flip it.'],
  ['buckler', 'Buckler', 'A small round shield with a domed face. Click to flip it.'],
  ['padlock', 'Padlock', 'Click to unlock it. Click again to lock it.'],
]

export default function Emblems() {
  return (
    <div className={`${display.variable} ${sans.variable} ${mono.variable} page`}>
      <Head>
        <meta name='robots' content='noindex' />
      </Head>
      <header>
        <Link href='/'>← pointblankdev.com</Link>
        <h1>
          Hero emblems, <em>side by side.</em>
        </h1>
      </header>
      <ul>
        {FORMS.map(([shape, name, note]) => (
          <li key={shape}>
            <HeroCoin shape={shape} className='stage' />
            <h2>{name}</h2>
            <p>{note}</p>
          </li>
        ))}
      </ul>

      <style jsx global>{`
        html,
        body {
          background: #070708;
        }
      `}</style>
      <style jsx>{`
        .page {
          min-height: 100vh;
          overflow-x: clip; /* the light rays spill past each stage */
          padding: 32px clamp(16px, 4vw, 56px) 64px;
          background: #070708;
          color: #ecece8;
          font-family: var(--font-sans), system-ui, sans-serif;
        }
        header {
          display: grid;
          gap: 18px;
          margin-bottom: 32px;
        }
        header :global(a) {
          color: #8a8c86;
          font-size: 14px;
          text-decoration: none;
        }
        h1 {
          margin: 0;
          font-family: var(--font-display), Georgia, serif;
          font-weight: 400;
          font-size: clamp(36px, 4.4vw, 60px);
          line-height: 1;
        }
        h1 em {
          color: #8a8c86;
        }
        ul {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        li {
          display: grid;
          justify-items: center;
          gap: 6px;
          padding: 16px 16px 28px;
          border: 1px solid #1c1d1b;
          border-radius: 16px;
          text-align: center;
        }
        li :global(.stage) {
          width: 100%;
          max-width: 520px;
          aspect-ratio: 1;
        }
        h2 {
          margin: 0;
          font-family: var(--font-display), Georgia, serif;
          font-weight: 400;
          font-size: 30px;
        }
        p {
          margin: 0;
          font-size: 15px;
          color: #8a8c86;
        }
        @media (max-width: 800px) {
          ul {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export async function getStaticProps() {
  return { props: { title: 'Emblems · Point Blank Dev' } }
}
