import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { driver_id, latitude, longitude, accuracy, speed, heading } = body;

        // Validate input
        if (!driver_id || latitude === undefined || longitude === undefined) {
            return NextResponse.json({
                success: false,
                message: 'Missing required fields'
            }, { status: 400 });
        }

        // Update current location in users table
        await db.query(
            `UPDATE users SET current_latitude = ?, current_longitude = ?, current_accuracy = ?, current_speed = ?, current_heading = ?, updated_at = NOW() WHERE id = ?`,
            [latitude, longitude, accuracy, speed, heading, driver_id]
        );

        // Store in location history
        await db.query(
            `INSERT INTO driver_locations (driver_id, latitude, longitude, accuracy, speed, heading, recorded_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [driver_id, latitude, longitude, accuracy, speed, heading]
        );

        // In a real app we'd broadcast here via WebSocket

        return NextResponse.json({
            success: true,
            message: 'Location updated successfully'
        });

    } catch (error: any) {
        console.error('Location update error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update location',
            error: error.message
        }, { status: 500 });
    }
}
