import React from 'react';
import NewsletterForm from '@/components/about/NewsletterForm';
import ChatSection from '@/components/about/ChatSection';
import '@/styles/aboutus.css';

export const metadata = {
  title: 'About Cocofina – Our Story, Mission & Organic Coconut Sugar Journey',
  description: 'Learn about Cocofina — a brand committed to bringing you 100% natural, organic coconut sugar sourced sustainably from coconut farms. Discover our story, values, and mission for healthier sweetening.',
  keywords: [
    'about Cocofina',
    'Cocofina brand story',
    'organic coconut sugar company India',
    'natural sweetener brand',
    'sustainable coconut sugar',
    'healthy food brand India',
  ],
  alternates: { canonical: 'https://www.cocofinasugar.com/about-us' },
  openGraph: {
    title: 'About Cocofina – Premium Organic Coconut Sugar Brand from India',
    description: 'Meet the team behind Cocofina. We are passionate about natural, healthy sweeteners that are good for you and the planet.',
    url: 'https://www.cocofinasugar.com/about-us',
    type: 'website',
    images: [{ url: 'https://www.cocofinasugar.com/og-image.jpg', width: 1200, height: 630, alt: 'About Cocofina' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Cocofina – Our Organic Coconut Sugar Story',
    description: 'Discover who we are and why we believe in natural coconut sugar as the ultimate healthy sweetener.',
    images: ['https://www.cocofinasugar.com/og-image.jpg'],
  },
};

// Hero Banner Section Component
const AboutHeroSection = () => (
  <section className="abs-main-wrapper">
    <div className="abs-container">
      <div className="abs-hero-banner">
        <div className="abs-banner-overlay"></div>
      </div>
    </div>

    <div className="abs-container">
      <div className="abs-content-box">
        <h2 className="abs-title">About Cocofina</h2>
        <p className="abs-description">
          Cocofina is dedicated to creating a natural and healthier
          alternative to regular refined sugar. Our coconut sugar is made
          from the pure sap of coconut blossoms, carefully processed to
          preserve its natural nutrients and rich caramel-like flavor. We
          believe sweetness should come from nature, which is why our
          product is minimally processed and free from chemicals or
          artificial additives.
        </p>
      </div>
    </div>
  </section>
);

// Our Mission Section Component
const MissionSection = () => (
  <section className="oms-wrapper">
    <div className="oms-container">
      <div className="oms-row">
        <div className="oms-image-col">
          <div className="oms-img-box"></div>
        </div>

        <div className="oms-content-col">
          <h2 className="oms-heading">Our Mission</h2>
          <p className="oms-text">
            Our mission is to provide a natural sweetener that supports
            healthier lifestyles while maintaining authentic taste. Cocofina
            aims to promote sustainable sourcing, responsible farming, and
            products that are both good for people and the planet.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// Why Choose Feature Card Component
const WhyChooseCard = ({ icon, title, text }) => (
  <div className="wcc-card">
    <div className="wcc-icon-box">
      <img src={icon} alt={title} loading="lazy" />
    </div>
    <h3 className="wcc-card-title">{title}</h3>
    <p className="wcc-card-text">{text}</p>
  </div>
);

// Why Choose Section Component
const WhyChooseSection = () => {
  const features = [
    {
      icon: "/icon1.png",
      title: "100% Coconut Blossom Sap",
      text: "Made exclusively from fresh sap collected from coconut blossoms - nothing else added."
    },
    {
      icon: "/icon2.png",
      title: "No Chemicals or Preservatives",
      text: "Naturally processed without bleaching agents, additives, or artificial preservatives."
    },
    {
      icon: "/icon3.png",
      title: "Low Glycemic Index",
      text: "Releases energy slowly, helping maintain more balanced blood sugar levels than refined sugar."
    },
    {
      icon: "/icon4.png",
      title: "Sustainably Sourced",
      text: "Harvested using eco-friendly methods that support coconut farmers and protect nature."
    }
  ];

  return (
    <section className="wcc-wrapper">
      <div className="wcc-container">
        <h2 className="wcc-main-heading">Why Choose Cocofina</h2>

        <div className="wcc-grid">
          {features.map((feature, index) => (
            <WhyChooseCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              text={feature.text}
            />
          ))}
        </div>

        <div className="wcc-how-made">
          <h2 className="wcc-main-heading">How Our Coconut Sugar Is Made</h2>
          <p className="wcc-description">
            Our coconut sugar is harvested from the nectar of coconut
            blossoms. Farmers carefully collect the sap and gently heat it to
            evaporate the moisture, forming natural sugar crystals. This
            traditional process helps retain the natural minerals and
            distinctive caramel flavor that make coconut sugar unique.
          </p>
        </div>
      </div>
    </section>
  );
};

// Our Promise Section Component
const PromiseSection = () => (
  <section className="ops-wrapper">
    <div className="ops-container">
      <div className="ops-row">
        <div className="ops-content-col">
          <h2 className="ops-heading">Our Promise</h2>
          <p className="ops-text">
            At Cocofina, quality and purity are our top priorities. We are
            committed to delivering a product that is natural, sustainable,
            and crafted with care so that every spoonful adds both sweetness
            and value to your daily recipes.
          </p>
        </div>

        <div className="ops-image-col">
          <div className="ops-img-box"></div>
        </div>
      </div>
    </div>
  </section>
);

// Stay Connected Section Component
const StayConnectedSection = () => (
  <section className="cf-connect-section">
    <div className="cf-container">
      <div className="cf-connect-wrapper">
        <div className="cf-newsletter-side">
          <span className="cf-sub-title">New Harvest Updates</span>
          <h2 className="cf-main-title">
            Stay Connected <br />
            with Cocofina
          </h2>
          <NewsletterForm />
        </div>
        <ChatSection />
      </div>
    </div>
  </section>
);

export default function Page() {
  return (
    <main>
      <AboutHeroSection />
      <MissionSection />
      <WhyChooseSection />
      <PromiseSection />
      <StayConnectedSection />
    </main>
  );
}
