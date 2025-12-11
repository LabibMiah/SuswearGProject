"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; //import router
import "./charity.css";

interface Item {
  Inventory_ID: number;
  Donation_ID: number;
  Description?: string | null;
  WeightKg?: number | null;
  Size_Label?: string | null;
  Gender_Label?: string | null;
  Season_Type?: string | null;
  Photo_URLs?: string[] | null;
  Charity_ID: number | null;
  Charity_Name: string | null;// Added Charity_Name to the Item interface 
}

interface Charity {
  Charity_ID: number;
  Charity_Name: string;// Define Charity interface
}

export default function CharityShop() {
  const router = useRouter(); //this is the router instance

  const [items, setItems] = useState<Item[]>([]);// State to hold inventory items
  const [charities, setCharities] = useState<Charity[]>([]);// State to hold list of charities
  const [selectedCharity, setSelectedCharity] = useState<number | "">("");// State for selected charity filter
  const [loading, setLoading] = useState(true);// State to track loading status
  const [err, setErr] = useState("");// State to hold error messages

  const filteredItems = selectedCharity
    ? items.filter((item) => item.Charity_ID === selectedCharity)// Filter items based on selected charity
    : items;

  // Load charities
  useEffect(() => {
    const loadCharities = async () => {
      try {
        const res = await fetch("/api/charity/list", { cache: "no-store" });// Fetch list of charities from API
        const data = await res.json();
        if (Array.isArray(data)) setCharities(data);// Set charities if data is an array
        else setCharities([]);
      } catch (e) {
        console.error("Failed to load charities:", e);// Log any errors
        setCharities([]);// Set charities to empty array on error
      }
    };
    loadCharities();
  }, []);

  // Load items
  useEffect(() => {
    const loadItems = async () => {// Function to load inventory items
      try {
        const res = await fetch("/api/charity/inventory", { cache: "no-store" });// Fetch inventory items from API
        const data = await res.json();
        if (data && Array.isArray(data.items)) setItems(data.items);//this sets items if data.items is an array
        else setItems([]);
      } catch (e) {
        setErr("Something went wrong loading items.");// Set error message on failure
        setItems([]);
      } finally {
        setLoading(false);// Set loading to false after attempt
      }
    };
    loadItems();// Call the function to load items on component mount
  }, []);

  return (
    <main className="Main-ContainerBox">
      <header className="Charity-Header">
        {/* Back button uses router */}
        <button
          className="button button-outline"
          onClick={() => router.back()}
        >
          ← Back
        </button>
         {/*this is the buttons for the header right side*/}
        <div className="Header-Right-Buttons">
        </div>
      </header>

      <div className="Charity-Title-Section">
        <h1>Charity Shop</h1>
        <p>Browse items donated by the community.</p>
      </div>

      {err && <p style={{ color: "red", marginTop: 10 }}>{err}</p>}
      {loading && <p className="loading-text">Loading items…</p>}

      {!loading && items.length > 0 && (
        <>
          <div className="dropdown-container" style={{ marginBottom: 20 }}>
            <label htmlFor="charity-filter">Filter by Charity: </label>
            <select
              id="charity-filter"
              value={selectedCharity}
              onChange={(e) =>
                setSelectedCharity(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">All charities</option>
              {charities.map((c) => (
                <option key={c.Charity_ID} value={c.Charity_ID}>
                  {c.Charity_Name}
                </option>
              ))}
            </select>
          </div>

           {/*this is the shops grid and how the items are layed out */}
          <div className="shop-grid">
            {filteredItems.map((it) => (
              <div className="shop-card" key={it.Inventory_ID}>
                {it.Photo_URLs && it.Photo_URLs.length > 0 ? (
                  <div className="shop-img-gallery">
                    {it.Photo_URLs.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={it.Description || "Item"}
                        className="shop-img"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="shop-img-gallery no-img">
                    <span>No photo</span>
                  </div>
                )}

                <div className="shop-info">
                  <h3>{it.Description || "Unnamed item"}</h3>
                  <p className="muted">
                    Weight: {it.WeightKg ? `${it.WeightKg} kg` : "N/A"}
                  </p>
                  <p className="muted">Charity: {it.Charity_Name}</p>
                  {it.Size_Label && <p>Size: {it.Size_Label}</p>}
                  {it.Gender_Label && <p>Gender: {it.Gender_Label}</p>}
                  {it.Season_Type && <p>Season: {it.Season_Type}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && items.length === 0 && (
        <p className="loading-text">No items right now. Check again later.</p>
      )}
    </main>
  );
}
