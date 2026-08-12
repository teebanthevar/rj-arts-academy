import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function PremiumRoute({ children }) {
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // 1. Check profile is_premium flag
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData?.is_premium) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // 2. Fallback: Check if they have active trial days remaining
      const { data: subData } = await supabase
        .from("tutor_subscriptions")
        .select("*")
        .eq("tutor_id", user.id)
        .maybeSingle();

      const renewalDateStr = subData?.renewal_date || "2026-08-31";
      const today = new Date();
      const renewalDate = new Date(renewalDateStr);
      const daysRemaining = Math.max(0, Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24)));

      if (daysRemaining > 0 || subData?.status === "Free Trial") {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    } catch (err) {
      console.error("Error checking access status:", err);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading access...</div>;
  }

  return hasAccess ? children : <Navigate to="/tutor/subscription" replace />;
}