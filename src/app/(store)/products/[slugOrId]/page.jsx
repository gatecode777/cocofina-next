// src/app/(store)/products/[slugOrId]/page.jsx

'use client';
import { Suspense } from 'react';
import ProductDetail from '../../../../pages/ProductDetail';

export const dynamic = 'force-dynamic';

export default function Page() { 
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductDetail />
    </Suspense>
  );
}