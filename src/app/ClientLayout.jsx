"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "../components/ThemeProvider";
import { CartProvider } from "../context/CartContext";
import { CartDrawer } from "../components/CartDrawer";
import { Footer } from "../components/Footer";

export default function ClientLayout({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <GoogleOAuthProvider clientId={googleClientId}>
        <CartProvider>
          <div className="flex-1 flex flex-col justify-between min-h-screen">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
        </CartProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
