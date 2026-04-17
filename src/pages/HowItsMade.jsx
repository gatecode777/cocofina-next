import React, { useEffect } from 'react';
import '../styles/howitsmade.css';

const HowItsMade = () => {
  useEffect(() => {
    document.title = "How It's Made";
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <section className="how-process-section">
        <div className="container">
          <div className="process-banner">
            <img
              src="/How.png"
              alt="Coconut Sugar Process"
              className="responsive-banner"
            />
          </div>

          <div className="process-content">
            <h2>From Coconut Blossom to Natural Sweetness</h2>
            <p>
              Cocofina Coconut Sugar is made using a traditional and natural
              process that preserves the nutrients and rich flavor of coconut
              blossom sap. Our production method focuses on sustainability,
              purity, and minimal processing to ensure you receive a
              high-quality natural sweetener.
            </p>
          </div>
        </div>
      </section>

      <section className="process-steps-section">
        <div className="container">
          <div className="step-row">
            <div className="step-text">
              <span className="step-number">Step 1</span>
              <h3>Harvesting Coconut Blossom Sap</h3>
              <p>
                The process begins with carefully collecting sap from the
                blossoms of coconut trees. Skilled farmers gently tap the
                coconut flower buds and collect the naturally sweet sap in
                containers. This sap is the raw ingredient used to create
                coconut sugar.
              </p>
            </div>
            <div className="step-image">
              <img src="/How1.jpg" alt="Harvesting" />
            </div>
          </div>

          <div className="step-row">
            <div className="step-text">
              <span className="step-number">Step 2</span>
              <h3>Natural Heating Process</h3>
              <p>
                Once the sap is collected, it is slowly heated in large pans.
                The heating process evaporates the water content and thickens
                the sap into a rich syrup. This step is done carefully to
                preserve the natural minerals and nutrients present in the sap.
              </p>
            </div>
            <div className="step-image">
              <img src="/How2.jpg" alt="Natural Heating" />
            </div>
          </div>

          <div className="step-row">
            <div className="step-text">
              <span className="step-number">Step 3</span>
              <h3>Crystallization</h3>
              <p>
                As the syrup continues to cook, it gradually forms fine sugar
                crystals. The mixture is constantly stirred to achieve the
                perfect texture and consistency.
              </p>
            </div>
            <div className="step-image">
              <img src="/How3.jpg" alt="Crystallization" />
            </div>
          </div>

          <div className="step-row">
            <div className="step-text">
              <span className="step-number">Step 4</span>
              <h3>Cooling and Drying</h3>
              <p>
                After crystallization, the coconut sugar is allowed to cool and
                dry naturally. This step helps develop its characteristic
                golden-brown color and rich caramel-like flavor.
              </p>
            </div>
            <div className="step-image">
              <img src="/How4.jpg" alt="Cooling and Drying" />
            </div>
          </div>

          <div className="step-row">
            <div className="step-text">
              <span className="step-number">Step 5</span>
              <h3>Packaging</h3>
              <p>
                Once the coconut sugar reaches the ideal texture, it is
                carefully packed to maintain freshness and purity. Cocofina
                ensures hygienic packaging so that every pack reaches customers
                in perfect condition.
              </p>
            </div>
            <div className="step-image">
              <img src="/How5.jpg" alt="Packaging" />
            </div>
          </div>

          <div className="process-footer">
            <h4>Natural, Sustainable, and Pure</h4>
            <p>
              The production of coconut sugar is environmentally friendly
              because the coconut trees continue to produce sap for many years
              without being cut down. This sustainable process supports local
              farmers while providing a natural alternative to refined sugar.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HowItsMade;