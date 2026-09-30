import type { ReactNode } from 'react'

const CONTACT = 'ross@pointblankdev.com'
const UPDATED = 'September 30, 2026'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='mb-8'>
      <h2 className='text-xl font-semibold mb-3'>{title}</h2>
      <div className='space-y-3 text-gray-300 leading-relaxed'>{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <div className='h-full w-full overflow-y-auto bg-black'>
      <main className='max-w-2xl mx-auto px-6 py-16'>
        {/* A full page load: the home scene script runs once per load */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href='/' className='text-sm text-gray-400 hover:text-white'>← Point Blank Dev</a>
        <h1 className='text-3xl md:text-4xl font-bold mt-6 mb-2'>Privacy Policy</h1>
        <p className='text-sm text-gray-400 mb-10'>Last updated {UPDATED}</p>

        <Section title='Who we are'>
          <p>
            Point Blank Dev, LLC (&quot;Point Blank Dev&quot;) is a software consulting company. This policy covers
            pointblankdev.com and the tools we use to publish content on our own social media accounts.
          </p>
        </Section>

        <Section title='Information we collect'>
          <p>
            This website uses no cookies and has no forms or accounts. It uses Vercel Web Analytics to count page
            visits in aggregate (such as pages viewed, referrer, country and device type). It doesn&apos;t use
            cookies or identify individual visitors. Our hosting provider may also keep standard server logs (such as
            IP address and browser type) to run and secure the site.
          </p>
          <p>If you email us, we receive your email address and whatever you choose to send, and use it only to reply.</p>
        </Section>

        <Section title='Social media publishing'>
          <p>
            We use LinkedIn&apos;s API to publish posts to the Point Blank Dev company page, which we manage. This tool
            only posts our own content to our own page. It does not read, collect or store information about LinkedIn
            members, followers or anyone else.
          </p>
          <p>The access credentials LinkedIn issues to us are stored securely and used for no other purpose.</p>
        </Section>

        <Section title='Sharing'>
          <p>We don&apos;t sell, rent or share personal information with third parties, except where required by law.</p>
        </Section>

        <Section title='Your choices'>
          <p>
            You can ask us what information we hold about you, or ask us to delete it, by emailing{' '}
            <a href={`mailto:${CONTACT}`} className='underline hover:text-white'>{CONTACT}</a>.
          </p>
        </Section>

        <Section title='Changes'>
          <p>If this policy changes, we&apos;ll update this page and the date above.</p>
        </Section>

        <Section title='Contact'>
          <p>
            Point Blank Dev, LLC ·{' '}
            <a href={`mailto:${CONTACT}`} className='underline hover:text-white'>{CONTACT}</a>
          </p>
        </Section>
      </main>
    </div>
  )
}

export async function getStaticProps() {
  return { props: { title: 'Privacy Policy' } }
}
