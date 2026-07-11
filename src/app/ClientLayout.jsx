// src/app/ClientLayout.jsx (Client Component)
'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { CartProvider } from '../context/CartContext';

export default function ClientLayout({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <CartProvider>
        {children}
      </CartProvider>
    </GoogleOAuthProvider>
  );
}
