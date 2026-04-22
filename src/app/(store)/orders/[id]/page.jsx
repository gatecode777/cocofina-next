'use client';
import { Suspense } from 'react';
import OrderDetail from '../../../../pages/OrderDetails';
export default function Page() { 
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderDetail />
    </Suspense>
  );
}