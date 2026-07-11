import React from 'react';
import CatalogView from '@/components/products/CatalogView';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import '@/styles/ourproducts.css';

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Buy Organic Coconut Sugar Online – All Products | Cocofina',
  description: 'Shop all Cocofina organic coconut sugar products. Browse our full range of natural, unrefined coconut sweeteners available in multiple sizes. Low GI, chemical-free, and sustainably sourced.',
  keywords: [
    'buy coconut sugar online',
    'organic coconut sugar products',
    'Cocofina products',
    'coconut sugar 250g 500g 1kg',
    'natural sweetener shop',
    'coconut sugar catalog India',
    'healthy sweetener online shopping',
  ],
  alternates: { canonical: 'https://www.cocofinasugar.com/our-products' },
  openGraph: {
    title: 'Shop Organic Coconut Sugar – Cocofina Products',
    description: 'Explore the full range of Cocofina natural coconut sugar. Choose your pack size and experience a healthier, sweeter lifestyle.',
    url: 'https://www.cocofinasugar.com/our-products',
    type: 'website',
    images: [{ url: 'https://www.cocofinasugar.com/og-image.jpg', width: 1200, height: 630, alt: 'Cocofina Products Catalog' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Products – Cocofina Organic Coconut Sugar',
    description: 'Browse the full Cocofina product lineup — organic, unrefined coconut sugar in multiple pack sizes.',
    images: ['https://www.cocofinasugar.com/og-image.jpg'],
  },
};

async function getCatalogData() {
  await connectDB();
  const cats = await Category.find({ isActive: true }).lean();
  
  const catProductMap = {};
  await Promise.all(
    cats.map(async (cat) => {
      const prods = await Product.find({ category: cat._id, status: 'active' })
        .select('name slug')
        .lean();
      catProductMap[cat._id.toString()] = JSON.parse(JSON.stringify(prods));
    })
  );

  return {
    initialCategories: JSON.parse(JSON.stringify(cats)),
    categoryProducts: catProductMap,
  };
}

export default async function Page() {
  const { initialCategories, categoryProducts } = await getCatalogData();

  return (
    <CatalogView 
      initialCategories={initialCategories} 
      initialCategoryProducts={categoryProducts} 
    />
  );
}
