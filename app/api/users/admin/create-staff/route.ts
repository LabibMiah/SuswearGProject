import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { openDb } from "@/db/db";// Import necessary modules for handling requests, hashing passwords, and database operations

export async function POST(req: Request) {// Define the POST handler for creating a new staff account
  try {
    const db = await openDb();
    const cookies = req.headers.get("cookie") || "";// Retrieve cookies from the request headers
    const role = cookies.match(/session_role=([^;]+)/)?.[1];// Extract the user role from cookies

    if (role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });// Only allow Admin users to create staff accounts
    }

    const { fullName, email, password, charityId } = await req.json();// Parse the request body to get staff details

    if (!fullName || !email || !password || !charityId) {
      
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });// Validate that all required fields are provided
    }


    const hash = await bcrypt.hash(password, 10);// Hash the password for secure storage

    // Add to Users
    const result = await db.run(// Insert new user into Users table
      `INSERT INTO Users (Full_Name, Email, Password_Hash, User_Role)
       VALUES (?, ?, ?, 'Staff')`,
      [fullName, email, hash]// Bind parameters to prevent SQL injection
    );

    const newUserId = result.lastID;

    // Add to Staff
   await db.run(
  `INSERT INTO Staff (User_ID, Full_Name, Email, Password_Hash, User_Role, Charity_ID)
   VALUES (?, ?, ?, ?, 'Staff', ?)`,
  [newUserId, fullName, email, hash, charityId]
);


    return NextResponse.json({ message: "Staff account created successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error creating staff:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });// Ensure any errors are logged and a generic error response is returned.
  }
}

