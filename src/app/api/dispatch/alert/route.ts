import { NextResponse } from "next/server";

/**
 * Temporary in-memory storage
 * (OK for hackathon, replace with DB later)
 */
let emergencyLocation = {
  latitude: 0,
  longitude: 0,
  updated_at: new Date().toISOString(),
};

/**
 * ✅ Allow ONLY LifeLink frontend
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://lifelink-kappa-red.vercel.app",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Preflight request (required for browsers)
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Drivers poll this endpoint
 */
export async function GET() {
  return NextResponse.json(
    { location: emergencyLocation },
    { headers: corsHeaders }
  );
}

/**
 * LifeLink SOS app sends location here
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { latitude, longitude } = body;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return NextResponse.json(
        { error: "latitude and longitude must be numbers" },
        { status: 400, headers: corsHeaders }
      );
    }

    emergencyLocation = {
      latitude,
      longitude,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Emergency location received",
      },
      { headers: corsHeaders }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders }
    );
  }
}
