import React from 'react';
import '@/styles/termsandconditions.css';

export const metadata = {
  title: 'Terms & Conditions – Usage & Purchase Policy | Cocofina',
  description: 'Review the Terms & Conditions of Cocofina Organic Coconut Sugar. Understand your rights and obligations when purchasing products, placing orders, and using our website.',
  keywords: ['Cocofina terms and conditions', 'coconut sugar purchase policy', 'Cocofina usage policy'],
  alternates: { canonical: 'https://www.cocofinasugar.com/terms-and-conditions' },
  robots: { index: true, follow: false },
  openGraph: {
    title: 'Terms & Conditions | Cocofina',
    description: 'Read Cocofina\'s terms and conditions for product purchases and website use.',
    url: 'https://www.cocofinasugar.com/terms-and-conditions',
    type: 'website',
  },
};

export default function Page() {
  return (
    <main>
      <section className="privacy-section">
        <div className="privacy-banner">
          <img
            src="/TC.webp"
            alt="Terms and Conditions Banner"
            className="banner-img"
          />
        </div>

        <div className="privacy-content">
          <h2>Terms & Conditions | Cocofina Official Website</h2>
          <p className="sub-text">
            Read the Terms & Conditions of Cocofina Coconut Sugar to understand
            the rules, policies, and guidelines for using our website and
            purchasing our coconut sugar products.
          </p>

          <p className="main-para">
            Welcome to Cocofina. By accessing and using our website, you agree
            to comply with the following Terms and Conditions. These terms
            govern your use of our website, products, and services. If you do
            not agree with any part of these terms, please do not use our
            website.
          </p>
        </div>
      </section>

      <section className="privacy-details-section">
        <div className="container">
          <div className="policy-block">
            <h3>Use of Website</h3>
            <p>
              Our website is intended to provide information about Cocofina
              Coconut Sugar and allow customers to purchase our products online.
              Users agree to use the website only for lawful purposes and in a
              manner that does not harm the website or interfere with other
              users.
            </p>
          </div>

          <div className="policy-block">
            <h3>Product Information</h3>
            <p>
              We strive to ensure that all product descriptions, images, and
              pricing information are accurate and up to date. However, minor
              variations may occur due to packaging updates or product
              presentation.
            </p>
          </div>

          <div className="policy-block">
            <h3>Pricing and Payment</h3>
            <p>
              All prices displayed on the website are subject to change without
              prior notice. Payments must be made through the secure payment
              methods available on the website. Once payment is confirmed, the
              order will be processed for delivery.
            </p>
          </div>

          <div className="policy-block">
            <h3>Intellectual Property</h3>
            <p>
              All content on this website including text, images, graphics,
              logos, and design elements related to Cocofina is the property of
              the brand and may not be copied, reproduced, or used without
              permission.
            </p>
          </div>

          <div className="policy-block">
            <h3>Limitation of Liability</h3>
            <p>
              Cocofina shall not be held responsible for any direct or indirect
              damages arising from the use of this website or from the purchase
              and use of our products.
            </p>
          </div>

          <div className="policy-block contact-info">
            <h3>Changes to Terms</h3>
            <p>
              We reserve the right to modify these Terms and Conditions at any
              time. Updated terms will be published on this page.
            </p>
          </div>

          <div className="last-updated">
            <p>Last Updated: March 2026</p>
          </div>
        </div>
      </section>
    </main>
  );
}
