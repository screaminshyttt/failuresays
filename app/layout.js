import './globals.css'
import { Inter, Bebas_Neue } from 'next/font/google'
import { Providers } from './providers'
import SiteNav from '@/components/site-nav'
import SiteFooter from '@/components/site-footer'
import PageTransition from '@/components/page-transition'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas', display: 'swap' })

export const metadata = {
  title: 'FailureSays — Startup thinking, business analysis, and lessons hidden inside failure.',
  description: 'A premium editorial publication for founders, operators, investors, and lifelong learners. Startup analyses, company improvement ideas, case studies, startup ideas, and failures & lessons.',
  keywords: ['startup analysis', 'business strategy', 'case studies', 'entrepreneurship', 'failure lessons', 'founders'],
  icons: {
    icon: 'https://customer-assets.emergentagent.com/job_business-lessons/artifacts/1hcdj5be_2.svg',
  },
  openGraph: {
    title: 'FailureSays',
    description: 'Every Great Company Has a Story. Every Failure Has a Lesson.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${bebas.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="bg-paper text-ink">
        <Providers>
          <SiteNav />
          <PageTransition>{children}</PageTransition>
          <SiteFooter />
          <Toaster position="bottom-right" theme="light" />
        </Providers>
      </body>
    </html>
  )
}
