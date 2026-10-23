import { useEffect, useRef } from 'react'

/*
 * A figure ("1,200+", "~$50", "7 min") that counts up from zero the first time it scrolls into view, easing
 * as it lands. The page renders the final figure, so it reads right without script or with reduced motion,
 * and screen readers only ever get the final figure. Text without a number is left as it is.
 */

const PARTS = /^(\D*)([\d,]+(?:\.\d+)?)(.*)$/

export default function CountUp({ value, delay = 0 }: { value: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null!)

  useEffect(() => {
    const el = ref.current,
      m = value.match(PARTS)
    if (!m || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const [, pre, num, post] = m
    const target = parseFloat(num.replace(/,/g, '')),
      places = (num.split('.')[1] ?? '').length,
      commas = num.includes(',')
    const show = (n: number) =>
      (el.textContent =
        pre +
        (commas
          ? n.toLocaleString('en-US', { minimumFractionDigits: places, maximumFractionDigits: places })
          : n.toFixed(places)) +
        post)
    show(0)

    let raf = 0,
      timer = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        timer = window.setTimeout(() => {
          const start = performance.now()
          const step = (now: number) => {
            const t = Math.min(1, (now - start) / 1400)
            show(target * (1 - Math.pow(1 - t, 3)))
            if (t < 1) raf = requestAnimationFrame(step)
            else el.textContent = value
          }
          raf = requestAnimationFrame(step)
        }, delay)
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [value, delay])

  return (
    <>
      <span className='sr'>{value}</span>
      <span ref={ref} aria-hidden='true'>
        {value}
      </span>
      <style jsx>{`
        .sr {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          clip-path: inset(50%);
          white-space: nowrap;
        }
      `}</style>
    </>
  )
}
