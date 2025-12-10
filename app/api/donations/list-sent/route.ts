import { NextResponse } from "next/server";
import { openDb } from "@/db/db";

export async function GET(req: Request) {
  try {
    // Get user ID from cookies
    const cookieHeader = req.headers.get("cookie") || ""; // Get all cookies
    const donorCookie = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("session_user_id=")); // Find the specific cookie

    if (!donorCookie)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 }); // Not logged in

    const userId = parseInt(donorCookie.split("=")[1]); // Parse user ID from cookie
    if (isNaN(userId))
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 }); // Invalid cookie

    const db = await openDb(); // Open DB connection
    
    // Get Donor_ID for this user
    const donor = await db.get<{ Donor_ID: number }>(
      "SELECT Donor_ID FROM Donor WHERE User_ID = ?",
      [userId]
    );
    if (!donor)
      return NextResponse.json({ error: "Donor not found" }, { status: 404 }); // User has no donor profile

    // Get accepted donations with inventory status and charity info
    const donations = await db.all<{
      Donation_ID: number;
      Description: string;
      WeightKg: number | null;
      Tracking: string;
      Submitted_At: string;
      Status: string;
      Inventory_Status: string | null;
      Charity_ID: number | null;
      Charity_Name: string | null;
    }>(
      `SELECT d.Donation_ID,
              d.Description,
              d.WeightKg,
              d.Tracking,
              d.Submitted_At,
              d.Status,
              i.Status AS Inventory_Status,
              d.Charity_ID,
              c.Charity_Name
       FROM Donations d
       LEFT JOIN Inventory i ON d.Donation_ID = i.Donation_ID
       LEFT JOIN Charity c ON d.Charity_ID = c.Charity_ID
       WHERE d.Donor_ID = ?
         AND d.Status = 'Accepted'
         AND d.Tracking IS NOT NULL
       ORDER BY d.Submitted_At DESC`,
      [donor.Donor_ID] // Get all donations made by this donor
      // Left join Inventory to get Inventory_Status
      // Left join Charity to get Charity_Name if already assigned
      // Only fetch donations that are accepted and have tracking info
    );

    return NextResponse.json(donations); // Return donations with all relevant info
  } catch (err) {
    console.error("list-sent error:", err); // Log any errors
    return NextResponse.json({ error: "Server error" }, { status: 500 }); // Generic error response
  }
}
