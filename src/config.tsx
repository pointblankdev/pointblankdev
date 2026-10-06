import Head from 'next/head'

const titleDefault = 'Point Blank Dev'
const url = 'https://www.pointblankdev.com/'
const description =
  'Senior engineering on call: AI features, full-stack products, online stores and security reviews for startups. An independent studio since 2020.'
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
      <meta property='og:image' content={`${url}og.png`} />
      <meta property='og:image:width' content='1200' />
      <meta property='og:image:height' content='630' />
      <meta property='og:image:alt' content='Point Blank Dev: Senior engineering, on call.' />
      <meta property='og:site_name' content={titleDefault} />
      <meta property='og:description' content={description} />

      <link rel='apple-touch-icon' href='/icons/apple-touch-icon.png' />
      <link rel='apple-touch-icon' sizes='180x180' href='/icons/apple-touch-icon.png' />
      <link rel='icon' type='image/svg+xml' href='/icons/icon.svg' />
      <link rel='icon' type='image/png' sizes='16x16' href='/icons/favicon-16x16.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/icons/favicon-32x32.png' />
      <link rel='manifest' href='/manifest.json' />
      <link rel='mask-icon' color='#8dc63f' href='/icons/safari-pinned-tab.svg' />

      <meta name='viewport' content='width=device-width, minimum-scale=1, initial-scale=1.0' />
      <meta name='theme-color' content='#070708' />
      <link rel='shortcut icon' href='/icons/favicon.ico' />

      {/* Twitter / X large image card */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:site' content='@lordrozar' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={`${url}og.png`} />
    </Head>
  )
}
