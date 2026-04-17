'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { orderAPI } from '@/services/api';
import '@/styles/buynow.css';

const OrderSuccess = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('No order information found');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getOrderById(orderId);
        if (res.data.success) {
          setOrder(res.data.order);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // If loading
  if (loading) {
    return (
      <main>
        <div className="checkout-container" style={{ maxWidth: '560px', textAlign: 'center', padding: '60px 24px' }}>
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#3b2a1a' }}></i>
            <p style={{ marginTop: '20px', color: '#666' }}>Loading order details...</p>
          </div>
        </div>
      </main>
    );
  }

  // If error or no order
  if (error || !order) {
    return (
      <main>
        <div className="checkout-container" style={{ maxWidth: '560px', textAlign: 'center', padding: '60px 24px' }}>
          <div className="error-circle">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '24px 0 8px', color: '#1a1a1a' }}>
            {error || 'Order Not Found'}
          </h1>
          <p style={{ color: '#666', marginBottom: '32px' }}>
            We couldn't find your order information.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{ padding: '12px 28px', background: '#3b2a1a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', textDecoration: 'none', display: 'inline-block' }}
            >
              Return Home
            </Link>
            <Link
              href="/our-products"
              style={{ padding: '12px 28px', background: 'transparent', color: '#3b2a1a', border: '1.5px solid #3b2a1a', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', textDecoration: 'none', display: 'inline-block' }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="checkout-container" style={{ maxWidth: '560px', textAlign: 'center', padding: '60px 24px' }}>

        {/* Success animation */}
        <div className="success-circle">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '24px 0 8px', color: '#1a1a1a' }}>
          Order Placed!
        </h1>
        <p style={{ color: '#666', marginBottom: '6px' }}>
          Thank you for your order. We'll confirm it shortly.
        </p>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px' }}>
          Order ID: <strong style={{ color: '#3b2a1a' }}>{order.orderNumber}</strong>
        </p>

        {/* Summary strip */}
        <div style={{
          background: '#faf7f4', border: '1px solid #e8e0d8', borderRadius: '12px',
          padding: '20px 24px', textAlign: 'left', marginBottom: '32px'
        }}>
          {[
            { label: 'Items', value: `${order.items?.length} item(s)` },
            { label: 'Payment', value: order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online' },
            { label: 'Deliver to', value: `${order.shippingAddress?.fullName}, ${order.shippingAddress?.city}` },
            { label: 'Total', value: `₹${order.total?.toLocaleString('en-IN')}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #ede8e2', fontSize: '14px' }}>
              <span style={{ color: '#888' }}>{label}</span>
              <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/my-orders')}
            style={{ padding: '12px 28px', background: '#3b2a1a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
          >
            View My Orders
          </button>
          <button
            onClick={() => router.push('/our-products')}
            style={{ padding: '12px 28px', background: 'transparent', color: '#3b2a1a', border: '1.5px solid #3b2a1a', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>

      <style jsx>{`
        .success-circle {
          width: 80px; height: 80px;
          background: #22c55e;
          border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          animation: pop 0.4s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 8px 24px rgba(34,197,94,0.3);
        }
        .error-circle {
          width: 80px; height: 80px;
          background: #ef4444;
          border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          animation: pop 0.4s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 8px 24px rgba(239,68,68,0.3);
        }
        @keyframes pop { 
          from { transform: scale(0); opacity: 0; } 
          to { transform: scale(1); opacity: 1; } 
        }
        .loading-spinner {
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </main>
  );
};

export default OrderSuccess;