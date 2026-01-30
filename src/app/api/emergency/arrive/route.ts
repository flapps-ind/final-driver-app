import { NextResponse } from 'next/server';

// Mock database simulation for now
// In a real application, you would import your database client here
// import db from '@/lib/db'; 

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { emergency_id, driver_id, arrival_time, location } = body;

        // Validate required fields
        if (!emergency_id || !driver_id || !arrival_time) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // SIMULATED DATABASE LOGIC
        // In production, uncomment and use actual SQL queries
        /*
        const emergency = await db.query(
          'SELECT * FROM emergency_dispatches WHERE emergency_id = $1 AND driver_id = $2',
          [emergency_id, driver_id]
        );
    
        if (emergency.rows.length === 0) {
          return NextResponse.json(
            { success: false, message: 'Emergency not found or not assigned to this driver' },
            { status: 404 }
          );
        }
    
        // Update emergency dispatch status
        await db.query(`
           UPDATE emergency_dispatches 
           SET status = 'arrived', 
               arrived_at = $1,
               arrival_latitude = $2,
               arrival_longitude = $3
           WHERE emergency_id = $4 AND driver_id = $5
        `, [arrival_time, location?.latitude, location?.longitude, emergency_id, driver_id]);
    
        // Update driver status
        await db.query(`
           UPDATE users 
           SET status = 'at_scene',
               current_latitude = $1,
               current_longitude = $2,
               updated_at = NOW()
           WHERE id = $3
        `, [location?.latitude, location?.longitude, driver_id]);
        */

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        console.log(`[API] Driver ${driver_id} arrived at emergency ${emergency_id} at ${arrival_time}`);

        return NextResponse.json({
            success: true,
            message: 'Successfully marked arrival at scene',
            data: {
                emergency_id,
                status: 'arrived',
                arrived_at: arrival_time,
                driver_status: 'at_scene',
                // Echo back for UI confirmation
                location_captured: location
            }
        });

    } catch (error: any) {
        console.error('Error in arrival endpoint:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error: error.message
            },
            { status: 500 }
        );
    }
}
