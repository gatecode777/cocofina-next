'use client';
import { Suspense } from 'react';
import Blogs from '../../../pages/Blogs';
export default function Page() { 
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Blogs />
    </Suspense>
  );
}