// src/app/layout.jsx (Server Component - NO 'use client' - Vercel trigger)
import ClientLayout from './ClientLayout';
import '@/styles/style.css';

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
    <html lang="en">
      <head>
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
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Fonts and CSS */}
        <link rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css" rel="stylesheet" />
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
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
