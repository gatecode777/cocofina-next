import React, { useEffect } from 'react';
import '../styles/shippingpolicy.css';

const ShippingPolicy = () => {
  useEffect(() => {
    document.title = "Shipping Policy";
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <section className="privacy-section">
        <div className="privacy-banner">
          <img
            src="/Shiping.jpg"
            alt="Privacy Policy Banner"
            className="banner-img"
          />
        </div>

        <div className="privacy-content">
          <h2>Shipping Policy | Cocofina Delivery Information</h2>
          <p className="sub-text">
            Cocofina Coconut Sugar shipping policy. Learn about order processing
            time, delivery duration, shipping charges, and tracking details for
            orders across India.
          </p>
        </div>
      </section>

      <section className="privacy-details-section">
        <div className="container">
          <div className="policy-block">
            <h3>Order Processing</h3>
            <p>
              Orders placed on the Cocofina website are typically processed
              within 1–2 business days after payment confirmation. Orders placed
              on weekends or public holidays may be processed on the next
              working day.
            </p>
          </div>

          <div className="policy-block">
            <h3>Delivery Time</h3>
            <p>
              Delivery times may vary depending on your location. Most orders
              are delivered within 3–7 business days across India.
            </p>
          </div>

          <div className="policy-block">
            <h3>Shipping Charges</h3>
            <p>
              Shipping charges may vary depending on order quantity and delivery
              location. Any applicable shipping charges will be displayed during
              the checkout process.
            </p>
          </div>

          <div className="policy-block">
            <h3>Delivery Partners</h3>
            <p>
              We work with reliable logistics and courier partners to ensure
              safe and timely delivery of Cocofina Coconut Sugar to your
              doorstep.
            </p>
          </div>

          <div className="policy-block">
            <h3>Order Tracking</h3>
            <p>
              Once your order is shipped, you may receive a tracking number
              through email or SMS to monitor your delivery status.
            </p>
          </div>

          <div className="policy-block">
            <h3>Delivery Delays</h3>
            <p>
              While we strive to deliver products on time, unexpected delays may
              occur due to weather conditions, logistics issues, or other
              unforeseen circumstances.
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

export default ShippingPolicy;