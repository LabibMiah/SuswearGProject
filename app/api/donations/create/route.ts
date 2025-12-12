import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/db/db";
import fs from "fs";
import path from "path";

export const config = { api: { bodyParser: false } };

//this handles creation of a donation
export async function POST(req: NextRequest) {
  try {
    const rawUid = req.cookies.get("session_user_id")?.value;//this gets that users cookies 
    if (!rawUid) {
      return NextResponse.json({ error: "Login first." }, { status: 401 });//if there isnt a cookie, this will display meaning you would have to login first
    }

    const uidNum = Number(rawUid);
    if (!uidNum) {
      return NextResponse.json({ error: "Bad session." }, { status: 400 });//if the cookies isnt a number this will display
    }

    //parse the form data to get the donations info
    const fd = await req.formData();
    const des = fd.get("description")?.toString().trim() || "";
    const catIDstr = fd.get("categoryId")?.toString() || "";
    const catID = Number(catIDstr);
    const wStr = fd.get("weightKg")?.toString();
    const file = fd.get("photo") as File | null;
    const charityInput = fd.get("charityId")?.toString();
    
    if (!charityInput) {
    return NextResponse.json({ error: "Charity not selected." }, { status: 400 });
    }

    const charityId = Number(charityInput);
    if (!charityId) {
    return NextResponse.json({ error: "Bad charity." }, { status: 422 });
    }

    if (!des || !catID || !wStr || !file) {
      return NextResponse.json({ error: "Missing stuff." }, { status: 400 });
    }

    const w = parseFloat(wStr);
    if (!w || w < 0) {
      return NextResponse.json({ error: "Weight seems wrong." }, { status: 422 });
    }

    const db = await openDb();

    // Match the donor for this user
    const donorResult = await db.get<{ Donor_ID: number }>(
      "SELECT Donor_ID FROM Donor WHERE User_ID = ?",
      [uidNum]
    );
    if (!donorResult) {
      return NextResponse.json({ error: "No donor attached." }, { status: 404 });
    }

    // storing uploads (yeah, could be tidier)
    const outDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const messyName = `${Date.now()}_${file.name}`;
    const fullPath = path.join(outDir, messyName);

    const fileBuff = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(fullPath, fileBuff);

    // Insert donation first
const saved = await db.run(
  `INSERT INTO Donations 
   (Donor_ID, Description, Category_ID, WeightKg, Charity_ID, Status, Submitted_At)
   VALUES (?, ?, ?, ?, ?, 'Pending', datetime('now'))`,
  [donorResult.Donor_ID, des, catID, w, charityId]
);



    const newID = saved.lastID;

    // Now stick the image reference in
    await db.run(
      `INSERT INTO PhotoDonation (Donation_ID, Photo_URL, Uploaded_At)
       VALUES (?, ?, datetime('now'))`,
      [newID, `/uploads/${messyName}`]
    );

    return NextResponse.json({ ok: true, id: newID });
  } catch (err: unknown) {
    // Different message depending on what happened (non-uniform)
    let msg = "Something went wrong here.";
    if (err instanceof Error) {
      msg = err.message || "Unexpected failure.";
    }

    console.error("POST /donation error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
