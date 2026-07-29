import React from 'react';
import { Navbar } from '@/components/Navbar';
import '@/styles/productdetail.css';

export default function Loading() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500">
      <Navbar />
      <div className="product-page-container animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
          <div className="h-4 w-4 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
          <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
          <div className="h-4 w-4 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
          <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
        </div>

        {/* Main Product Layout Skeleton */}
        <div className="product-main-layout grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
            <div className="flex gap-3">
              <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
              <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
              <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="h-6 w-36 bg-amber-500/20 rounded-full" />
            <div className="h-10 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
            <div className="h-6 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            <div className="h-12 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full my-4" />
            <div className="h-14 w-full bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
