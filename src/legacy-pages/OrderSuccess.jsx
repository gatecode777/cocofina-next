'use client';

export const dynamic = "force-dynamic";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { orderAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { getUploadUrl } from '@/lib/imageHelper';
import { CheckCircle2, ShoppingBag, Package, AlertCircle } from 'lucide-react';

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
          setError('Order details not found');
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

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Loading your order confirmation...
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white font-playfair italic">
              {error || 'Order Not Found'}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              We couldn't retrieve the details for this order. Please check your account history.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/my-orders"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-sm font-semibold transition-all shadow-md"
            >
              View My Orders
            </Link>
            <Link
              href="/products"
              className="px-6 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 pb-16">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 pt-8 sm:pt-12">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-center">
          
          {/* Animated Success Check Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.2]" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2 max-w-md mx-auto">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 font-mono text-xs sm:text-sm font-bold">
              <Package className="w-3.5 h-3.5" /> Order ID: {order.orderNumber || order._id}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-neutral-900 dark:text-white font-playfair italic pt-1">
              Order Placed Successfully!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Thank you for shopping with Cocofina! Your order has been placed and is being prepared for dispatch.
            </p>
          </div>

          {/* Purchased Items List */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-3 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 px-1">
                Ordered Items ({order.items.length})
              </span>
              <div className="space-y-2">
                {order.items.map((item, idx) => {
                  const img = item.image ? getUploadUrl(item.image, 'products') : '/cocofinaproduct.png';
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={img}
                          alt={item.name}
                          onError={(e) => { e.currentTarget.src = '/cocofinaproduct.png'; }}
                          className="w-14 h-14 object-cover rounded-xl bg-neutral-200 dark:bg-neutral-800 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {item.variantWeight} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white flex-shrink-0 ml-3">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Details Breakdown Card */}
          <div className="bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 rounded-2xl p-5 text-left space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-300 pb-2.5 border-b border-neutral-200/60 dark:border-neutral-700/60">
              <span className="text-neutral-500 dark:text-neutral-400">Payment Method</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
              </span>
            </div>

            {order.shippingAddress && (
              <div className="flex justify-between items-start text-neutral-600 dark:text-neutral-300 pb-2.5 border-b border-neutral-200/60 dark:border-neutral-700/60">
                <span className="text-neutral-500 dark:text-neutral-400 flex-shrink-0">Deliver To</span>
                <span className="font-semibold text-neutral-900 dark:text-white text-right max-w-[220px] truncate">
                  {order.shippingAddress.fullName}, {order.shippingAddress.city}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-300 pb-2.5 border-b border-neutral-200/60 dark:border-neutral-700/60">
              <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                ₹{order.subtotal?.toLocaleString('en-IN')}
              </span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 pb-2.5 border-b border-neutral-200/60 dark:border-neutral-700/60 font-semibold">
                <span>Coupon Discount ({order.coupon?.code || 'Applied'})</span>
                <span>−₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-1 text-base font-bold text-neutral-900 dark:text-white">
              <span>Total Amount</span>
              <span className="text-amber-600 dark:text-amber-400 text-lg font-extrabold">
                ₹{order.total?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => router.push('/my-orders')}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 rounded-full text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-600/25 active:scale-[0.98]"
            >
              <Package className="w-4 h-4" /> View My Orders
            </button>

            <button
              onClick={() => router.push('/products')}
              className="w-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-semibold py-3.5 rounded-full text-xs sm:text-sm border border-neutral-300/80 dark:border-neutral-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" /> Continue Shopping
            </button>
          </div>

        </div>
      </div>
    </main>
  );
};

export default OrderSuccess;