"use client";

import { usePathname } from "next/navigation";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "../components/ThemeProvider";
import { CartProvider } from "../context/CartContext";
import { CartDrawer } from "../components/CartDrawer";
import { Footer } from "../components/Footer";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const isAuthOrAdminPage = ["/login", "/signup"].includes(pathname) || pathname?.startsWith("/admin") || pathname?.startsWith("/buynow");

  const content = (
    <CartProvider>
      <div className="flex-1 flex flex-col justify-between min-h-screen">
        <main className="flex-1">{children}</main>
        {!isAuthOrAdminPage && <Footer />}
      </div>
      <CartDrawer />
    </CartProvider>
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          {content}
        </GoogleOAuthProvider>
      ) : (
        content
      )}
    </ThemeProvider>
  );
}
