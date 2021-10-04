import 'tailwindcss/tailwind.css'
import Head from 'next/head'

import Footer from "../components/footer"
import Header from "../components/header"

import "../styles/core.css";

const actions = [
  {
    href: '/s/zoe',
    title: '看看效果'
  },
  {
    href: 'https://github.com/jiusanzhou/payone',
    title: 'Github',
  }
]

// layout
export default function Layout({ Component, pageProps }) {
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
