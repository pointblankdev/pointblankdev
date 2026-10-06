import { useRef, forwardRef, useImperativeHandle, type HTMLAttributes } from 'react'

const Layout = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ children, ...props }, ref) => {
  const localRef = useRef<HTMLDivElement>(null!)

  useImperativeHandle(ref, () => localRef.current)

  return (
    <div {...props} ref={localRef} className='relative w-full min-h-screen dom bg-black text-gray-50'>
      {children}
    </div>
  )
})
Layout.displayName = 'Layout'

export default Layout
