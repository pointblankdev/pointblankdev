import Head from 'next/head'

const titleDefault = 'Point Blank Dev'
const url = 'https://pointblankdev.com/'
const description = `We don't just build software, we bring your digital vision to life. What we create for you is a reflection of who we are as engineers, designers, and developers.`
const author = 'Ross Ragsdale'

export default function Header({ title = titleDefault }) {
  return (
    <Head>
      {/* Recommended Meta Tags */}
      <meta charSet='utf-8' />
      <meta name='author' content={author} />

      {/* Search Engine Optimization Meta Tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta
        name='keywords'
        content='software consultancy,AI integration,full-stack development,e-commerce,security consulting,Point Blank Dev'
      />
      <meta name='robots' content='index,follow' />
      <link rel='canonical' href={url} />

      {/* Open Graph meta tags: https://ogp.me/ */}
      <meta property='og:title' content={title} />
      <meta property='og:type' content='website' />
      <meta property='og:url' content={url} />
      <meta property='og:image' content={`${url}icons/share.png`} />
      <meta property='og:site_name' content={titleDefault} />
      <meta property='og:description' content={description} />

      <link rel='apple-touch-icon' href='/icons/apple-touch-icon.png' />
      <link rel='apple-touch-icon' sizes='180x180' href='/icons/apple-touch-icon.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/icons/favicon-16x16.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/icons/favicon-32x32.png' />
      <link rel='manifest' href='/manifest.json' />
      <link rel='mask-icon' color='#000000' href='/icons/safari-pinned-tab.svg' />

      <meta name='viewport' content='width=device-width, minimum-scale=1, initial-scale=1.0' />
      <meta name='theme-color' content='#000' />
      <link rel='shortcut icon' href='/icons/favicon.ico' />

      {/* Twitter Summary card */}
      <meta name='twitter:card' content='summary' />
      <meta name='twitter:site' content='@lordrozar' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={`${url}icons/share.png`} />
    </Head>
  )
}
