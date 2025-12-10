import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/db/db";

export async function POST(req: NextRequest) {
  try {
    // Get user ID from cookies
    const userId = Number(req.cookies.get("session_user_id")?.value || 0);
    if (!userId)
      return NextResponse.json(
        { error: "Unauthorized" }, // Return error if user is not logged in
        { status: 401 }
      );

    // Parse request body
    const body = await req.json();
    const donationId: number = Number(body?.donationId); // Get the donation ID

    if (!donationId)
      return NextResponse.json(
        { error: "donationId required" }, // Ensure donationId is provided
        { status: 400 }
      );

    const db = await openDb(); // Open database connection

    // Fetch the Charity_ID from the donation itself
    const donation = await db.get<{ Charity_ID: number }>(
      `SELECT Charity_ID FROM Donations WHERE Donation_ID = ?`,
      [donationId]
    );

    if (!donation || !donation.Charity_ID)
      return NextResponse.json(
        { error: "Donation or charity not found" }, // Check that donation exists and has a charity
        { status: 404 }
      );

    // Update Inventory from Arriving -> InStock and set the correct Charity_ID
    await db.run(
      `UPDATE Inventory
       SET Status = 'InStock',
           Charity_ID = ?,
           Updated_At = datetime('now')
       WHERE Donation_ID = ?`,
      [donation.Charity_ID, donationId] // Bind donation's Charity_ID and donationId
    );

    // Update Donation sent status to 'Sent'
    await db.run(
      `UPDATE Donations
       SET Sent_Status = 'Sent'
       WHERE Donation_ID = ?`,
      [donationId] // Bind donationId
    );

    return NextResponse.json({ ok: true }); // Return success
  } catch (err) {
    console.error(err); // Log any errors
    return NextResponse.json(
      { error: "Server error" }, // Return generic error message
      { status: 500 }
    );
  }
}
