import React, { useEffect } from 'react';
import '../styles/refundpolicy.css';

const RefundPolicy = () => {
  useEffect(() => {
    document.title = "Refund & Return Policy";
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <section className="privacy-section">
        <div className="privacy-banner">
          <img
            src="/Refund.jpg"
            alt="Privacy Policy Banner"
            className="banner-img"
          />
        </div>

        <div className="privacy-content">
          <h2>Refund & Return Policy | Cocofina</h2>
          <p className="sub-text">
            Learn about the refund and return policy of Cocofina Coconut Sugar.
            Find details on product returns, refunds, damaged items, and order
            support.
          </p>
        </div>
      </section>

      <section className="privacy-details-section">
        <div className="container">
          <div className="policy-block">
            <h3>Return Eligibility</h3>
            <p>
              If you receive a damaged or defective product, you may request a
              return or replacement within 48 hours of receiving the product.
            </p>
          </div>

          <div className="policy-block">
            <h3>Return Process</h3>
            <p>
              To initiate a return request, please contact our customer support
              team with your order details and clear photos of the product
              showing the issue.
            </p>
          </div>

          <div className="policy-block">
            <h3>Refund Processing</h3>
            <p>
              Once the returned product is inspected and approved, the refund
              will be processed through the original payment method. Refunds may
              take 5–7 business days to reflect in your account.
            </p>
          </div>

          <div className="policy-block">
            <h3>Replacement</h3>
            <p>
              In case of damaged or incorrect items, we may offer a replacement
              instead of a refund depending on product availability.
            </p>
          </div>

          <div className="policy-block">
            <h3>Non-Returnable Items</h3>
            <p>
              Products that have been opened, used, or damaged after delivery
              may not be eligible for return or refund.
            </p>
          </div>

          <div className="last-updated">
            <p><strong>Last Updated: March 2026</strong></p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RefundPolicy;