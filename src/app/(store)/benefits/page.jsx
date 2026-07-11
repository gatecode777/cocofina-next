import React from 'react';
import RecipesSection from '@/components/benefits/RecipesSection';
import NewsletterForm from '@/components/about/NewsletterForm';
import ChatSection from '@/components/about/ChatSection';
import '@/styles/benefits.css';

export const metadata = {
  title: 'Health Benefits of Coconut Sugar – Low GI, Natural & Nutritious | Cocofina',
  description: 'Explore the proven health benefits of Cocofina organic coconut sugar — low glycemic index (GI 35), rich in potassium, iron, and zinc, no artificial additives, diabetic-friendly, and sustainably produced.',
  keywords: [
    'coconut sugar health benefits',
    'low glycemic index coconut sugar',
    'coconut sugar vs white sugar',
    'benefits of organic coconut sugar',
    'natural sugar diabetics',
    'coconut sugar minerals',
    'coconut sugar antioxidants',
    'healthy sweetener benefits India',
  ],
  alternates: { canonical: 'https://www.cocofinasugar.com/benefits' },
  openGraph: {
    title: 'Coconut Sugar Health Benefits – Low GI, Natural & Nutritious | Cocofina',
    description: 'Learn why Cocofina coconut sugar is better for your health — low GI, nutrient-rich, and naturally produced without chemicals.',
    url: 'https://www.cocofinasugar.com/benefits',
    type: 'website',
    images: [{ url: 'https://www.cocofinasugar.com/og-image.jpg', width: 1200, height: 630, alt: 'Coconut Sugar Health Benefits' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Why Choose Cocofina? Health Benefits of Coconut Sugar',
    description: 'Discover the nutritional and health benefits of natural coconut sugar from Cocofina.',
    images: ['https://www.cocofinasugar.com/og-image.jpg'],
  },
};

// Hero Section Component
const BenefitsHeroSection = () => (
  <section className="b-hero-section">
    <div className="b-container">
      <div className="b-banner-wrapper">
        <img
          src="/benefits.webp"
          alt="Cocofina Coconut Sugar"
          className="b-banner-img"
          loading="lazy"
        />
      </div>

      <div className="b-text-wrapper">
        <p className="b-description">
          Cocofina Coconut Sugar is a natural alternative to refined sugar,
          made from the sap of coconut blossoms. It offers a rich caramel
          flavor along with naturally occurring nutrients, making it a
          better choice for everyday sweetness.
        </p>
      </div>
    </div>
  </section>
);

// Benefits Grid Item Component
const BenefitsGridItem = ({ title, description, imageSrc, cardType, imageAlt }) => (
  <div
    className={`ben-item ${cardType === 'brown' ? 'card-brown' : 'card-cream'}`}
    style={{ backgroundImage: `url(${imageSrc})` }}
    aria-label={imageAlt || title}
  >
    <div className="ben-item-text">
      <h3>{title}</h3>
      <p>{description}</p>
    </div> 
  </div>
);

// Benefits Grid Section
const BenefitsGridSection = () => {
  const benefitsData = [
    {
      title: "Rich in Natural Minerals",
      description: "Unlike refined sugar, coconut sugar retains small amounts of minerals such as iron, zinc, calcium, and potassium that naturally occur in coconut blossom sap.",
      imageSrc: "/Benefits1.webp",
      cardType: "brown",
      imageAlt: "Rich in Natural Minerals"
    },
    {
      title: "Low Glycemic Index",
      description: "Coconut sugar has a lower glycemic index compared to regular refined sugar. This means it releases energy more gradually, helping avoid sudden spikes in blood sugar levels.",
      imageSrc: "/Benefits2.webp",
      cardType: "cream",
      imageAlt: "Low Glycemic Index"
    },
    {
      title: "Natural Source",
      description: "Cocofina Sugar is derived from the sap of coconut blossoms, making it a natural sweetener that comes directly from nature without heavy processing.",
      imageSrc: "/Benifits8.webp",
      cardType: "brown",
      imageAlt: "Natural Source"
    },
    {
      title: "No Chemicals or Additives",
      description: "Our coconut sugar is free from artificial preservatives, chemicals, and synthetic additives, ensuring a clean and pure sweetness in every spoon.",
      imageSrc: "/Benefits4.webp",
      cardType: "cream",
      imageAlt: "No Chemicals"
    },
    {
      title: "Better Flavor",
      description: "Coconut sugar has a naturally rich caramel-like taste that enhances beverages, desserts, and recipes without overpowering other ingredients.",
      imageSrc: "/Benefits5.webp",
      cardType: "brown",
      imageAlt: "Better Flavor"
    },
    {
      title: "Sustainable Production",
      description: "Harvesting coconut blossom sap does not require cutting down trees, making coconut sugar production a more environmentally friendly and sustainable process.",
      imageSrc: "/Benefits6.webp",
      cardType: "cream",
      imageAlt: "Sustainable Production"
    }
  ];

  return (
    <section className="ben-grid-section">
      <div className="ben-grid-container">
        {benefitsData.map((benefit, index) => (
          <BenefitsGridItem
            key={index}
            title={benefit.title}
            description={benefit.description}
            imageSrc={benefit.imageSrc}
            cardType={benefit.cardType}
            imageAlt={benefit.imageAlt}
          />
        ))}
      </div>
    </section>
  );
};

// Stay Connected Section
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
      <BenefitsHeroSection />
      <BenefitsGridSection />
      <RecipesSection />
      <StayConnectedSection />
    </main>
  );
}
