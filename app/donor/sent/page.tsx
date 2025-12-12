"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./sent.css";

type Charity = {
  Charity_ID: number;
  Charity_Name: string;
};

type SentDonation = {
  Donation_ID: number;
  Description: string;
  WeightKg: number | null;
  Tracking: string;
  Submitted_At: string;
  Status: string;
  Inventory_Status?: "Arriving" | "InStock" | null;
  Charity_ID?: number | null; 
  Charity_Name?: string | null;
};

export default function SentDonations() {
  const router = useRouter();
  const [donations, setDonations] = useState<SentDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCharities, setSelectedCharities] = useState<Record<number, number>>({});
  const [charities, setCharities] = useState<Charity[]>([]);

  useEffect(() => {
  if (donations.length > 0) {
    const initialCharities: Record<number, number> = {};
    donations.forEach((d) => {
      if (d.Charity_ID) {
        initialCharities[d.Donation_ID] = d.Charity_ID; // pre-fill the charity
      }
    });
    setSelectedCharities(initialCharities);
  }
}, [donations]);


  useEffect(() => {
    (async () => {
      try {
        setError("");
        const res = await fetch("/api/donations/list-sent", {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Failed to load sent donations");
        }
        const data: SentDonation[] = await res.json();
        setDonations(data);
      } catch (e: Error | unknown) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  
  // Handle Charities
  
  useEffect(() => {
  (async () => {
    try {
      const res = await fetch("/api/charity/list", {
        cache: "no-store",/* No caching to ensure fresh data */
        credentials: "include", /* Include cookies for authentication */
      });

      if (!res.ok) {throw new Error("Failed to load charities");}

      const data: Charity[] = await res.json();
      setCharities(data);// Set charities state
    } catch (e) {
      console.error(e);
    }
  })();
}, []);

  const handleSend = async (donationId: number) => {
    const charityid = selectedCharities[donationId];// Get selected charity ID for this donation
    if (!charityid || isNaN(charityid)) {
      alert("Please select a charity for this donation before sending.");
      return;
    }

    const confirmed = confirm(
      "Have you posted this item to our local warehouse?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/donations/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");


      setDonations((prev) =>
        prev.map((d) =>
          d.Donation_ID === donationId
            ? { ...d, Inventory_Status: "InStock" }
            : d
        )
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
  <div className="donor-wrap Main-ContainerBox">
    <header className="donor-header">
      <h1>Sent Donations</h1>
      <button onClick={() => router.push("/donor")} className="outline-btn">
        ← Back to Dashboard
      </button>
    </header>

    {/* BIG BUBBLE WRAPPER — now wraps EVERYTHING */}
    <div className="BigBubbleBox">

      {/* PAGE DESCRIPTION */}
      <p className="page-desc">
        Finalise your donation process by posting your accepted items to our
        warehouse. Use the warehouse address below when sending your package.
      </p>

      {/* WAREHOUSE BOX */}
      <div className="warehouse-box">
        <h2 className="warehouse-title">Warehouse</h2>
        <div className="warehouse-card">
          <h3 className="warehouse-name">Sheffield Central Warehouse</h3>
          <p>
            125 Meadowhall Way<br />
            Sheffield, S9 1EP<br />
            United Kingdom
          </p>

          <p className="warehouse-note">
            This is a demonstration address for development purposes.
          </p>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && <p className="alert alert-error">{error}</p>}

      {/* TABLE OR LOADING */}
      {loading ? (
        <p className="muted">Loading sent donations…</p>
      ) : donations.length === 0 ? (
        <p className="muted">You haven’t had any accepted donations yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Weight (kg)</th>
                <th>Tracking Number</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {donations.map((d) => (
                <tr key={d.Donation_ID}>
                  <td>{d.Donation_ID}</td>
                  <td>{d.Description}</td>
                  <td>{d.WeightKg?.toFixed(1) ?? "-"}</td>
                  <td>{d.Tracking}</td>
                  <td>{new Date(d.Submitted_At).toLocaleDateString()}</td>
               <td>
  {d.Inventory_Status === "Arriving" ? (
    <>
      <span>{d.Charity_Name ?? "Unknown charity"}</span>
      <button
        className="primary-btn"
        onClick={() => handleSend(d.Donation_ID)}
      >
        Send
      </button>
    </>
  ) : (
    <span className="muted">{d.Charity_Name ?? "Sent"}</span>
  )}
</td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

    </div> 

  </div>
);
}
