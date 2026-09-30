import Head from 'next/head'
import Script from 'next/script'

/*
 * Home: four service scenes in a ring (public/scene/scene.js draws them into #c and runs the cards and details).
 * Click a service to turn to its scene and open its details; click it again to close them.
 */
export default function Page() {
  return (
    <>
      <Head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='' />
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap'
        />
      </Head>

      <canvas id='c' aria-label='Animated 3D scenes of Point Blank Dev services' />
      <button type='button' className='brand' id='brand' aria-label='Point Blank Dev'>
        POINT BLANK <b>DEV</b>
      </button>

      <div className='shell'>
        <div className='panel'>
          <div className='tag'>Software consulting · click a service to explore</div>
          <h1>
            We bring your vision <em>to life</em>
          </h1>
          <div className='cards' id='cards'>
            {SERVICES.map(([key, title, blurb]) => (
              <button type='button' className='card' data-s={key} key={key}>
                <span className='t'>
                  <i />
                  {title}
                </span>
                <span className='d'>{blurb}</span>
                <span className='more'>Click again to close details</span>
              </button>
            ))}
          </div>
          <div className='foot'>
            <div className='dots' id='dots' aria-hidden='true'>
              <span className='on' />
              <span />
              <span />
              <span />
            </div>
            <div className='seg' id='seg' role='group' aria-label='Scene concept' />
          </div>
        </div>
      </div>

      <aside className='drawer' id='drawer' aria-hidden='true' aria-labelledby='dTitle'>
        <button type='button' className='x' id='close'>
          Close · Esc
        </button>
        <h2 id='dTitle' />
        <p className='lede' id='dLede' />
        <ul id='dList' />
        <div className='cta'>
          <strong>Retainers from $3K / month</strong>
          <span className='tag' style={{ textTransform: 'none', letterSpacing: 0 }}>
            Senior engineering on call, without a full-time hire.
          </span>
          <div className='mail'>
            <code id='email'>ross@pointblankdev.com</code>
            <button type='button' id='copy'>
              Copy email
            </button>
          </div>
        </div>
      </aside>

      {/* Plain links (full page loads): the scene script runs once per page load */}
      <footer className='legal'>
        <span>© {new Date().getFullYear()} Point Blank Dev, LLC</span>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href='/privacy'>Privacy</a>
        <a href='mailto:ross@pointblankdev.com'>Contact</a>
      </footer>

      <div className='loading' id='loading'>
        Loading…
      </div>

      <Script src='/scene/scene.js' strategy='afterInteractive' />
      <style jsx global>{`
  /* Layout: full-bleed 3D ring of scenes; a left control column on desktop, a bottom sheet on phones. Single dark look, by choice. */
  :root {
    --ink: #07060c;
    --panel: rgba(12, 10, 20, 0.72);
    --line: rgba(167, 139, 250, 0.16);
    --fg: #ece9f5;
    --muted: #9a93b3;
    --violet: #8b5cf6;
    --ai: #f472b6;
    --build: #34d399;
    --shop: #fbbf24;
    --shield: #22d3ee;
    --display: "Chakra Petch", "Arial Narrow", system-ui, sans-serif;
    --body: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
    --mono: "IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
    color-scheme: dark;
  }
  html, body { height: 100%; overflow: hidden; }
  body { background: var(--ink); color: var(--fg); font-family: var(--body); }
  #c { position: fixed; inset: 0; width: 100%; height: 100%; display: block; }

  .shell {
    position: fixed; inset: 0; pointer-events: none; z-index: 20;
    display: grid; grid-template-columns: minmax(0, 520px) 1fr;
    padding-inline: clamp(16px, 4vw, 56px); padding-block: 24px;
  }
  .brand { all: unset; cursor: pointer; position: fixed; top: 20px; left: clamp(16px, 4vw, 56px); z-index: 2;
    font-family: var(--display); font-weight: 700; letter-spacing: 0.06em; font-size: 15px; }
  .brand b { color: var(--violet); }
  .tag { font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }

  .panel { align-self: center; pointer-events: auto; display: grid; gap: 22px; }
  h1 { margin: 0; font-family: var(--display); font-weight: 600; font-size: clamp(34px, 4.2vw, 56px);
    line-height: 1.02; letter-spacing: -0.01em; text-wrap: balance; }
  h1 em { font-style: normal; color: var(--violet); }

  .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .card {
    --c: var(--violet);
    all: unset; box-sizing: border-box; cursor: pointer; position: relative;
    display: grid; gap: 6px; padding: 16px 16px 15px; min-width: 0;
    background: var(--panel); border: 1px solid var(--line); border-radius: 10px;
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    transition: border-color .25s, transform .25s, background .25s;
  }
  .card:hover, .card:focus-visible, .card.on { border-color: color-mix(in srgb, var(--c) 70%, transparent); background: rgba(18, 14, 30, 0.85); transform: translateY(-2px); }
  .card:focus-visible { outline: 2px solid var(--c); outline-offset: 2px; }
  .card .t { font-family: var(--display); font-weight: 600; font-size: 17px; display: flex; align-items: center; gap: 9px; }
  .card .t i { width: 8px; height: 8px; border-radius: 2px; background: var(--c); box-shadow: 0 0 12px var(--c); flex: none; }
  .card .d { color: var(--muted); font-size: 13px; line-height: 1.45; }
  .card .more { font-family: var(--mono); font-size: 11px; color: var(--c); opacity: 0; transition: opacity .25s; }
  .card.on.open .more { opacity: 1; }
  .card[data-s="ai"] { --c: var(--ai); }
  .card[data-s="build"] { --c: var(--build); }
  .card[data-s="shop"] { --c: var(--shop); }
  .card[data-s="shield"] { --c: var(--shield); }

  .foot { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; }
  .dots { display: flex; gap: 6px; }
  .dots span { width: 18px; height: 3px; border-radius: 2px; background: rgba(255,255,255,.14); transition: background .3s, width .3s; }
  .dots span.on { width: 30px; background: var(--fg); }
  .seg { display: none; gap: 2px; padding: 2px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); }
  .seg.show { display: inline-flex; }
  .seg button { all: unset; cursor: pointer; font-family: var(--mono); font-size: 11px; padding: 5px 9px; border-radius: 6px; color: var(--muted); }
  .seg button.on { background: color-mix(in srgb, var(--sc, var(--violet)) 18%, transparent); color: var(--sc, var(--violet)); }
  .seg button:focus-visible { outline: 2px solid var(--sc, var(--violet)); }

  .loading { position: fixed; right: 24px; bottom: 20px; font-family: var(--mono); font-size: 11px; color: var(--muted); }

  /* Click: the details drawer */
  .drawer {
    position: fixed; top: 0; right: 0; bottom: 0; width: min(440px, 100%);
    background: rgba(10, 8, 18, 0.94); border-left: 1px solid var(--line);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    padding: calc(28px + env(safe-area-inset-top, 0px)) 28px calc(28px + env(safe-area-inset-bottom, 0px));
    overflow-y: auto; display: grid; align-content: start; gap: 18px;
    transform: translateX(102%); transition: transform .45s cubic-bezier(.2,.8,.2,1); pointer-events: auto; z-index: 50;
  }
  .drawer.open { transform: none; }
  .drawer .x { all: unset; cursor: pointer; justify-self: end; font-family: var(--mono); font-size: 12px; color: var(--muted); padding: 6px 8px; border: 1px solid var(--line); border-radius: 6px; }
  .drawer .x:hover, .drawer .x:focus-visible { color: var(--fg); }
  .drawer h2 { margin: 0; font-family: var(--display); font-weight: 600; font-size: 30px; line-height: 1.08; text-wrap: balance; }
  .drawer .lede { margin: 0; color: var(--muted); line-height: 1.55; max-width: 60ch; }
  .drawer ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; }
  .drawer li { padding: 12px 14px; border: 1px solid var(--line); border-radius: 8px; line-height: 1.45; font-size: 14px; }
  .drawer li b { display: block; font-weight: 500; margin-bottom: 2px; }
  .drawer li span { color: var(--muted); font-size: 13px; }
  .cta { display: grid; gap: 10px; padding: 16px; border-radius: 10px; background: color-mix(in srgb, var(--dc, var(--violet)) 12%, transparent); border: 1px solid color-mix(in srgb, var(--dc, var(--violet)) 40%, transparent); }
  .cta strong { font-family: var(--display); font-size: 18px; font-weight: 600; }
  .mail { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .mail code { font-family: var(--mono); font-size: 13px; user-select: all; }
  .mail button { all: unset; cursor: pointer; font-family: var(--mono); font-size: 11px; padding: 5px 9px; border-radius: 6px; border: 1px solid var(--line); color: var(--fg); }
  .mail button:hover, .mail button:focus-visible { border-color: var(--fg); }
  .legal { position: fixed; left: clamp(16px, 4vw, 56px); bottom: calc(14px + env(safe-area-inset-bottom, 0px)); z-index: 30; display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: 12px; color: var(--muted); }
  .legal a { color: inherit; text-decoration: none; }
  .legal a:hover, .legal a:focus-visible { color: var(--fg); text-decoration: underline; text-underline-offset: 3px; }
  .draft { font-family: var(--mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--shop); }

  @media (max-width: 820px), (max-aspect-ratio: 1/1) {
    .legal { display: none; }
    .shell { grid-template-columns: 1fr; align-content: end; padding-block: 16px calc(16px + env(safe-area-inset-bottom, 0px)); }
    .panel { align-self: end; gap: 12px; }
    h1 { font-size: 26px; }
    .card { padding: 11px 12px; }
    .card .d, .card .more { display: none; }
    .card .t { font-size: 15px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .card, .drawer, .dots span { transition: none; }
  }
`}</style>
    </>
  )
}

const SERVICES = [
  ['ai', 'AI Integration', 'Smart automation and AI-powered features for your business'],
  ['build', 'Full-Stack Development', 'Complete web solutions from frontend to backend'],
  ['shop', 'E-commerce Solutions', 'Custom online stores and payment processing systems'],
  ['shield', 'Security Consulting', 'Protect your systems and digital assets'],
]

export async function getStaticProps() {
  return { props: { title: 'Point Blank Development - Software Consultancy' } }
}
