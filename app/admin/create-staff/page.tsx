"use client";
//used to handle imports needed for the methods below
import { useState, useEffect } from "react";
import Link from "next/link";
import "./create-staff.css";


type Charity = {
  Charity_ID: number;
  Charity_Name: string;
};


// Page component for creating a new staff account
export default function CreateStaffPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [charityId, setCharityId] = useState<number | "">("");
  const [charities, setCharities] = useState<Charity[]>([]);

  //loads charities for the creation
  useEffect(() => {
  (async () => {
    try {
      const res = await fetch("/api/charity/list", {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load charities");
      const data: Charity[] = await res.json();
      setCharities(data);
    } catch (err) {
      console.error(err);
    }
  })();
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Ensure both password fields match
    if (password !== confirmPassword) {
    setMessage("Incorrect password entered. Passwords must match.");
    return;
    }

    if (!charityId) {
    setMessage("Please select a charity.");
    return;
    }


    try {
      const res = await fetch("/api/users/admin/create-staff", { //api route to create staff
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, charityId }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Staff account created successfully!"); // success message
        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessage(` ${data.error || "Error creating staff"}`); // error message
      }
    } catch (err) {
      setMessage(" Network error. Please try again."); // network error message
    }
    
  };

  return (
    <div className="admin-wrap">
      <div className="dashboard-bubble">
        {/* Back Button */}
        <div className="back-btn">
          <Link href="/admin" className="outline-btn">← Back to Dashboard</Link>
        </div>

        <h2>Create Staff Account</h2>
        <p>Add a new staff member to manage users and sustainability tasks.</p>

        <form onSubmit={handleSubmit} className="form">
          <label className="label">
            Full Name
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              required
            />
          </label>

          <label className="label">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </label>

          <label className="label">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </label>

          <label className="label">
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              required
            />
          </label>

          <label className="label">
          Assigned Charity
         <select
         value={charityId}
         onChange={(e) => setCharityId(Number(e.target.value))}
         className="input"
          required
           >
          <option value="">Select a charity</option>
           {charities.map((c) => (
           <option key={c.Charity_ID} value={c.Charity_ID}>
          {c.Charity_Name}
          </option>
          ))}
          </select>
         </label>


          <button type="submit" className="primary-btn">Create Staff</button>
        </form>

        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  );
}
