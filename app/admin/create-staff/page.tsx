"use client";

import { useState } from "react";
import Link from "next/link";
import "./create-staff.css";

// Page component for creating a new staff account
export default function CreateStaffPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/users/admin/create-staff", { //api route to create staff
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Staff account created successfully!"); // success message
        setFullName("");
        setEmail("");
        setPassword("");
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

          <button type="submit" className="primary-btn">Create Staff</button>
        </form>

        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  );
}
