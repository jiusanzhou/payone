import 'tailwindcss/tailwind.css'
import Head from 'next/head'
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import Footer from "../components/footer"
import Header from "../components/header"

import * as gtag from "../lib/gtag"

import "../styles/core.css";

const actions = [
  {
    href: '/s/zoe',
    title: '看看示例'
  },
  {
    href: 'https://github.com/jiusanzhou/payone',
    title: 'Github',
  }
]

// layout
export default function Layout({ Component, pageProps }) {

  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return <div className="bg-main min-h-screen flex flex-col items-center justify-center">
    <Head>
      <title>{Component.title||'PayOne | 多合一收款码'}</title>
      <link rel="icon" href="/favicon.ico" />
      <meta name="description" content="简单地生成多合一的收款码"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"></meta>
    </Head>
    {Component.noHeader!==true&&<Header actions={actions} />}
    <main className="flex flex-1 w-full justify-center">
      {<Component {...pageProps} />}
    </main>
    <Footer powered={Component.powered}/>
  </div>
}
