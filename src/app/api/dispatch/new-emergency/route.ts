import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateDistance } from '@/lib/distance';

export async function POST(req: Request) {
    try {
        // ============================================
        // STEP 1: VALIDATE API KEY (Security)
        // ============================================
        const apiKey = req.headers.get('x-api-key');

        // In a real app, this would be in process.env.DISPATCH_API_KEY
        if (!apiKey || apiKey !== 'emergency-dispatch-key-2024') {
            return NextResponse.json({
                success: false,
                message: 'Invalid or missing API key'
            }, { status: 401 });
        }

        // ============================================
        // STEP 2: EXTRACT PATIENT LOCATION DATA
        // ============================================
        const body = await req.json();
        const {
            patient_latitude,
            patient_longitude,
            patient_address,
            emergency_type,
            priority,
            caller_phone,
            notes,
            caller_name
        } = body;

        // Validate required fields
        if (patient_latitude === undefined || patient_longitude === undefined) {
            return NextResponse.json({
                success: false,
                message: 'Patient latitude and longitude are required'
            }, { status: 400 });
        }

        // Validate coordinate ranges
        if (patient_latitude < -90 || patient_latitude > 90 || patient_longitude < -180 || patient_longitude > 180) {
            return NextResponse.json({
                success: false,
                message: 'Invalid coordinates'
            }, { status: 400 });
        }

        // ============================================
        // STEP 3: GENERATE UNIQUE EMERGENCY ID
        // ============================================
        const emergencyId = `EMG-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        // ============================================
        // STEP 4: FIND ALL AVAILABLE DRIVERS
        // ============================================
        const availableDriversResult = await db.query(
            `SELECT id, full_name, unit_id, current_latitude, current_longitude FROM users WHERE status = 'available' AND is_active = TRUE`
        );

        const availableDrivers = availableDriversResult.rows;

        if (availableDrivers.length === 0) {
            // Log as pending if no drivers available
            return NextResponse.json({
                success: true,
                message: 'Emergency logged. No drivers currently available.',
                emergency_id: emergencyId,
                status: 'pending'
            }, { status: 202 });
        }

        // ============================================
        // STEP 5: CALCULATE DISTANCE & FIND NEAREST
        // ============================================
        const driversWithDistance = availableDrivers.map((driver: any) => {
            const distance = calculateDistance(
                driver.current_latitude,
                driver.current_longitude,
                patient_latitude,
                patient_longitude
            );
            return { ...driver, distance_km: distance };
        });

        driversWithDistance.sort((a: any, b: any) => a.distance_km - b.distance_km);
        const nearestDriver = driversWithDistance[0];

        // ============================================
        // STEP 6: CALCULATE ETA
        // ============================================
        const averageSpeed = priority === 'critical' ? 80 : 60; // km/h
        const etaMinutes = Math.ceil((nearestDriver.distance_km / averageSpeed) * 60);
        const etaFormatted = `${Math.floor(etaMinutes / 60)}:${(etaMinutes % 60).toString().padStart(2, '0')}`;

        // ============================================
        // STEP 7: CREATE DISPATCH RECORD
        // ============================================
        await db.query(
            `INSERT INTO emergency_dispatches (emergency_id, driver_id, location_latitude, location_longitude, address, emergency_type, priority, caller_phone, caller_name, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'dispatched')`,
            [emergencyId, nearestDriver.id, patient_latitude, patient_longitude, patient_address, emergency_type, priority, caller_phone, caller_name, notes]
        );

        // ============================================
        // STEP 8: UPDATE DRIVER STATUS
        // ============================================
        await db.query(
            `UPDATE users SET status = 'en_route' WHERE id = ?`,
            [nearestDriver.id]
        );

        // ============================================
        // STEP 9: RETURN SUCCESS
        // ============================================
        // NOTE: In a real app with Socket.io, we would emit the event here.
        // Since Next.js API routes are stateless, we'd typically use a separate 
        // WebSocket server or a service like Pusher/Ably.

        return NextResponse.json({
            success: true,
            message: 'Emergency dispatched successfully',
            emergency_id: emergencyId,
            assigned_driver: {
                driver_id: nearestDriver.id,
                name: nearestDriver.full_name,
                unit_id: nearestDriver.unit_id,
                distance: `${nearestDriver.distance_km.toFixed(2)} km`,
                eta: etaFormatted
            },
            patient_location: {
                latitude: patient_latitude,
                longitude: patient_longitude,
                address: patient_address
            }
        });

    } catch (error: any) {
        console.error('Dispatch error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to dispatch emergency',
            error: error.message
        }, { status: 500 });
    }
}
