import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            email,
            phone,
            password,
            full_name,
            unit_id,
            certification_number
        } = body;

        // ============================================
        // STEP 1: VALIDATE INPUT
        // ============================================

        // Check required fields
        if (!email || !password || !full_name || !unit_id || !certification_number) {
            return NextResponse.json({
                success: false,
                message: 'All fields are required',
                missing_fields: {
                    email: !email,
                    password: !password,
                    full_name: !full_name,
                    unit_id: !unit_id,
                    certification_number: !certification_number
                }
            }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid email format'
            }, { status: 400 });
        }

        // Validate password strength (min 8 chars, 1 uppercase, 1 number)
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json({
                success: false,
                message: 'Password must be at least 8 characters with 1 uppercase letter and 1 number'
            }, { status: 400 });
        }

        // Validate certification number format (EMS-XXXX-XXXX)
        const certRegex = /^EMS-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
        if (!certRegex.test(certification_number)) {
            return NextResponse.json({
                success: false,
                message: 'Certification number must be in format: EMS-XXXX-XXXX'
            }, { status: 400 });
        }

        // Validate unit ID format (AMB-XXX-XXX)
        // Relaxed regex to match prompt placeholder examples if needed, but strict based on prompt requirement
        const unitRegex = /^AMB-[\d]{3}-[A-Z]{2,3}$/;
        if (!unitRegex.test(unit_id)) {
            return NextResponse.json({
                success: false,
                message: 'Unit ID must be in format: AMB-XXX-NYC'
            }, { status: 400 });
        }

        // ============================================
        // STEP 2: CHECK FOR EXISTING USER
        // ============================================

        // Check if email already exists
        const existingEmail = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (existingEmail.rowCount > 0) {
            return NextResponse.json({
                success: false,
                message: 'Email already registered. Please login instead.',
                field: 'email'
            }, { status: 409 });
        }

        // Check if unit ID already exists
        const existingUnit = await db.query(
            'SELECT id FROM users WHERE unit_id = ?',
            [unit_id.toUpperCase()]
        );

        if (existingUnit.rowCount > 0) {
            return NextResponse.json({
                success: false,
                message: 'Unit ID already registered. Each ambulance can have only one driver account.',
                field: 'unit_id'
            }, { status: 409 });
        }

        // Check if certification number already exists
        const existingCert = await db.query(
            'SELECT id FROM users WHERE certification_number = ?',
            [certification_number.toUpperCase()]
        );

        if (existingCert.rowCount > 0) {
            return NextResponse.json({
                success: false,
                message: 'Certification number already registered',
                field: 'certification_number'
            }, { status: 409 });
        }

        // ============================================
        // STEP 3: HASH PASSWORD
        // ============================================

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // ============================================
        // STEP 4: CREATE USER ACCOUNT
        // ============================================

        const userId = uuidv4();

        await db.query(
            `INSERT INTO users (
        id, 
        email, 
        phone, 
        password_hash, 
        full_name, 
        unit_id, 
        certification_number,
        status,
        is_active,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'off_duty', TRUE, NOW())`,
            [
                userId,
                email.toLowerCase(),
                phone || null,
                hashedPassword,
                full_name,
                unit_id.toUpperCase(),
                certification_number.toUpperCase()
            ]
        );

        // ============================================
        // STEP 5: RETURN SUCCESS RESPONSE
        // ============================================

        return NextResponse.json({
            success: true,
            message: 'Registration successful! You can now log in.',
            user: {
                id: userId,
                email: email.toLowerCase(),
                full_name: full_name,
                unit_id: unit_id.toUpperCase(),
                created_at: new Date().toISOString()
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({
            success: false,
            message: 'Registration failed. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
