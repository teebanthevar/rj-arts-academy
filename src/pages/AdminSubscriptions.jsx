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
        .select("id, full_name, email, subscription_tier, avatar_url, role");
      if (error) throw error;
      setAllUsers(data || []);
    } catch (err) {
      console.error("Error fetching users for admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeUserTier = async (userId, newTier, userRole) => {
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

      // Preschool accounts are teachers/institutions, not tutors or
      // students — they don't have a row in the tutors table, so
      // writing to "tutor_subscriptions" (which is FK-constrained to
      // tutor accounts) fails for them. Only sync it for tutor/student
      // roles; preschools go straight to the generic "subscriptions"
      // table below, which is what PreschoolDashboard actually reads.
      const isPreschool = userRole === "preschool";

      if (!isPreschool) {
        // 3. Explicit check if a subscription row already exists for this user
        //    (tutor-specific dashboards read this one)
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
      }

      // 4. Sync the generic "subscriptions" table too.
      //    This is the table non-tutor dashboards (e.g. PreschoolDashboard)
      //    actually read from. For preschool accounts this is the ONLY
      //    lock-state table that matters.
      const { data: existingGenericSub, error: genericFetchError } =
        await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

      if (genericFetchError) {
        console.error(
          "Error checking existing generic subscription:",
          genericFetchError
        );
      }

      let genericSubError = null;

      if (existingGenericSub) {
        const { error: updateGenericErr } = await supabase
          .from("subscriptions")
          .update({
            tier: newTier,
            status: isPaid ? "active" : "inactive",
          })
          .eq("user_id", userId);
        genericSubError = updateGenericErr;
      } else {
        const { error: insertGenericErr } = await supabase
          .from("subscriptions")
          .insert([
            {
              user_id: userId,
              tier: newTier,
              status: isPaid ? "active" : "inactive",
            },
          ]);
        genericSubError = insertGenericErr;
      }

      if (genericSubError) {
        console.error("Error saving subscriptions:", genericSubError);
        alert(
          "Tier updated, but failed to sync the general subscription lock state (used by preschool accounts). Check console."
        );
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
                    onClick={() => handleUpgradeUserTier(u.id, "Student Pro", u.role)}
                    className="btn-pro"
                  >
                    Set Pro ($15)
                  </button>
                  <button 
                    onClick={() => handleUpgradeUserTier(u.id, "Instructor Pass", u.role)}
                    className="btn-instructor"
                  >
                    Set Instructor ($49)
                  </button>
                  <button 
                    onClick={() => handleUpgradeUserTier(u.id, "Free Starter", u.role)}
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