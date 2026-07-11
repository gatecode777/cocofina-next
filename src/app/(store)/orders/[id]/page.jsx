'use client';
import { Suspense } from 'react';
import OrderDetail from '../../../../legacy-pages/OrderDetails';
export default function Page() { 
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderDetail />
    </Suspense>
  );
}
