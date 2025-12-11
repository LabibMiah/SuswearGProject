import { NextResponse } from "next/server";
import { openDb } from "@/db/db";
import next from "next";
import { cookies } from "next/headers";


// Database row type for donation list
type StaffListRow = {
  Donation_ID: number;
  Donor_Name: string;
  Category: string;
  Condition_Grade: string | null;
  Description: string;
  Submitted_At: string;
  PhotoUrl?: string | null; // this is to show the images
}

//staff + charity info

type StaffCharityInfoRow = {
  Staff_ID: number;
  Charity_ID: number;
  Charity_Name: string;
};

//gets the current logged in staff - and their charity pending donations 
export async function GET() {
  try {
    //reads the same cookies that login set 
    const storedCookie = await cookies();
    const role = storedCookie.get("session_role")?.value;
    const idString = storedCookie.get("session_user_id")?.value;
    const userId = idString ? Number(idString) : 0;


    
    if (role !== "Staff" || !userId) {
      return NextResponse.json(
        {error: "Unauthorised"}, 
        {status: 401}
      ); 
    }

    const db = await openDb();
    const staff = await db.get<StaffCharityInfoRow>(
    `SELECT
          s.Staff_ID,
          s.Charity_ID,
          ch.Charity_Name
       FROM Staff s
       JOIN Charity ch   ON ch.Charity_ID = s.Charity_ID
       WHERE s.User_ID = ?
       `,
       [userId]
    );

    if (!staff) {
      return NextResponse.json(
        {error: "No staff record/charity assigned for this user"}, //error message if charity does not have charity assigned to them - should not happen as each staff created requires a charity to create
        {status: 403} 
      );
    }
    

    
    const rows = await db.all<StaffListRow[]>(
      `SELECT
          d.Donation_ID,
          u.Full_Name AS Donor_Name,
          c.Name AS Category,
          d.Condition_Grade,
          d.Description,
          d.Submitted_At,
          pd.Photo_URL AS PhotoUrl
       FROM Donations d
       JOIN Donor dn   ON dn.Donor_ID = d.Donor_ID
       JOIN Users u    ON u.User_ID   = dn.User_ID
       JOIN Categories c ON c.CategoryID = d.Category_ID
       LEFT JOIN PhotoDonation pd ON pd.Donation_ID = d.Donation_ID
       WHERE d.Status = 'Pending'
        AND d.Charity_ID = ?
       ORDER BY d.Submitted_At ASC`,
       [staff.Charity_ID]
    );
    return NextResponse.json({
      charityName: staff.Charity_Name,
      rows
    });
  }
  catch (error) {
    console.error("Donations/Lists error:", error);
    return NextResponse.json({error: "Server Error"}, {status:500}); 
  }
}
