'use client';
import { Suspense } from 'react';
import Login from '../../../legacy-pages/Login';

export const dynamic = 'force-dynamic';

export default function Page() { 
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  );
}
