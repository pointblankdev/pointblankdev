import dynamic from 'next/dynamic'
import Instructions from '@/components/dom/Instructions'
import Image from 'next/image'
import PBDLogo from 'public/pbd-logo-no-icon.png'
import Link from 'next/link'
import MemoDiscord from '@/components/dom/svg/Discord'
import MemoGithub from '@/components/dom/svg/Github'
import { Code, Database, Globe, Shield } from 'lucide-react'

// Dynamic import is used to prevent a payload when the website starts, that includes threejs, r3f etc..
// WARNING ! errors might get obfuscated by using dynamic import.
// If something goes wrong go back to a static import to show the error.
// https://github.com/pmndrs/react-three-next/issues/49
const Logo = dynamic(() => import('@/components/canvas/PointBlankDev'), { ssr: false })

// Dom components go here
export default function Page(props) {
  return (
    <div className='absolute flex flex-col justify-center h-full w-full bg-black' >
      {/* <Image src={PBDLogo} alt='point-blank-dev-logo' className='invert' /> */}
      {/* Navbar */}
      <header className="p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src={PBDLogo}
            alt="Point Blank Development Logo"
            width={1800}
            height={480}
            className="h-32 sm:h-48 w-auto invert"
          />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left side - Content and services */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center z-10 pointer-events-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-5xl font-bold leading-tight mb-4">
              We bring your vision <span className="text-primary">to life</span>
            </h1>
          </div>

          {/* Service cards in a grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
            <ServiceCard
              icon={<Code className="w-6 h-6 text-primary" />}
              title="Custom Development"
              description="Tailored software built for your specific business needs"
            />
            <ServiceCard
              icon={<Globe className="w-6 h-6 text-primary" />}
              title="Web Applications"
              description="Modern, responsive web apps with cutting-edge tech"
            />
            <ServiceCard
              icon={<Database className="w-6 h-6 text-primary" />}
              title="Data Solutions"
              description="Efficient data architecture and optimization"
            />
            <ServiceCard
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="Security Consulting"
              description="Protect your systems and digital assets"
            />
          </div>
        </div>

        {/* Right side will have the 3D canvas component controlled by Page.canvas */}
        <div className="w-full md:w-1/2">
          {/* Canvas will be injected here by the framework */}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 px-8 flex justify-between items-center text-xs text-muted-foreground">
        <div>© 2025 Point Blank Dev, LLC. All rights reserved.</div>
        <div className="flex gap-4">
          {/* <Link href="#" className="hover:text-foreground">Privacy</Link>
          <Link href="#" className="hover:text-foreground">Terms</Link>
          <Link href="#" className="hover:text-foreground">Contact</Link> */}
        </div>
      </footer>
    </div>
  )
}

// Compact service card component
function ServiceCard({ icon, title, description }) {
  return (
    <div className="p-4 rounded-lg border border-muted-foreground/10 bg-foreground/30 backdrop-blur-sm hover:bg-foreground/50 transition-colors group pointer-events-auto">
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Canvas components go here
// It will receive same props as the Page component (from getStaticProps, etc.)
Page.canvas = (props) => <Logo />

export async function getStaticProps() {
  return { props: { title: 'Point Blank Development - Software Consultancy' } }
}