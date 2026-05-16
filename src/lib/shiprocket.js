// src/lib/shiprocket.js
const SR_BASE = 'https://apiv2.shiprocket.in/v1/external';

let _token    = null;
let _tokenExp = null;

export async function getShiprocketToken() {
  const now      = Date.now();
  const bufferMs = 5 * 60 * 1000;
  if (_token && _tokenExp && now < _tokenExp - bufferMs) return _token;

  const res = await fetch(`${SR_BASE}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email:    process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.token) {
    console.error('[Shiprocket] Login failed:', data);
    throw new Error(data.message || 'Failed to get Shiprocket token');
  }
  _token    = data.token;
  _tokenExp = now + 24 * 60 * 60 * 1000;
  return _token;
}

async function srFetch(method, path, body) {
  const token = await getShiprocketToken();
  const res   = await fetch(`${SR_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

export async function createShiprocketOrder(order, user) {
  const addr = order.shippingAddress;
  let totalWeight = 0, maxLength = 0, maxBreadth = 0, maxHeight = 0;

  const orderItems = order.items.map(item => {
    const s = item.shipping || { weight: 0.5, length: 10, breadth: 10, height: 10 };
    totalWeight += (s.weight || 0.5) * item.quantity;
    maxLength    = Math.max(maxLength,  s.length  || 10);
    maxBreadth   = Math.max(maxBreadth, s.breadth || 10);
    maxHeight    = Math.max(maxHeight,  s.height  || 10);
    return {
      name:          item.name,
      sku:           item.product ? String(item.product) : item.name.replace(/\s+/g, '-').toLowerCase(),
      units:         item.quantity,
      selling_price: item.price,  // per unit — SR multiplies by units
      discount: '', tax: '', hsn: 0,
    };
  });

  totalWeight = Math.max(0.1, parseFloat(totalWeight.toFixed(2)));
  const nameParts = (addr.fullName || '').split(' ');
  const orderDate = new Date(order.placedAt || order.createdAt).toISOString().replace('T', ' ').slice(0, 16);

  return srFetch('POST', '/orders/create/adhoc', {
    order_id:       order.orderNumber,
    order_date:     orderDate,
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    comment:        order.notes || '',
    billing_customer_name: nameParts[0] || addr.fullName,
    billing_last_name:     nameParts.slice(1).join(' ') || '.',
    billing_address:       addr.line1,
    billing_address_2:     addr.line2 || '',
    billing_city:          addr.city,
    billing_pincode:       addr.pincode,
    billing_state:         addr.state,
    billing_country:       'India',
    billing_email:         user?.email || '',
    billing_phone:         addr.phone,
    shipping_is_billing:   true,
    shipping_customer_name: '', shipping_last_name: '', shipping_address: '',
    shipping_address_2: '', shipping_city: '', shipping_pincode: '',
    shipping_country: '', shipping_state: '', shipping_email: '', shipping_phone: '',
    order_items:     orderItems,
    payment_method:  order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
    shipping_charges: order.shippingCharge || 0,
    giftwrap_charges: 0, transaction_charges: 0,
    total_discount:  order.discount || 0,
    sub_total:       order.total,
    length: maxLength, breadth: maxBreadth, height: maxHeight, weight: totalWeight,
  });
}

export async function getShiprocketOrder(srOrderId) {
  return srFetch('GET', `/orders/show/${srOrderId}`);
}

export async function getCourierServiceability(shipmentId, pickupPostcode, deliveryPostcode, weight, cod) {
  const params = new URLSearchParams({
    pickup_postcode:   pickupPostcode,
    delivery_postcode: deliveryPostcode,
    weight:            weight,
    cod:               cod ? 1 : 0,
  });
  if (shipmentId) params.set('shipment_id', shipmentId);
  return srFetch('GET', `/courier/serviceability/?${params}`);
}

export async function assignAWB(shipmentId, courierId) {
  return srFetch('POST', '/courier/assign/awb', {
    shipment_id: String(shipmentId),
    courier_id:  String(courierId),
  });
}

export async function requestPickup(shipmentId) {
  return srFetch('POST', '/courier/generate/pickup', {
    shipment_id: [String(shipmentId)],
  });
}

export async function trackByAWB(awb) {
  return srFetch('GET', `/courier/track/awb/${awb}`);
}

export async function trackByShipmentId(shipmentId) {
  return srFetch('GET', `/courier/track/shipment/${shipmentId}`);
}

export async function generateLabel(shipmentIds) {
  return srFetch('POST', '/courier/generate/label', {
    shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds],
  });
}

export async function generateInvoice(orderIds) {
  return srFetch('POST', '/orders/print/invoice', {
    ids: Array.isArray(orderIds) ? orderIds : [orderIds],
  });
}

export async function cancelShiprocketOrder(shiprocketOrderIds) {
  return srFetch('POST', '/orders/cancel', {
    ids: Array.isArray(shiprocketOrderIds) ? shiprocketOrderIds : [shiprocketOrderIds],
  });
}