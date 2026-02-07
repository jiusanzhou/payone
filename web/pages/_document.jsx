import Document, { Html, Head, Main, NextScript } from 'next/document'
import settings from '../config/settings'

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Global Site Tag (gtag.js) - Google Analytics */}
          {settings.GA_TRACKING_ID&&<script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.GA_TRACKING_ID}`}
          />}
          {settings.GA_TRACKING_ID&&<script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${settings.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />}

          <script src="https://cdn.jsdelivr.net/npm/@zumer/snapdom/dist/snapdom.min.js"></script>

        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}