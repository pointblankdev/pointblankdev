import { useRef, forwardRef, useImperativeHandle, type HTMLAttributes } from 'react'
import Link from 'next/link'
import MemoDiscord from './svg/Discord'
import MemoGithub from './svg/Github'
import MemoSlack from './svg/Slack'

const Layout = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ children, ...props }, ref) => {
  const localRef = useRef<HTMLDivElement>(null!)

  useImperativeHandle(ref, () => localRef.current)

  return (
    <div
      {...props}
      ref={localRef}
      className='absolute top-0 left-0 z-10 w-screen h-screen overflow-hidden dom bg-zinc-900 text-gray-50'>
      {children}
      <div className='fixed bottom-0 flex justify-end w-full p-8 mx-auto text-5xl gap-5'>
        <Link
          href={'https://join.slack.com/t/point-blank-dev/shared_invite/zt-1ucfhpulh-Oetg~GPOE5mc7JwsOrnGWg'}
          aria-label='Join us on Slack'
          target='_blank'
          rel='noopener noreferrer'>
          <MemoSlack />
        </Link>
        <Link
          href={'https://discord.gg/fp4TkF4Z6X'}
          aria-label='Join our Discord server'
          target='_blank'
          rel='noopener noreferrer'>
          <MemoDiscord />
        </Link>
        <Link
          href={'https://github.com/pointblankdev'}
          aria-label='Point Blank Dev on GitHub'
          target='_blank'
          rel='noopener noreferrer'>
          <MemoGithub />
        </Link>
      </div>
    </div>
  )
})
Layout.displayName = 'Layout'

export default Layout
