import { Inter, Playfair_Display } from 'next/font/google';
import ClientLayout from './ClientLayout';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata = {
  title: {
    default: 'Cocofina – Premium Organic Coconut Sugar | Natural Sweetener from India',
    template: '%s | Cocofina'
  },
  description: 'Shop Cocofina premium organic coconut sugar — a 100% natural, unrefined sweetener with a low glycemic index. Perfect for baking, cooking, and healthy living. Free delivery on orders above ₹499.',
  keywords: [
    'organic coconut sugar',
    'coconut sugar India',
    'natural sweetener',
    'low glycemic index sugar',
    'coconut sugar buy online',
    'healthy sugar alternative',
    'unrefined coconut sugar',
    'coconut blossom sugar',
    'sugar substitute',
    'Cocofina',
    'vegan sweetener India',
    'coconut sugar for baking',
    'diabetic friendly sugar',
  ],
  authors: [{ name: 'Cocofina', url: 'https://www.cocofinasugar.com' }],
  metadataBase: new URL('https://www.cocofinasugar.com'),
  openGraph: {
    title: 'Cocofina – Premium Organic Coconut Sugar | Natural Sweetener',
    description: 'Discover Cocofina organic coconut sugar — naturally sweet, low GI, and perfect for a healthy lifestyle. Shop now and enjoy free delivery across India.',
    url: 'https://www.cocofinasugar.com',
    siteName: 'Cocofina',
    images: [
      {
        url: 'https://www.cocofinasugar.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Cocofina Premium Organic Coconut Sugar',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cocofina – Premium Organic Coconut Sugar',
    description: 'Natural, unrefined coconut sugar with a low glycemic index. Shop Cocofina for a healthier, sweeter life.',
    site: '@cocofina',
    creator: '@cocofina',
    images: ['https://www.cocofinasugar.com/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.cocofinasugar.com',
  },
  verification: {
    google: 'your-google-site-verification-token',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-C9LQJZRM0R"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C9LQJZRM0R');`
          }}
        />
        {/* End Google tag (gtag.js) */}
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M454JR4H');`
          }}
        />
        {/* End Google Tag Manager */}
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1712181646718693');
fbq('track', 'PageView');`
          }}
        />
        {/* End Meta Pixel Code */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* CSS & FontAwesome Optimization */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        {/* JSON-LD Structured Data – Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Cocofina",
              "url": "https://www.cocofinasugar.com",
              "logo": "https://www.cocofinasugar.com/logo.png",
              "description": "Cocofina is a premium organic coconut sugar brand from India offering 100% natural, unrefined, low glycemic index sweeteners.",
              "sameAs": [
                "https://www.instagram.com/cocofina",
                "https://www.facebook.com/cocofina"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "support@cocofina.in",
                "availableLanguage": ["English", "Hindi"]
              }
            })
          }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M454JR4H"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {/* Meta Pixel (noscript) */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1712181646718693&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel (noscript) */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
