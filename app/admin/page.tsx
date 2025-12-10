"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import "./admin.css";

//this is the admin dashbaord which will load up all the admin tools 
export default function AdminDashboard() {
  const adminName = "Alice"; // session later
  const router = useRouter();

  //This is how the admin will logout as to make sure they can check other pages aswell
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
      alert("Failed to log out.");
    }
  };

  //this is the layout of the admin dashboard
  return (
    <div className="admin-wrap">
      <div className="dashboard-bubble">
        <header className="admin-header">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <span className="back-link"></span>
          </div>

          {/* i added a logout button as there wasnt one in the first place*/}
          <div className="header-actions">
            <button className="ghost-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <section className="welcome-section">
          <h2>Welcome back, {adminName}!</h2>
          <p>Manage your system from here:</p>
        </section>

        

        <div className="grid admin-tools">
          {/* this is the report button which will alow you to load in all the reports of each user that is within using this web app*/}
          <div className="card"> {/* a card is basically a container that has some styling with it*/}
            <h3>Reports Overview</h3>
            <p>View sustainability reports submitted by users.</p>
            <Link href="/admin/report" className="primary-btn" prefetch={false}>Go to Reports</Link> {/* this link will take you to the reports page by going into the admin/report directory inside  of the application*/}
          </div>

          {/*this is the charity button for the admin page */}
             <div className="card">
              <h3>Charity</h3>
              <p>View Charity Dashboard And Its Analytics</p>
             <Link href="/admin/charity" className="primary-btn" prefetch={false}>View Charity</Link>
            </div>

          {/* this creates staff memebers, i think the admin should only be allowed to add staff members and they shouldnt be able to register through the user registration page */}
          <div className="card">
            <h3>Create Staff Account</h3>
            <p>Add new staff members to help manage users and sustainability tasks.</p>
            <Link href="/admin/create-staff" className="primary-btn"prefetch={false}>Create Staff</Link> {/* this link will take you to the create staff page by going into the admin/create-staff directory inside  of the application*/}
          </div>

          {/* this allows the admin to promote donors into staff members if they want to, the data of that user will be removed if they are de promoted*/}
          <div className="card">
            <h3>Promote / Depromote</h3>
            <p>Promote donors to staff or depromote staff back to donors.</p>
            <Link href="/admin/promote" className="primary-btn" prefetch={false}>Manage Roles</Link>

      
          </div>
        </div>
      </div>
    </div>
  );
}
