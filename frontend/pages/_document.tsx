import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preload a nice font (system stack is default; optional to tweak) */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
