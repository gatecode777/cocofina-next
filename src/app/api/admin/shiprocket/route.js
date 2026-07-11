// src/app/api/admin/shiprocket/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import {
  trackByAWB, trackByShipmentId,
  getCourierServiceability, assignAWB,
  requestPickup, generateLabel, generateInvoice,
  cancelShiprocketOrder, getShiprocketOrder,
} from '@/lib/shiprocket';
import Order from '@/models/Order';
import { logActivity } from '@/lib/logActivity';

// POST /api/admin/shiprocket
// body: { action, orderId, ...params }
export async function POST(request) {
  let admin = null;
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;
    admin = auth.admin;

    if (admin.role !== 'super_admin' && !admin.permissions?.orders?.edit)
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 });

    await connectDB();
    const { action, orderId, ...params } = await request.json();

    if (!action) return NextResponse.json({ success: false, message: 'action is required' }, { status: 400 });

    // Load the order for context
    const order = orderId ? await Order.findById(orderId) : null;

    let result;

    switch (action) {

      // ── Track shipment ───────────────────────────────────────────────────
      case 'track': {
        const awb        = order?.shiprocket?.awbCode || params.awb;
        const shipmentId = order?.shiprocket?.shipmentId || params.shipmentId;
        if (awb)        result = await trackByAWB(awb);
        else if (shipmentId) result = await trackByShipmentId(shipmentId);
        else return NextResponse.json({ success: false, message: 'No AWB or shipment ID found' }, { status: 400 });
        break;
      }

      // ── Get couriers available ───────────────────────────────────────────
      case 'couriers': {
        if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        const totalWeight = order.items.reduce((s, i) => s + (i.shipping?.weight || 0.5) * i.quantity, 0);
        result = await getCourierServiceability(
          order.shiprocket?.shipmentId,
          params.pickupPostcode || process.env.SHIPROCKET_PICKUP_PINCODE || '110001',
          order.shippingAddress.pincode,
          Math.max(0.1, parseFloat(totalWeight.toFixed(2))),
          order.paymentMethod === 'cod',
        );
        break;
      }

      // ── Assign AWB / courier ─────────────────────────────────────────────
      case 'assign_awb': {
        if (!order?.shiprocket?.shipmentId) return NextResponse.json({ success: false, message: 'No shipment ID' }, { status: 400 });
        if (!params.courierId) return NextResponse.json({ success: false, message: 'courierId required' }, { status: 400 });
        result = await assignAWB(order.shiprocket.shipmentId, params.courierId);
        // Save AWB back to order
        if (result.awb_assign_status === 1 || result.response?.data?.awb_code) {
          const awb          = result.response?.data?.awb_code || result.awb_code;
          const courierName  = result.response?.data?.courier_name || result.courier_name || '';
          await Order.findByIdAndUpdate(orderId, {
            'shiprocket.awbCode':    awb,
            'shiprocket.courierName': courierName,
          });
        }
        await logActivity(request, admin, { action: 'edit', module: 'orders', description: `Assigned AWB to order ${order.orderNumber}`, targetId: order._id, targetName: order.orderNumber });
        break;
      }

      // ── Request pickup ───────────────────────────────────────────────────
      case 'request_pickup': {
        if (!order?.shiprocket?.shipmentId) return NextResponse.json({ success: false, message: 'No shipment ID' }, { status: 400 });
        result = await requestPickup(order.shiprocket.shipmentId);
        await logActivity(request, admin, { action: 'edit', module: 'orders', description: `Requested pickup for order ${order.orderNumber}`, targetId: order._id, targetName: order.orderNumber });
        break;
      }

      // ── Generate label ───────────────────────────────────────────────────
      case 'generate_label': {
        if (!order?.shiprocket?.shipmentId) return NextResponse.json({ success: false, message: 'No shipment ID' }, { status: 400 });
        result = await generateLabel([order.shiprocket.shipmentId]);
        break;
      }

      // ── Generate invoice ─────────────────────────────────────────────────
      case 'generate_invoice': {
        if (!order?.shiprocket?.orderId) return NextResponse.json({ success: false, message: 'No Shiprocket order ID' }, { status: 400 });
        result = await generateInvoice([order.shiprocket.orderId]);
        break;
      }

      // ── Cancel on Shiprocket ─────────────────────────────────────────────
      case 'cancel': {
        if (!order?.shiprocket?.orderId) return NextResponse.json({ success: false, message: 'No Shiprocket order ID' }, { status: 400 });
        result = await cancelShiprocketOrder([order.shiprocket.orderId]);
        await logActivity(request, admin, { action: 'edit', module: 'orders', description: `Cancelled SR shipment for order ${order.orderNumber}`, targetId: order._id, targetName: order.orderNumber });
        break;
      }

      // ── Get SR order details ─────────────────────────────────────────────
      case 'details': {
        if (!order?.shiprocket?.orderId) return NextResponse.json({ success: false, message: 'No Shiprocket order ID' }, { status: 400 });
        result = await getShiprocketOrder(order.shiprocket.orderId);
        break;
      }

      default:
        return NextResponse.json({ success: false, message: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('[SR proxy] error:', err.message);
    return NextResponse.json({ success: false, message: err.message || 'Shiprocket error' }, { status: 500 });
  }
}
