"use client";

//feedback from 03/12/2025 move this into a seperate page instead of having it on the dashboard


import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../donor.css";

//the catagories
const CATEGORIES = [
    "Clothing",
    "Men",
    "Women",
    "Children",
    "Coats & Jackets",
    "Tops",
  ] as const;



  //this is temporary until the back-end is completed and this can be replaced with the real table /api later
const CHARITIES = [
    {id: "2nd_Life_Clothing", name: "2nd Life Clothing Trust"},
    {id: "Recycle_Clothing", name: "Recycling Clothing Org"},
    {id: "Community_Clothing", name: "Community Clothing Foundation"},
]as const;

export default function DonationSubmitPage() {
    const router = useRouter();

    //form fields
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<(typeof CATEGORIES)[number] | "">("");
    const [charityID, setCharityID] = useState<string>("");
    const [weightKg, setWeightKg] = useState<number | "">("");
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
      } | null>(null);

    const[submitting, setSubmitting] = useState(false);

    //  Image handler 
    const onPhotoChange = (file: File | null) => {
    setPhotoFile(null);
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) 
    {
      setMessage({ type: "error", text: "Image must be JPG or PNG." });
      return;
    }
    setPhotoFile(file);
    setMessage(null);
  };

  // resets the form after submmiting a donation
  const resetForm = () => {
    setDescription("");
    setCategory("");
    setCharityID("");
    setWeightKg("");
    setPhotoFile(null);
  };

    //Submit donation 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

    if (!description.trim() || !category || !charityID || !weightKg || !photoFile) {
        setMessage({
            type: "error",
            text: "You must complete all fields including an image.",
          });
          return;
        }
    try {
        setSubmitting(true);

        const formData = new FormData();
        formData.append("description", description);
        formData.append("categoryId", category);
        formData.append("charityID", charityID); //temp field name for charityID - backend person - change this to the charity_id or whatever the id is later.
        formData.append(
            "weightKg",
            typeof weightKg === "number" ? weightKg.toString() : String(weightKg)
            );
        formData.append("photo", photoFile);
      
        const res = await fetch("/api/donations/create", {
            method: "POST",
            body: formData,
            credentials: "include",
        });
      
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to submit donation");
      
        setMessage({ type: "success", text: "Donation submitted successfully." });
        resetForm();
        } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        console.error(errorMsg);
        setMessage({ type: "error", text: errorMsg });
        }
        finally
        {
            setSubmitting(false); //donor is not submitting no more sets it to false
        }
    };
    
    return (
        <div className="donor-wrap Main-ContainerBox">
      <header className="donor-header">
        <div className="header-left">
          <span className="back-link" onClick={() => router.push("/donor")}>
             Back to homepage
          </span>
          <h1>Donor Dashboard</h1>
        </div>
    </header>

    {message && (
        <div
        className={`alert ${
            message.type === "success" ? "alert-success" : "alert-error"
            }`}
            >
          {message.text}
          <button
            className="alert-close"
            onClick={() => setMessage(null)}
            aria-label="Dismiss"
            >
            x
          </button>
        </div>
      )}
      <section className="card">
          <h2>Donation Details</h2>
          <form onSubmit={handleSubmit} className="form">
          <label className="lable">
          <span>Description</span>
            <textarea
                className="input"
                placeholder="e.g. Winter coat, good condition"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                />
          </label>
          <label className="label">
            <span>Category</span>
            <select
                className="input"
                value={category}
                onChange={(e) =>
                    setCategory(e.target.value as (typeof CATEGORIES)[number])
                }
                required
                >
                <option value="">Select…</option>
                {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                    {c}
                </option>
                ))}
            </select>
        </label>
        <label className="lable">
          <span>Charity</span>
            <select
                className="input"
                value={charityID}
                onChange={(e) => setCharityID(e.target.value)}
                required
                > <option value="">Select Charity</option>
                 {CHARITIES.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                    {ch.name}
                </option>
                 ))}
                 </select>
                 {/*temp*/}
                 <small className="hint"> The back-end developer will link the charity table in the database</small>
          </label>

          <label className="label">
            <span>Weight (kg)</span>
            <input
                className="input"
                type="number"
                min={0}
                step={0.1}
                value={weightKg}
                onChange={(e) =>
                setWeightKg(
                    e.target.value === "" ? "" : Number(e.target.value)
                )
                }
                required
            />
            </label>

            <label className="label">
            <span>Upload Item Image</span>
            <input
                className="input file-input"
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
                required
            />
            <small className="hint">JPG or PNG only.</small>
            </label>

            <button className="primary-btn" type="submit" disabled={submitting}>{submitting ? "Submitting.." : "Upload"}</button>
            </form>
        </section>
        </div>
    );
}