"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import "../promote/promote.css";

type Charity = {
  Charity_ID: number;
  Charity_Name: string;
};

// just the fields we actually need
type User = {
  User_ID: number;
  Full_Name: string;
  Email: string;
};

export default function PromotePage() {
  const [donorList, setDonorList] = useState<User[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<number | "">("");


  // load donor + staff data
  const loadUsers = async () => {
    try {
      const d = await fetch("/api/users/donors");
      const s = await fetch("/api/users/staff");
      const c = await fetch("/api/charity/list");
      

      const donorsJson = await d.json();
      const staffJson = await s.json();
      const charitiesJson = await c.json();

      setCharities(charitiesJson);
      setDonorList(donorsJson);
      setStaffList(staffJson);
    } catch (err) {
      console.error("fetch users failed:", err);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    loadUsers();
  }, []);

  // move this user to staff
  const makeStaff = async (uid: number) => {

    if (!selectedCharity) {
     alert("Please select a charity first");
     return;
    }

    const ok = confirm("Turn this donor into staff")
    if (!ok) return;

    try {
      const r = await fetch("/api/users/admin/promote-donor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, charityId: selectedCharity}),
      });

      const out = await r.json();

      if (!out.ok) {
        alert(out.error || "Couldn't promote user");
        return;
      }

      alert("Done");
      setSelectedCharity("");
      loadUsers();
    } catch (e) {
      console.error("promote failed:", e);
      alert("Something went wrong");
    }
  };
  

  // drop staff back to donor
  const removeStaff = async (uid: number) => {
    if (!confirm("Remove staff status from this user?")) return;

    try {
      const r = await fetch("/api/users/admin/depromote-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      });

      const out = await r.json();

      if (!out.ok) {
        alert(out.error || "Couldn't update user");
        return;
      }

      alert("Updated");
      loadUsers();
    } catch (err) {
      console.error("depromote failed:", err);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="admin-wrap">
      <div className="dashboard-bubble">
        
        {/* Back Button - Added */}
        <div style={{ marginBottom: "20px" }}>
          <Link href="/admin" className="outline-btn">
            ← Back to Admin
          </Link>
        </div>

        <h2>Manage Roles</h2>

        <h3>Donors</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {donorList.map((u) => (
              <tr key={u.User_ID}>
                <td>{u.Full_Name}</td>
                <td>{u.Email}</td>
                <td>
                 <select
                 value={selectedCharity}
                 onChange={(e) => setSelectedCharity(Number(e.target.value))}
                 className="input"
                 required
                 >
                  <option value="">Select Charity</option>
                  {charities.map((c) => (
                    <option key={c.Charity_ID} value={c.Charity_ID}>
                      {c.Charity_Name}
                    </option>
                  ))}
                 </select>
                 <button 
                 className="primary-btn"
                 onClick={() => makeStaff(u.User_ID)}
                 style={{ marginLeft: "10px"}}
                 >
                  Promote
                 </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Staff</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {staffList.map((u) => (
              <tr key={u.User_ID}>
                <td>{u.Full_Name}</td>
                <td>{u.Email}</td>
                <td>
                  <button
                    className="primary-btn"
                    onClick={() => removeStaff(u.User_ID)}
                  >
                    Depromote
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}
