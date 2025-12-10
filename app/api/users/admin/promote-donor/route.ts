import { NextResponse } from "next/server";
import { openDb } from "@/db/db";

export async function POST(req: Request) {
  try {
    const { userId, charityId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });// Validate that userId is provided
    }

    if (!charityId){
      return NextResponse.json({error:"charityId is required"}, {status: 400})
    }

    const db = await openDb();

    // Get the donor
    const donor = await db.get<{
      Donor_ID: number;
      Full_Name: string;
      Email: string;
      Password_Hash: string;
    }>("SELECT * FROM Donor WHERE User_ID = ?", [userId]);

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    // Update Users table role
    await db.run("UPDATE Users SET User_Role = 'Staff' WHERE User_ID = ?", [userId]);

    // Insert into Staff table
    await db.run(
      `INSERT INTO Staff (User_ID, Full_Name, Email, Password_Hash, User_Role, Charity_ID)
       VALUES (?, ?, ?, ?, 'Staff', ?)`,
      [userId, donor.Full_Name, donor.Email, donor.Password_Hash, charityId]// Bind parameters to prevent SQL injection
    );

    // Delete from Donor table
    await db.run("DELETE FROM Donor WHERE User_ID = ?", [userId]);// Bind parameters to prevent SQL injection

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Promote donor error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });// Ensure any errors are logged and a generic error response is returned.
  }
}
