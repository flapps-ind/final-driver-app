import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

let latestPatientLocation: {
  latitude: number;
  longitude: number;
  updated_at: string;
} | null = null;

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.latitude && body.longitude && !body.emergency_id) {
      latestPatientLocation = {
        latitude: body.latitude,
        longitude: body.longitude,
        updated_at: new Date().toISOString(),
      };

      console.log("[API] Patient location received:", latestPatientLocation);

      return NextResponse.json(
        { success: true, location: latestPatientLocation },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { location: latestPatientLocation },
    { headers: corsHeaders }
  );
}


/* ------------------------------------------------------------------
   DELETE
   - Clears active emergency (called after dispatch completion)
------------------------------------------------------------------ */
export async function DELETE() {
    console.log("[API] Emergency cleared");

    // Clear in-memory emergency
    latestPatientLocation = null;

    return NextResponse.json({
        success: true,
        message: "Emergency cleared successfully"
    });
}
