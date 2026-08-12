import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "./AdminSubscriptions.css";

export default function AdminSubscriptions() {
  const [allUsers, setAllUsers] = useState([]);
  const [adminSearch, setAdminSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllUsersForAdmin();
  }, []);

  const fetchAllUsersForAdmin = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, subscription_tier, avatar_url");
      if (error) throw error;
      setAllUsers(data || []);
    } catch (err) {
      console.error("Error fetching users for admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeUserTier = async (userId, newTier) => {
    try {
      // 1. Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ subscription_tier: newTier })
        .eq("id", userId);

      if (profileError) throw profileError;

      // 2. Map tier name and active status for tutor components
      const isPaid = newTier === "Instructor Pass" || newTier === "Student Pro";
      const planName = newTier === "Instructor Pass" ? "Pro Tutor" : newTier;
      const statusValue = isPaid ? "Active" : "Inactive";

      // 3. Explicit check if a subscription row already exists for this user
      const { data: existingSub, error: fetchError } = await supabase
        .from("tutor_subscriptions")
        .select("id")
        .eq("tutor_id", userId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error checking existing subscription:", fetchError);
      }

      let subError = null;

      if (existingSub) {
        // Update existing row
        const { error: updateErr } = await supabase
          .from("tutor_subscriptions")
          .update({
            plan_name: planName,
            status: statusValue,
            trial_days_remaining: isPaid ? 30 : 0,
            updated_at: new Date(),
          })
          .eq("tutor_id", userId);
        subError = updateErr;
      } else {
        // Insert new row if none existed
        const { error: insertErr } = await supabase
          .from("tutor_subscriptions")
          .insert([
            {
              tutor_id: userId,
              plan_name: planName,
              status: statusValue,
              trial_days_remaining: isPaid ? 30 : 0,
              renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            },
          ]);
        subError = insertErr;
      }

      if (subError) {
        console.error("Error saving tutor_subscriptions:", subError);
        alert("Tier updated in profile, but failed to sync subscription lock state. Check console.");
        return;
      }

      alert(`Successfully updated user to ${newTier}! Features unlocked.`);
      fetchAllUsersForAdmin(); // Refresh list
    } catch (err) {
      console.error("Error updating subscription:", err);
      alert("Failed to update user tier.");
    }
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      (u.full_name || "").toLowerCase().includes(adminSearch.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <div className="admin-subscriptions-container">
      <div className="admin-subscriptions-header">
        <h1>WhatsApp Payment & Subscriptions</h1>
        <p>Review manual payments sent via WhatsApp (012-2451679) and update user tiers.</p>
      </div>

      <div className="admin-subscriptions-card">
        <input 
          type="text" 
          className="admin-subscriptions-search"
          placeholder="Search users by name or email..." 
          value={adminSearch}
          onChange={(e) => setAdminSearch(e.target.value)}
        />

        {loading ? (
          <p className="admin-subscriptions-status">Loading users...</p>
        ) : filteredUsers.length > 0 ? (
          <div className="admin-users-list">
            {filteredUsers.map((u) => (
              <div key={u.id} className="admin-user-row">
                <div className="admin-user-info">
                  <h4>{u.full_name || "Unnamed User"}</h4>
                  <p>{u.email || "No email provided"}</p>
                  <p className="admin-user-tier">Current Tier: <strong>{u.subscription_tier || "Free Starter"}</strong></p>
                </div>
                <div className="admin-user-actions">
                  <button 
                    onClick={() => handleUpgradeUserTier(u.id, "Student Pro")}
                    className="btn-pro"
                  >
                    Set Pro ($15)
                  </button>
                  <button 
                    onClick={() => handleUpgradeUserTier(u.id, "Instructor Pass")}
                    className="btn-instructor"
                  >
                    Set Instructor ($49)
                  </button>
                  <button 
                    onClick={() => handleUpgradeUserTier(u.id, "Free Starter")}
                    className="btn-reset"
                  >
                    Reset Free
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-subscriptions-status">No users found matching your search.</p>
        )}
      </div>
    </div>
  );
}