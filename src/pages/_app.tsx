import { useRef, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import type { AppProps } from 'next/app'
import type { NextPage } from 'next'
import { Analytics } from '@vercel/analytics/next'
import Header from '@/config'
import Layout from '@/components/dom/Layout'
import '@/styles/index.css'

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

type PageWithCanvas = NextPage<AppPageProps> & {
  canvas?: (pageProps: AppPageProps) => ReactNode
}

type AppPageProps = {
  title?: string
}

type AppPropsWithCanvas = AppProps<AppPageProps> & {
  Component: PageWithCanvas
}

export default function App({ Component, pageProps = { title: 'index' } }: AppPropsWithCanvas) {
  const ref = useRef<HTMLDivElement>(null!)
  return (
    <>
      <Header title={pageProps.title} />
      <Layout ref={ref}>
        <Component {...pageProps} />
        {/* The canvas can either be in front of the dom or behind. If it is in front it can overlay contents.
         * Setting the event source to a shared parent allows both the dom and the canvas to receive events.
         * Since the event source is now shared, the canvas would block events, we prevent that with pointerEvents: none. */}
        {Component?.canvas && (
          <Scene className='pointer-events-none' eventSource={ref} eventPrefix='client'>
            {Component.canvas(pageProps)}
          </Scene>
        )}
      </Layout>
      <Analytics />
    </>
  )
}
