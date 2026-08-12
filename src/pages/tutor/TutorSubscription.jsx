import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  HiOutlineSparkles,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineCreditCard,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import "./TutorSubscription.css";

const plans = [
  {
    id: "free",
    name: "Starter Tutor",
    price: "RM 0",
    period: "Forever Free",
    description: "Essential tools to start teaching your first group of students.",
    features: [
      "Up to 2 Active Courses",
      "Standard 15% Platform Commission",
      "Basic Analytics & Student Messaging",
      "Community Forum Support",
    ],
    buttonText: "Current Basic Plan",
    disabled: true,
    popular: false,
  },
  {
    id: "pro",
    name: "Pro Tutor",
    price: "RM 49",
    period: "/ month",
    description: "Designed for active tutors expanding their course catalog.",
    features: [
      "Up to 10 Active Courses",
      "Reduced 8% Platform Commission",
      "Advanced Student Analytics & Export",
      "Featured Badge on Course Cards",
      "Priority Email & Chat Support",
    ],
    buttonText: "Upgrade to Pro",
    disabled: false,
    popular: true,
  },
  {
    id: "premium",
    name: "Premium Master",
    price: "RM 99",
    period: "/ month",
    description: "Maximum exposure, zero commission, and full marketing power.",
    features: [
      "Unlimited Courses & Students",
      "0% Platform Commission",
      "Top Homepage Hero Placement",
      "Custom Branding & Certificate Templates",
      "Dedicated Account Manager",
    ],
    buttonText: "Upgrade to Premium",
    disabled: false,
    popular: false,
  },
];

export default function TutorSubscription() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Single source of truth: query 'tutor_subscriptions' via 'tutor_id'
      const { data, error } = await supabase
        .from("tutor_subscriptions")
        .select("*")
        .eq("tutor_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching tutor subscription:", error);
      }

      if (data) {
        setSubscription({
          plan_name: data.plan_name || "Pro Tutor",
          status: data.status || "Active",
          trial_days_remaining: data.trial_days_remaining || 30,
          renewal_date: data.renewal_date || "N/A",
        });
      } else {
        // Default values if admin hasn't created a row yet
        setSubscription({
          plan_name: "Starter Tutor",
          status: "Inactive",
          trial_days_remaining: 0,
          renewal_date: "N/A",
        });
      }
    } catch (err) {
      console.error("Error in subscription fetch wrapper:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRedirect = (planName = null, isPaymentMethod = false) => {
    const phoneNumber = "60122451679";
    let message = "";

    if (isPaymentMethod) {
      message = "Hello! I would like to update my payment methods / inquire about subscription billing for my Tutor account.";
    } else {
      message = `Hello! I am interested in subscribing/upgrading to the *${planName}* (${billingCycle.toUpperCase()} billing). Please assist me with the subscription process.`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="sub-container" style={{ boxSizing: "border-box", width: "100%", overflowX: "hidden" }}>
      {/* Page Header */}
      <div className="sub-header">
        <h1>Subscription & Billing</h1>
        <p>Manage your active membership, billing cycles, and feature upgrades.</p>
      </div>

      {/* Active Plan Banner */}
      <div className="current-plan-card">
        {loading ? (
          <p style={{ color: "#fff" }}>Loading subscription status...</p>
        ) : (
          <>
            <div className="plan-badge-group">
              <span className="trial-badge">
                <HiOutlineClock /> {subscription?.status || "Inactive"}
              </span>
              <span className="days-left">
                {subscription?.trial_days_remaining ?? 0} Days Remaining
              </span>
            </div>
            <div className="current-plan-details">
              <h2>{subscription?.plan_name || "Starter Tutor"}</h2>
              <p>
                Your account tier is: <strong>{subscription?.plan_name}</strong>. Status: <strong>{subscription?.status}</strong>. Next renewal check: <strong>{subscription?.renewal_date}</strong>.
              </p>
            </div>
            <button
              className="manage-billing-btn"
              onClick={() => handleWhatsAppRedirect(null, true)}
            >
              <HiOutlineCreditCard /> Payment Methods
            </button>
          </>
        )}
      </div>

      {/* Billing Cycle Switcher */}
      <div className="billing-cycle-toggle">
        <span className={billingCycle === "monthly" ? "active" : ""}>Monthly</span>
        <button
          className={`toggle-switch ${billingCycle}`}
          onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
        >
          <div className="toggle-knob"></div>
        </button>
        <span className={billingCycle === "yearly" ? "active" : ""}>
          Yearly <span className="discount-tag">Save 20%</span>
        </span>
      </div>

      {/* Plans Grid */}
      <div className="plans-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.popular ? "popular-card" : ""}`}
          >
            {plan.popular && (
              <div className="popular-badge">
                <HiOutlineSparkles /> Most Popular
              </div>
            )}
            <h3 className="plan-name">{plan.name}</h3>
            <p className="plan-desc">{plan.description}</p>

            <div className="plan-price-box">
              <span className="price">
                {billingCycle === "yearly" && plan.id !== "free"
                  ? `RM ${Math.round(parseInt(plan.price.replace("RM ", "")) * 0.8)}`
                  : plan.price}
              </span>
              <span className="period">{plan.period}</span>
            </div>

            <ul className="features-list">
              {plan.features.map((feat, index) => (
                <li key={index}>
                  <HiOutlineCheck className="check-icon" /> {feat}
                </li>
              ))}
            </ul>

            <button
              className={`select-plan-btn ${plan.popular ? "popular-btn" : ""}`}
              disabled={plan.disabled}
              onClick={() => handleWhatsAppRedirect(plan.name, false)}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Billing History Section */}
      <div className="billing-history-card">
        <h3>Billing History</h3>
        <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table className="history-table" style={{ width: "100%", minWidth: "500px" }}>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Date</th>
                <th>Plan Details</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="inv-id">INV-2026-001</td>
                <td>01 Jul 2026</td>
                <td>Pro Tier Activation</td>
                <td className="font-bold">RM 49.00</td>
                <td>
                  <span className="billing-status-badge">
                    <HiOutlineShieldCheck /> Completed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}