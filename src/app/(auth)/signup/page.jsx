'use client';
import { Suspense } from 'react';
import Signup from '../../../pages/Signup';

export default function Page() { 
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Signup />
    </Suspense>
  );
}