import { NextResponse } from "next/server";
import { openDb } from "@/db/db";

export async function GET() {
    try {

        const db = await openDb();
        const rows = await db.all(`SELECT CategoryID, Name FROM Categories ORDER BY NAME asc`);
        return NextResponse.json(rows);
    }
    catch (error) {
        console.error("Error Category list: ",error);
        return NextResponse.json({ error: "Failed to load catagories"}, {status: 500});
    }
}
