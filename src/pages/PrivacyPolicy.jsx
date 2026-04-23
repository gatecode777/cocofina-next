'use client';

export const dynamic = "force-dynamic";
import React, { useEffect } from 'react';
import '@/styles/privacypolicy.css';

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = "Privacy Policy - Cocofina";
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <section className="privacy-section">
        <div className="privacy-banner">
          <img
            src="/Privacy.jpg"
            alt="Privacy Policy Banner"
            className="banner-img"
          />
        </div>

        <div className="privacy-content">
          <h2>Privacy Policy | Cocofina</h2>
          <p className="sub-text">
            Read the privacy policy of Cocofina Coconut Sugar to understand how
            we collect, use, and protect your personal information when you
            visit our website.
          </p>

          <p className="main-para">
            At Cocofina, we value your privacy and are committed to protecting
            your personal information. This Privacy Policy explains how we
            collect, use, and safeguard the information you provide when you
            visit our website or purchase our coconut sugar products. By using
            our website, you agree to the practices described in this policy.
          </p>
        </div>
      </section>

      <section className="privacy-details-section">
        <div className="container">
          <div className="policy-block">
            <h3>Information We Collect</h3>
            <p>
              When you visit or interact with our website, we may collect
              certain personal and non-personal information. This may include
              your name, email address, phone number, shipping address, and
              payment details when you place an order. We may also collect
              technical information such as your IP address, browser type,
              device information, and pages visited on our website to improve
              user experience.
            </p>
          </div>

          <div className="policy-block">
            <h3>How We Use Your Information</h3>
            <p>
              The information we collect is used to provide and improve our
              services. We use your details to process orders, deliver products,
              respond to inquiries, and provide customer support. Your
              information may also be used to send updates about new products,
              promotions, or important service notifications related to Cocofina
              Coconut Sugar.
            </p>
          </div>

          <div className="policy-block">
            <h3>Cookies and Tracking Technologies</h3>
            <p>
              Our website may use cookies and similar technologies to enhance
              your browsing experience. Cookies help us understand how visitors
              interact with our website, remember user preferences, and improve
              website performance. You can choose to disable cookies through
              your browser settings if you prefer.
            </p>
          </div>

          <div className="policy-block">
            <h3>Data Protection and Security</h3>
            <p>
              We take appropriate security measures to protect your personal
              information from unauthorized access, misuse, or disclosure. Our
              website uses industry-standard security practices to ensure that
              your data remains safe and secure during transactions and
              interactions.
            </p>
          </div>

          <div className="policy-block">
            <h3>Sharing of Information</h3>
            <p>
              Cocofina does not sell, rent, or trade your personal information
              to third parties. However, we may share necessary information with
              trusted service providers such as payment processors, delivery
              partners, or technical service providers who help us operate our
              website and fulfill orders.
            </p>
          </div>

          <div className="policy-block">
            <h3>Third-Party Links</h3>
            <p>
              Our website may contain links to third-party websites for
              additional information or services. Please note that we are not
              responsible for the privacy practices or content of those external
              websites. We encourage users to review the privacy policies of any
              third-party sites they visit.
            </p>
          </div>

          <div className="policy-block">
            <h3>Your Rights</h3>
            <p>
              You have the right to access, update, or request deletion of your
              personal information stored with us. If you would like to make
              such a request, you may contact us using the contact information
              provided on our website.
            </p>
          </div>

          <div className="policy-block">
            <h3>Updates to This Policy</h3>
            <p>
              Cocofina may update this Privacy Policy from time to time to
              reflect changes in our services, legal requirements, or
              operational practices. Any updates will be posted on this page
              with the revised effective date.
            </p>
          </div>

          <div className="policy-block contact-info">
            <h3>Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy or how your
              information is handled, please contact us through the contact
              details available on our website.
            </p>

            <p className="contact-detail">
              <strong>Email:</strong> customer@cocofina.co.in
            </p>
            <p className="contact-detail">
              <strong>Contact Number:</strong> +91 XXXXXXXXX89
            </p>
          </div>

          <div className="last-updated">
            <p>Last Updated: March 2026</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PrivacyPolicy;