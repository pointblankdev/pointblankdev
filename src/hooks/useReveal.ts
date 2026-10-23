import { useEffect, useRef } from 'react'

/*
 * A one-time reveal for CSS to animate: the element gets data-reveal="armed" once the page is live, then
 * data-reveal="shown" the first time it scrolls a little way into view. The server-rendered page carries
 * neither, so it's fully drawn without script; with reduced motion it's never armed.
 */
export default function useReveal<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.dataset.reveal = 'armed'
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        el.dataset.reveal = 'shown'
        io.disconnect()
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return ref
}
