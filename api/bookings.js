// Vercel API Route: /api/bookings
import { sql, initDatabase } from '../lib/neon-db.js';
import { withTenantContext } from '../lib/subdomain-middleware.js';
// import jwt from 'jsonwebtoken'; // TODO: Implement JWT validation

async function bookingsHandler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Initialize database if needed
    await initDatabase();

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return await getBookings(req, res);
      case 'POST':
        return await createBooking(req, res);
      case 'PUT':
        return await updateBooking(req, res);
      case 'DELETE':
        return await deleteBooking(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Bookings API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Get bookings with tenant filtering
async function getBookings(req, res) {
  try {
    const { room_id, date, status } = req.query;
    
    // Get tenant from middleware (either from subdomain or query param)
    const tenant = req.tenant;
    const tenant_id = tenant ? tenant.id : req.query.tenant_id;
    
    // Validate tenant_id is provided
    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required'
      });
    }
    
    let query = `
      SELECT 
        b.id, b.tenant_id, b.room_id, b.customer_name, b.customer_email, b.customer_phone,
        b.start_time, b.end_time, b.status, b.notes, b.total_price,
        b.created_at, b.updated_at,
        r.name as room_name, r.capacity as room_capacity, r.category as room_category
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.tenant_id = $1 AND b.deleted_at IS NULL AND r.deleted_at IS NULL
    `;
    
    const params = [tenant_id];
    
    if (room_id) {
      query += ` AND b.room_id = $${params.length + 1}`;
      params.push(room_id);
    }
    
    if (date) {
      query += ` AND DATE(b.start_time) = $${params.length + 1}`;
      params.push(date);
    }
    
    if (status) {
      query += ` AND b.status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY b.start_time`;
    
    const result = await sql.unsafe(query, params);
    
    const bookings = result.map(row => ({
      id: row.id,
      tenantId: row.tenant_id,
      roomId: row.room_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
      notes: row.notes,
      totalPrice: parseFloat(row.total_price || 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      room: {
        id: row.room_id,
        name: row.room_name,
        capacity: row.room_capacity,
        category: row.room_category
      }
    }));

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
}

// Create booking with tenant validation
async function createBooking(req, res) {
  try {
    const { 
      room_id, 
      customer_name, 
      customer_email, 
      customer_phone, 
      start_time, 
      end_time, 
      notes 
    } = req.body;

    // Get tenant from middleware (either from subdomain or body)
    const tenant = req.tenant;
    const tenant_id = tenant ? tenant.id : req.body.tenant_id;

    // Validate required fields
    if (!tenant_id || !room_id || !customer_name || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields (tenant_id, room_id, customer_name, start_time, end_time)'
      });
    }

    // Verify room belongs to tenant
    const roomCheck = await sql`
      SELECT id, price_per_hour FROM rooms 
      WHERE id = ${room_id} AND tenant_id = ${tenant_id} AND is_active = true AND deleted_at IS NULL
    `;

    if (roomCheck.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Room not found or does not belong to tenant'
      });
    }

    // Check for time conflicts within tenant
    const conflictCheck = await sql`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE tenant_id = ${tenant_id} AND room_id = ${room_id} 
        AND status != 'cancelled' AND deleted_at IS NULL
        AND (
          (start_time < ${end_time} AND end_time > ${start_time})
        )
    `;

    if (conflictCheck[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: 'Time slot conflicts with existing booking'
      });
    }

    const pricePerHour = parseFloat(roomCheck[0].price_per_hour);
    
    // Calculate total price
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);
    const totalPrice = durationHours * pricePerHour;

    // Create booking with tenant_id
    const result = await sql`
      INSERT INTO bookings (
        tenant_id, room_id, customer_name, customer_email, customer_phone,
        start_time, end_time, notes, total_price
      )
      VALUES (
        ${tenant_id}, ${room_id}, ${customer_name}, ${customer_email}, ${customer_phone},
        ${start_time}, ${end_time}, ${notes}, ${totalPrice}
      )
      RETURNING *
    `;

    const booking = result[0];

    // Get room details
    const roomResult2 = await sql`
      SELECT name, capacity, category 
      FROM rooms 
      WHERE id = ${room_id}
    `;

    const bookingWithRoom = {
      id: booking.id,
      tenantId: booking.tenant_id,
      roomId: booking.room_id,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      customerPhone: booking.customer_phone,
      startTime: booking.start_time,
      endTime: booking.end_time,
      status: booking.status,
      notes: booking.notes,
      totalPrice: parseFloat(booking.total_price),
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      room: {
        id: booking.room_id,
        name: roomResult2[0].name,
        capacity: roomResult2[0].capacity,
        category: roomResult2[0].category
      }
    };

    res.status(201).json({
      success: true,
      data: bookingWithRoom
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking'
    });
  }
}

// Update booking
async function updateBooking(req, res) {
  try {
    const { id } = req.query;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID is required'
      });
    }

    // Build dynamic update query
    const updateFields = [];
    const params = [];
    
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        updateFields.push(`${key} = $${params.length + 1}`);
        params.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    updateFields.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE bookings 
      SET ${updateFields.join(', ')}
      WHERE id = $${params.length}
      RETURNING *
    `;

    const result = await sql.unsafe(query, params);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const booking = result[0];

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking'
    });
  }
}

// Delete booking
async function deleteBooking(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID is required'
      });
    }

    const result = await sql`
      DELETE FROM bookings 
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete booking'
    });
  }
}

// Export with tenant context middleware
export default withTenantContext(bookingsHandler);
