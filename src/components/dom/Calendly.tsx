import Head from 'next/head'
import Script from 'next/script'
import type { MouseEvent } from 'react'

/*
 * Booking: every "Book a call" opens Calendly's scheduler in a popup over the page. The widget loads once the
 * page is idle; until then, or if it's blocked, the link simply opens Calendly in a new tab.
 */

export const BOOK = 'https://calendly.com/point-blank-dev/15min'

declare global {
  interface Window {
    Calendly?: { initPopupWidget: (options: { url: string }) => void }
  }
}

// onClick for any booking link: the popup when it's ready, otherwise the link does its normal thing
export const openCalendly = (e: MouseEvent<HTMLAnchorElement>) => {
  if (!window.Calendly) return
  e.preventDefault()
  window.Calendly.initPopupWidget({ url: BOOK })
}

export default function CalendlyWidget() {
  return (
    <>
      <Head>
        <link rel='stylesheet' href='https://assets.calendly.com/assets/external/widget.css' />
      </Head>
      <Script src='https://assets.calendly.com/assets/external/widget.js' strategy='lazyOnload' />
    </>
  )
}
