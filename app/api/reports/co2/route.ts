import { NextResponse } from "next/server";
import { openDb } from "@/db/db";

// gets the database roles
type DonorRow = { Donor_ID: number; Full_Name: string; Email: string };
type DonationRow = { Donation_ID: number; Description: string; CategoryName: string };

// kg saved per accepted/distributed donation
const CO2_KG: Record<string, number> = {
  "General Clothing": 2.0,
  "Trousers & Jeans": 3.0,
  "Hoodies & Sweatshirts": 3.0,
  "Children's Clothing": 2.0,
  "Coats & Jackets": 10.0,
  "Tops & T-Shirts": 1.8,
};

const LANDFILL_KG: Record<string, number> = {
  "General Clothing": 2.0,
  "Trousers & Jeans": 3.0,
  "Hoodies & Sweatshirts": 3.0,
  "Children's Clothing": 2.0,
  "Coats & Jackets": 10.0,
  "Tops & T-Shirts": 1.8,
};

const DFLT_CO2 = 3.0;
const DFLT_LF = 2.0;

// generates the co2 and landfill reports that are saved in the database (global and per donor)
export async function POST(req: Request) {
  try {
    const { donorEmail } = await req.json().catch(() => ({ donorEmail: null }));
    const isGlobal = !donorEmail;

    const db = await openDb();

    // gets the donor row if they select the donor
    let donorRow: DonorRow | undefined;
    if (!isGlobal) {
      donorRow = (await db.get(
        `
        SELECT dn.Donor_ID, u.Full_Name, u.Email
        FROM Donor dn
        JOIN Users u ON u.User_ID = dn.User_ID
        WHERE LOWER(u.Email) = LOWER(?)
        `,
        [donorEmail]
      )) as DonorRow | undefined;

      if (!donorRow) {
        return NextResponse.json({ error: "Donor not found" }, { status: 404 });
      }
    }

    // gets the accepted/distributed donations (global or by donor)
    const donations = (await db.all(
      `
      SELECT d.Donation_ID,
             d.Description,
             c.Name AS CategoryName
      FROM Donations d
      JOIN Categories c ON c.CategoryID = d.Category_ID
      WHERE d.Status IN ('Accepted', 'Distributed')
      ${isGlobal ? "" : "AND d.Donor_ID = ?"}
      ORDER BY d.Submitted_At DESC
      `,
      isGlobal ? [] : [donorRow!.Donor_ID]
    )) as DonationRow[];

    // Co2 and landfill caculation
    let totalCO2 = 0; //place holder
    let landfillSavedKG = 0; //place holder
    const perDonation: Array<{
      donationId: number;
      description: string;
      type: string;
      co2Saved: number;
    }> = [];

    for (const d of donations) {
      const type = d.CategoryName || "General Clothing";
      const c = CO2_KG[type] ?? DFLT_CO2;
      const l = LANDFILL_KG[type] ?? DFLT_LF;
      totalCO2 += c;
      landfillSavedKG += l;

      if (!isGlobal) {
        perDonation.push({
          donationId: d.Donation_ID,
          description: d.Description,
          type,
          co2Saved: c,
        });
      }
    }

    //
    //inserts and updates metrtics 
    if (isGlobal) {
      const today = new Date().toISOString().slice(0, 10);

      try {
        await db.run(
          `
          INSERT INTO Metrics (Metric_Date, Total_Donations, Co2_Saved_KG, Landfill_Saved_KG)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(Metric_Date) DO UPDATE SET
            Total_Donations   = excluded.Total_Donations,
            Co2_Saved_KG      = excluded.Co2_Saved_KG,
            Landfill_Saved_KG = excluded.Landfill_Saved_KG
          `,
          [
            today,
            donations.length,
            Number(totalCO2.toFixed(1)),
            Number(landfillSavedKG.toFixed(1)),
          ]
        );
      } catch (e) {
        // If theres an error it keeps request successful
        try {
          await db.run(
            `
            INSERT OR REPLACE INTO Metrics (Metric_Date, Total_Donations, Co2_Saved_KG, Landfill_Saved_KG)
            VALUES (?, ?, ?, ?)
            `,
            [
              today,
              donations.length,
              Number(totalCO2.toFixed(1)),
              Number(landfillSavedKG.toFixed(1)),
            ]
          );
        } catch (inner) {
          console.warn("Could not get metrics!:", inner);
        }
      }
    }

    // assigns it all together 
    if (isGlobal) {
      //total donations = all donors donation
      return NextResponse.json({
        scope: "all",
        totalDonations: donations.length,
        totalCO2: Number(totalCO2.toFixed(1)),
        landfillSavedKG: Number(landfillSavedKG.toFixed(1)),
      });
    } else {

      //total donation from this donor selected
      return NextResponse.json({
        scope: "donor",
        donor: donorRow!.Full_Name,
        email: donorRow!.Email,
        totalDonations: donations.length,
        totalCO2: Number(totalCO2.toFixed(1)),
        landfillSavedKG: Number(landfillSavedKG.toFixed(1)),
        donations: perDonation,
      });
    }
  } catch (err) {
    console.error("Co2 report error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
