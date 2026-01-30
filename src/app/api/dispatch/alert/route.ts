import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { latitude, longitude } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude required" },
        { status: 400 }
      );
    }

    // TODO:
    // 1. Save location to DB
    // 2. Assign nearest ambulance
    // 3. Notify driver app

    return NextResponse.json({
      status: "success",
      message: "Location received",
      location: { latitude, longitude },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}
