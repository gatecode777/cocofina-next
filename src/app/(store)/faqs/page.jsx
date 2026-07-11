import React from 'react';
import FaqTabs from '@/components/faqs/FaqTabs';
import '@/styles/faqs.css';

export const metadata = {
  title: 'FAQs – Coconut Sugar Questions Answered | Cocofina',
  description: 'Got questions about Cocofina organic coconut sugar? Find answers on orders, shipping, returns, payment, health benefits, and product usage in our comprehensive FAQ page.',
  keywords: [
    'Cocofina FAQ',
    'coconut sugar questions',
    'coconut sugar shipping India',
    'how to use coconut sugar',
    'coconut sugar return policy',
    'order tracking Cocofina',
    'natural sweetener FAQ',
  ],
  alternates: { canonical: 'https://www.cocofinasugar.com/faqs' },
  openGraph: {
    title: 'FAQs – Common Questions About Cocofina Coconut Sugar',
    description: 'Find answers to questions about orders, shipping, coconut sugar health benefits, and product usage at Cocofina.',
    url: 'https://www.cocofinasugar.com/faqs',
    type: 'website',
    images: [{ url: 'https://www.cocofinasugar.com/og-image.jpg', width: 1200, height: 630, alt: 'Cocofina FAQs' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQs – Cocofina Coconut Sugar',
    description: 'Find answers to all your questions about Cocofina coconut sugar, orders and delivery.',
    images: ['https://www.cocofinasugar.com/og-image.jpg'],
  },
};

export default function Page() {
  return (
    <main>
      <section className="faq-section">
        <FaqTabs />
      </section>
    </main>
  );
}
