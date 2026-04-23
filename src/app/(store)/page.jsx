// src/app/page.jsx (Remove 'use client')
import HomePage from '../../pages/Home';

export const metadata = {
  title: 'Home',
  description: 'Welcome to our store - Find the best products at great prices!',
};

export default function Page() {
  return <HomePage />;
}