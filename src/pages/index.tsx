import dynamic from 'next/dynamic'
import Instructions from '@/components/dom/Instructions'
import Image from 'next/image'
import PBDLogo from 'public/pbd-logo-no-icon.png'
import Link from 'next/link'
import MemoDiscord from '@/components/dom/svg/Discord'
import MemoGithub from '@/components/dom/svg/Github'

// Dynamic import is used to prevent a payload when the website starts, that includes threejs, r3f etc..
// WARNING ! errors might get obfuscated by using dynamic import.
// If something goes wrong go back to a static import to show the error.
// https://github.com/pmndrs/react-three-next/issues/49
const Logo = dynamic(() => import('@/components/canvas/PointBlankDev'), { ssr: false })

// Dom components go here
export default function Page(props) {
  return (
    <div className='absolute flex justify-center w-full pointer-events-none select-none'>
      <Image src={PBDLogo} alt='point-blank-dev-logo' className='invert' />
    </div>
  )
}

// Canvas components go here
// It will receive same props as the Page component (from getStaticProps, etc.)
// Page.canvas = (props) => <Logo scale={0.5} route='/blob' position-y={-1} />
Page.canvas = (props) => <Logo />

export async function getStaticProps() {
  return { props: { title: 'Point Blank Dev' } }
}
