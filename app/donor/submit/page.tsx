"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../donor.css";

type Category = {
  CategoryID: number;
  Name: string;
}

type Charity = {
  Charity_ID: number;
  Charity_Name: string;
};

export default function DonationSubmitPage() {
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [categoryID, setCategoryID] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<number | "">("");



  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load categories");
        const data: Category[] = await res.json();
        setCategories(data);
      }   catch (err) {
        console.error(err);
      }
    })();
  },[]);
  
  // Fetch charities on mount
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
      }   catch (err) {
        console.error(err);
      }
    })();
  },[]);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // Image handler
  const onPhotoChange = (file: File | null) => {
    setPhotoFile(null);
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setMessage({ type: "error", text: "Image must be JPG or PNG." });
      return;
    }
    setPhotoFile(file);
    setMessage(null);
  };

  const resetForm = () => {
    setDescription("");
    setCategoryID("");
    setWeightKg("");
    setSelectedCharity("");
    setPhotoFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || categoryID === "" || !weightKg || !photoFile  ||  !selectedCharity) {
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
      formData.append("categoryId", categoryID.toString());
      formData.append(
        "weightKg",
        typeof weightKg === "number" ? weightKg.toString() : String(weightKg)
      );
      formData.append("photo", photoFile);

        formData.append("charityId", selectedCharity.toString());

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
    } finally {
      setSubmitting(false);
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
          <label className="label">
            <span>Description: Item + Condition + Size Lable + Gender + Season</span>
            <textarea
              className="input"
              placeholder="e.g. Black coat, good condition (Condition Grade), Medium (Size Lable), Male (Gender), Winter (Season) "
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
              value={categoryID}
              onChange={(e) =>
                setCategoryID(e.target.value === "" ? "" : Number(e.target.value))
              }
              required
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.CategoryID} value={c.CategoryID}>
                  {c.Name}
                </option>
              ))}
            </select>
          </label>

          <label className="label">
  <span>Charity</span>
  <select
    className="input"
    value={selectedCharity}
    onChange={(e) => setSelectedCharity(Number(e.target.value))}
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

          <button
            className="primary-btn"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Submitting.." : "Upload"}
          </button>
        </form>
      </section>
    </div>
  );
}
