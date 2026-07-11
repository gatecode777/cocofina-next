import React from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import '@/models/Category'; // Register Category model

export const dynamic = "force-dynamic";

import HeroSection from '@/components/home/HeroSection';
import ProductsSection from '@/components/home/ProductsSection';
import RecipesSection from '@/components/benefits/RecipesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import NewsletterForm from '@/components/about/NewsletterForm';
import ChatSection from '@/components/about/ChatSection';
import HomeRevealObserver from '@/components/home/HomeRevealObserver';

import '@/styles/style.css';

export const metadata = {
  title: 'Buy Organic Coconut Sugar Online in India – Cocofina',
  description: 'Buy Cocofina premium organic coconut sugar online. 100% natural, unrefined, low glycemic index sweetener. Perfect for baking, cooking & healthy living. Free delivery on ₹499+.',
  keywords: [
    'buy organic coconut sugar online India',
    'Cocofina coconut sugar',
    'natural sugar substitute',
    'low GI sweetener',
    'healthy sugar for diabetics',
    'coconut palm sugar',
    'organic sweetener India',
  ],
  alternates: { canonical: 'https://www.cocofinasugar.com' },
  openGraph: {
    title: 'Cocofina – Buy Organic Coconut Sugar Online | Natural Sweetener India',
    description: 'Discover Cocofina organic coconut sugar — naturally sweet, 100% unrefined and packed with nutrients. Order now and enjoy free delivery across India.',
    url: 'https://www.cocofinasugar.com',
    type: 'website',
    images: [{ url: 'https://www.cocofinasugar.com/og-image.jpg', width: 1200, height: 630, alt: 'Cocofina Organic Coconut Sugar' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cocofina – Organic Coconut Sugar Online India',
    description: 'Shop natural, unrefined coconut sugar from Cocofina. Low GI, chemical-free and perfect for healthy cooking.',
    images: ['https://www.cocofinasugar.com/og-image.jpg'],
  },
};

const imageMapping = {
  'Cocofina Coconut Sugar (100g)': {
    thumbnail: 'product-1773661168696-2666733.jpg',
    images: ['product-1773661168696-2666733.jpg', 'product-1773661168703-649612969.jpg', 'product-1773661168712-671321756.jpg']
  },
  'Cocofina Coconut Sugar (250g)': {
    thumbnail: 'product-1773661001175-788018848.jpg',
    images: ['product-1773661001175-788018848.jpg', 'product-1773661001185-385520394.jpg', 'product-1773661001192-458559.jpg']
  },
  'Cocofina Coconut Sugar (400g)': {
    thumbnail: 'product-1773643841842-327208087.jpg',
    images: ['product-1773643841842-327208087.jpg', 'product-1773643841880-146241348.jpg', 'product-1773643841893-126187246.jpg']
  },
  'Cocofina Coconut Sugar (700g)': {
    thumbnail: 'products-1777368876158-55975.jpg',
    images: ['products-1777368876158-55975.jpg', 'products-1777368876162-246845.jpg', 'products-1778733038983-249168.jpg']
  },
  'Cocofina Coconut Sugar (1000g)': {
    thumbnail: 'product-1773643841822-182463378.jpg',
    images: ['product-1773643841822-182463378.jpg', 'product-1773643841880-146241348.jpg', 'product-1773643841893-126187246.jpg']
  }
};

async function getHomeProducts() {
  await connectDB();

  // Auto-migrate if database contains broken .png thumbnails that do not exist locally
  const brokenProduct = await Product.findOne({ thumbnail: /^products-177968/ });
  if (brokenProduct) {
    console.log("Auto-migrating broken product image paths in database...");
    for (const [name, mapping] of Object.entries(imageMapping)) {
      await Product.updateOne(
        { name },
        { $set: { thumbnail: mapping.thumbnail, images: mapping.images } }
      );
    }
  }

  const products = await Product.find({ status: 'active' })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();
  
  return JSON.parse(JSON.stringify(products));
}

const IntroSection = () => (
  <section className="cf-intro">
    <div className="cf-container">
      <h1 className="cf-intro-title">Sweeten Your Life Naturally</h1>
      <div className="cf-title-line"></div>
      <p className="cf-intro-desc">
        Discover the rich caramel notes of premium organic coconut sugar, sourced
        from the finest coconut blossoms. A pure, unrefined alternative to regular sugar.
      </p>
      <Link href="/our-products" className="cf-btn-primary">
        <Compass /> Explore Our Product
      </Link>
    </div>
  </section>
);

const FeaturesSection = () => {
  const features = [
    { icon: '/icon1.png', title: '100% Coconut Blossom Sap', text: 'Made exclusively from fresh sap collected from coconut blossoms—nothing else added.' },
    { icon: '/icon2.png', title: 'No Chemicals or Preservatives', text: 'Naturally processed without bleaching agents, additives, or artificial preservatives.' },
    { icon: '/icon3.png', title: 'Low Glycemic Index', text: 'Releases energy slowly, helping maintain more balanced blood sugar levels than refined sugar.' },
    { icon: '/icon4.png', title: 'Sustainably Sourced', text: 'Harvested using eco-friendly methods that support coconut farmers and protect nature.' },
  ];

  return (
    <section className="cf-features">
      <div className="cf-container">
        <div className="cf-features-grid">
          {features.map((f, i) => (
            <div className="cf-feature-card" key={i}>
              <div className="cf-card-icon">
                <img src={f.icon} alt={f.title} />
              </div>
              <h3 className="cf-card-title">{f.title}</h3>
              <p className="cf-card-text">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StorySection = () => (
  <section className="cf-story-section">
    <div className="cf-container">
      <div className="cf-story-card">
        <div className="cf-story-image-side">
          <img src="/our page.webp" alt="Our Story Book" className="cf-story-main-img" />
        </div>
        <div className="cf-story-content-side">
          <div className="cf-story-header">
            <h2 className="cf-story-title">Our Story</h2>
            <div className="cf-story-underline"></div>
          </div>
          <div className="cf-story-text">
            <p>
              Cocofina was born from a simple belief — sweetness should come from
              nature, not chemicals. In a world full of over-processed sugars, we
              wanted to return to something pure and honest.
            </p>
            <p>
              Our coconut sugar is made from the fresh sap of coconut blossoms,
              gently processed using traditional methods that preserve its natural
              minerals and rich caramel flavour. No refining. No shortcuts. Just
              real sweetness, the way nature intended.
            </p>
            <p>
              By working closely with coconut farmers and following sustainable
              practices, Cocofina supports both people and the planet. Every pack
              is a promise of purity, transparency, and mindful living.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const AboutProductSection = () => (
  <section className="cf-about-product">
    <div className="cf-container">
      <div className="cf-about-header">
        <h2 className="cf-about-title">About Our Product</h2>
        <div className="cf-about-underline"></div>
        <div className="cf-about-desc-container">
          <p>
            Cocofina is a natural sweetener brand dedicated to offering a healthier
            alternative to refined sugar. Our coconut sugar is made from the fresh
            sap of coconut blossoms and gently processed to retain its natural
            minerals and rich caramel flavour.
          </p>
          <p>
            We believe in clean ingredients, honest sourcing, and sustainable
            practices. That's why Cocofina coconut sugar is unrefined, free from
            chemicals or preservatives, and responsibly sourced from coconut farmers
            who follow eco-friendly harvesting methods.
          </p>
          <p>Every pack of Cocofina reflects our commitment to purity, quality, and mindful living.</p>
        </div>
      </div>
      <div className="cf-about-visual">
        <div className="cf-about-bg-box"></div>
        <img src="/ingredient.webp" alt="Cocofina Coconut Sugar Ingredients" className="cf-about-main-img" />
      </div>
    </div>
  </section>
);

const StayConnectedSection = () => (
  <section className="cf-connect-section">
    <div className="cf-container">
      <div className="cf-connect-wrapper">
        <div className="cf-newsletter-side">
          <span className="cf-sub-title">New Harvest Updates</span>
          <h2 className="cf-main-title">
            Stay Connected <br /> with Cocofina
          </h2>
          <NewsletterForm />
        </div>
        <ChatSection />
      </div>
    </div>
  </section>
);

export default async function Page() {
  const products = await getHomeProducts();

  return (
    <main className="cf-main">
      <HomeRevealObserver />
      <HeroSection />
      <IntroSection />
      <FeaturesSection />
      <ProductsSection products={products} />
      <StorySection />
      <AboutProductSection />
      <RecipesSection />
      <StayConnectedSection />
      <TestimonialsSection />
    </main>
  );
}
