// src/app/api/admin/inquiries/stream/route.js
export const dynamic = "force-dynamic";

import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import inquiryEmitter from '@/lib/inquiryEvents';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    // 1. Verify token via header, cookie, or query param
    let token = null;

    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = request.cookies?.get?.('adminToken')?.value;
    }

    if (!token) {
      const { searchParams } = new URL(request.url);
      token = searchParams.get('token');
    }

    if (!token) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return new Response(JSON.stringify({ success: false, message: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await connectDB();
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return new Response(JSON.stringify({ success: false, message: 'Admin not found or inactive' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Set up SSE ReadableStream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connected confirmation
        const welcome = `event: connected\ndata: ${JSON.stringify({ message: 'Live stream connected' })}\n\n`;
        controller.enqueue(encoder.encode(welcome));

        // Event listener functions
        const onNewInquiry = (inquiry) => {
          try {
            const payload = `event: new-inquiry\ndata: ${JSON.stringify(inquiry)}\n\n`;
            controller.enqueue(encoder.encode(payload));
          } catch (e) {
            console.error('Error enqueueing new-inquiry event:', e);
          }
        };

        const onInquiryUpdated = (data) => {
          try {
            const payload = `event: inquiry-updated\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(payload));
          } catch (e) {
            console.error('Error enqueueing inquiry-updated event:', e);
          }
        };

        const onInquiryDeleted = (data) => {
          try {
            const payload = `event: inquiry-deleted\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(payload));
          } catch (e) {
            console.error('Error enqueueing inquiry-deleted event:', e);
          }
        };

        inquiryEmitter.on('new-inquiry', onNewInquiry);
        inquiryEmitter.on('inquiry-updated', onInquiryUpdated);
        inquiryEmitter.on('inquiry-deleted', onInquiryDeleted);

        // Heartbeat keep-alive every 20 seconds
        const heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': keepalive\n\n'));
          } catch {
            clearInterval(heartbeatInterval);
          }
        }, 20000);

        // Cleanup on abort
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval);
          inquiryEmitter.off('new-inquiry', onNewInquiry);
          inquiryEmitter.off('inquiry-updated', onInquiryUpdated);
          inquiryEmitter.off('inquiry-deleted', onInquiryDeleted);
          try {
            controller.close();
          } catch {}
        });
      },
      cancel() {
        // Handled via signal abort or controller close
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('SSE connection error:', err);
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
