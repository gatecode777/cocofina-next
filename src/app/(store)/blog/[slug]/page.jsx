'use client';
import { Suspense } from 'react';
import SingleBlogPage from '../../../../pages/SingleBlog';
export default function Page() { 
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SingleBlogPage />
    </Suspense>
  );
}