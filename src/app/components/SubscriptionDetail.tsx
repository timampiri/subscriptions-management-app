import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X, ExternalLink, Pause, Trash2, ChevronRight, Calendar, CreditCard, BarChart2, RefreshCw, CheckCircle, Pencil, XCircle } from "lucide-react";
import { SUBSCRIPTIONS } from "./data";
import { SubscriptionEditForm } from "./SubscriptionEditForm";

const EDIT_CATEGORIES = ["Entertainment", "Music", "Productivity", "AI Tools", "Design", "Storage", "Developer Tools", "Security", "Education", "Other"];
const EDIT_CYCLES = ["monthly", "annual", "weekly"];
const DELETE_REASONS = [
  { id: "already_cancelled", label: "I already cancelled it with the provider" },
  { id: "incorrect_info",    label: "The information is incorrect" },
  { id: "not_mine",          label: "I don't pay for this" },
  { id: "other",             label: "Other" },
];

interface SubscriptionDetailProps {
  subscriptionId: string;
  onClose: () => void;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function SubscriptionDetail({ subscriptionId, onClose }: SubscriptionDetailProps) {
  const [stage, setStage] = useState<"idle" | "confirming" | "cancelled" | "editing" | "deleting" | "deleted">("idle");
  const [deleteReason, setDeleteReason] = useState<string | null>(null);
  const sub = SUBSCRIPTIONS.find(s => s.id === subscriptionId);
  const [locallyPaused, setLocallyPaused] = useState(sub?.status === "paused");
  const [editForm, setEditForm] = useState({
    name: sub?.name ?? "",
    amount: sub?.amount.toString() ?? "",
    billingCycle: (sub?.billingCycle ?? "monthly") as "monthly" | "annual" | "weekly",
    category: sub?.category ?? "",
    account: sub?.account ?? "",
  });

  useEffect(() => {
    if (stage === "cancelled" || stage === "deleted") {
      const t = setTimeout(onClose, 1800);
      return () => clearTimeout(t);
    }
  }, [stage, onClose]);

  if (!sub) return null;

  const monthlyEquivalent = sub.billingCycle === "monthly" ? sub.amount
    : sub.billingCycle === "annual" ? sub.amount / 12
    : sub.amount * 4.33;

  const renewalDate = new Date(sub.nextRenewal);
  const startDate = new Date(sub.startedDate);
  const monthsActive = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const totalSpent = sub.billingCycle === "monthly" ? sub.amount * monthsActive
    : sub.billingCycle === "annual" ? sub.amount * Math.floor(monthsActive / 12)
    : sub.amount * monthsActive * 4.33;
  const daysUntilRenewal = Math.ceil((renewalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const statusColor = sub.status === "active" ? "var(--app-green)" : sub.status === "paused" ? "var(--app-yellow)" : "var(--app-red)";
  const statusBg = sub.status === "active" ? "var(--app-green-bg)" : sub.status === "paused" ? "var(--app-yellow-bg)" : "var(--app-red-bg)";

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", background: "var(--app-frame-bg)", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Hero */}
      <div style={{
        position: "relative", padding: "48px 20px 32px", flexShrink: 0,
        background: `linear-gradient(180deg, ${sub.color}18 0%, var(--app-frame-bg) 100%)`,
        borderBottom: "1px solid var(--app-border)",
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "20px", right: "20px",
            width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "50%", background: "var(--app-surface)", border: "none", cursor: "pointer",
          }}
        >
          <X size={16} color="var(--app-text-secondary)" />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", background: sub.color + "22", border: `1px solid ${sub.color}44` }}>
            <span style={{ fontSize: "34px", lineHeight: 1 }}>{sub.emoji}</span>
          </div>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--app-text-primary)", lineHeight: 1.1 }}>{sub.name}</h2>
            <p style={{ fontSize: "13px", color: "var(--app-text-muted)", marginTop: "2px" }}>{sub.description}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "13px", color: "var(--app-text-muted)", marginBottom: "2px" }}>
              {sub.billingCycle === "monthly" ? "Monthly charge" : sub.billingCycle === "annual" ? "Annual charge" : "Weekly charge"}
            </p>
            <p style={{ fontSize: "38px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
              ${sub.amount.toFixed(2)}
            </p>
          </div>
          <span style={{ padding: "4px 10px", borderRadius: "999px", marginBottom: "4px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", background: statusBg, color: statusColor }}>
            {sub.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 24px", scrollbarWidth: "none" }}>
        {/* Info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          {[
            { icon: Calendar, label: "Next Renewal", value: `${MONTHS[renewalDate.getMonth()]} ${renewalDate.getDate()}`, sub: daysUntilRenewal <= 7 ? `${daysUntilRenewal} days away` : undefined, urgent: daysUntilRenewal <= 7 },
            { icon: CreditCard, label: "Payment", value: sub.account.length > 16 ? sub.account.slice(0, 16) + "…" : sub.account, sub: sub.source.charAt(0).toUpperCase() + sub.source.slice(1), urgent: false },
            { icon: RefreshCw, label: "Billing Cycle", value: sub.billingCycle.charAt(0).toUpperCase() + sub.billingCycle.slice(1), sub: `Since ${MONTHS[startDate.getMonth()]} ${startDate.getFullYear()}`, urgent: false },
            { icon: BarChart2, label: "Usage Score", value: `${sub.usageScore}%`, sub: sub.usageScore > 70 ? "High usage" : sub.usageScore > 40 ? "Moderate" : "Low — review?", urgent: sub.usageScore < 40 },
          ].map(({ icon: Icon, label, value, sub: subLabel, urgent }) => (
            <div
              key={label}
              style={{
                padding: "14px", borderRadius: "16px",
                background: urgent ? "var(--app-red-bg)" : "var(--app-card)",
                border: `1px solid ${urgent ? "var(--app-red-border)" : "var(--app-border)"}`,
                boxShadow: urgent ? "none" : "var(--app-card-shadow)",
              }}
            >
              <Icon size={14} color={urgent ? "var(--app-red)" : "var(--app-text-muted)"} style={{ marginBottom: "8px" }} />
              <p style={{ fontSize: "10px", color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>{label}</p>
              <p style={{ fontSize: "14px", color: urgent ? "var(--app-red)" : "var(--app-text-primary)", fontWeight: 600, lineHeight: 1.2 }}>{value}</p>
              {subLabel && <p style={{ fontSize: "10px", color: urgent ? "var(--app-red)" : "var(--app-text-muted)", marginTop: "2px" }}>{subLabel}</p>}
            </div>
          ))}
        </div>

        {/* Total spent */}
        <div style={{ padding: "16px", borderRadius: "16px", marginBottom: "16px", background: "var(--app-card)", border: "1px solid var(--app-border)", boxShadow: "var(--app-card-shadow)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <p style={{ fontSize: "12px", color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Spent</p>
            <p style={{ fontSize: "11px", color: "var(--app-text-muted)" }}>{monthsActive} months</p>
          </div>
          <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace" }}>
            ${totalSpent.toFixed(2)}
          </p>
          <div style={{ marginTop: "12px", height: "6px", borderRadius: "3px", overflow: "hidden", background: "var(--app-surface)" }}>
            <div style={{ height: "100%", borderRadius: "3px", width: `${sub.usageScore}%`, background: "linear-gradient(90deg, var(--app-blue), #1F4A00)" }} />
          </div>
          <p style={{ fontSize: "10px", color: "var(--app-text-muted)", marginTop: "4px" }}>{sub.usageScore}% utilisation rate</p>
        </div>

        {/* Website */}
        <button style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "16px", marginBottom: "16px", background: "var(--app-card)", border: "1px solid var(--app-border)", cursor: "pointer", boxShadow: "var(--app-card-shadow)" }}>
          <ExternalLink size={16} color="var(--app-blue)" />
          <span style={{ fontSize: "14px", color: "var(--app-blue)", flex: 1, textAlign: "left" }}>{sub.website}</span>
          <ChevronRight size={14} color="var(--app-text-muted)" />
        </button>

        {/* Actions */}
        <p style={{ fontSize: "11px", color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Actions</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={() => setStage("editing")}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "16px", background: "var(--app-card)", border: "1px solid var(--app-border)", cursor: "pointer", boxShadow: "var(--app-card-shadow)" }}
          >
            <Pencil size={16} color="var(--app-blue)" />
            <span style={{ fontSize: "14px", color: "var(--app-text-primary)", flex: 1, textAlign: "left" }}>Edit details</span>
            <ChevronRight size={14} color="var(--app-text-muted)" />
          </button>
          <button
            onClick={() => {
              const next = !locallyPaused;
              setLocallyPaused(next);
              toast(next ? `${sub.name} tracking paused` : `${sub.name} tracking resumed`, { duration: 2500 });
            }}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "16px", background: "var(--app-card)", border: "1px solid var(--app-border)", cursor: "pointer", boxShadow: "var(--app-card-shadow)" }}
          >
            <Pause size={16} color="var(--app-yellow)" />
            <div style={{ flex: 1, textAlign: "left" }}>
              <span style={{ fontSize: "14px", color: "var(--app-text-primary)", display: "block" }}>
                {locallyPaused ? "Resume subscription" : "Pause subscription"}
              </span>
              {!locallyPaused && (
                <span style={{ fontSize: "11px", color: "var(--app-text-muted)" }}>Pauses tracking in this app</span>
              )}
            </div>
            <ChevronRight size={14} color="var(--app-text-muted)" />
          </button>
          <button
            onClick={() => setStage("confirming")}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "16px", background: "var(--app-red-bg)", border: "1px solid var(--app-red-border)", cursor: "pointer" }}
          >
            <Trash2 size={16} color="var(--app-red)" />
            <span style={{ fontSize: "14px", color: "var(--app-red)", flex: 1, textAlign: "left" }}>Cancel subscription</span>
            <ChevronRight size={14} color="var(--app-red)" />
          </button>
          <button
            onClick={() => { setDeleteReason(null); setStage("deleting"); }}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "16px", background: "transparent", border: "1px solid var(--app-border)", cursor: "pointer" }}
          >
            <XCircle size={16} color="var(--app-text-muted)" />
            <span style={{ fontSize: "13px", color: "var(--app-text-secondary)", flex: 1, textAlign: "left", fontWeight: 500 }}>Delete from app</span>
            <ChevronRight size={14} color="var(--app-text-muted)" />
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {stage === "confirming" && (
        <div
          onClick={() => setStage("idle")}
          style={{ position: "absolute", inset: 0, zIndex: 70, display: "flex", alignItems: "flex-end", background: "rgba(0,0,0,0.32)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", padding: "20px", background: "var(--app-card)", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", boxShadow: "0 -10px 30px rgba(0,0,0,0.16)" }}
          >
            <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "6px" }}>
              Cancel {sub.name}?
            </p>
            <p style={{ fontSize: "13px", color: "var(--app-text-secondary)", lineHeight: 1.5, marginBottom: "16px" }}>
              You'll save ${monthlyEquivalent.toFixed(2)}/mo. We'll keep the record in your history so you can resubscribe later.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setStage("idle")}
                style={{ flex: 1, padding: "12px 16px", borderRadius: "999px", background: "transparent", color: "var(--app-text-primary)", border: "1px solid var(--app-border)", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
              >
                Keep it
              </button>
              <button
                onClick={() => setStage("cancelled")}
                style={{ flex: 1, padding: "12px 16px", borderRadius: "999px", background: "var(--app-red)", color: "#fff", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success overlay — cancelled */}
      {stage === "cancelled" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 40px", background: "var(--app-frame-bg)", fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--app-red-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <CheckCircle size={36} color="var(--app-red)" strokeWidth={2} />
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "8px", textAlign: "center" }}>
            {sub.name} cancelled
          </h3>
          <p style={{ fontSize: "14px", color: "var(--app-text-secondary)", lineHeight: 1.5, textAlign: "center" }}>
            That's <span style={{ color: "var(--app-green)", fontWeight: 700 }}>${monthlyEquivalent.toFixed(2)}/mo</span> back in your pocket.
          </p>
        </div>
      )}

      {/* Delete with reason modal */}
      {stage === "deleting" && (
        <div
          onClick={() => setStage("idle")}
          style={{ position: "absolute", inset: 0, zIndex: 70, display: "flex", alignItems: "flex-end", background: "rgba(0,0,0,0.32)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", padding: "20px", background: "var(--app-card)", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", boxShadow: "0 -10px 30px rgba(0,0,0,0.16)" }}
          >
            <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "6px" }}>
              Delete {sub.name} from your app?
            </p>
            <p style={{ fontSize: "13px", color: "var(--app-text-secondary)", lineHeight: 1.5, marginBottom: "16px" }}>
              Tell us why — this helps us improve detection accuracy.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {DELETE_REASONS.map(r => {
                const selected = deleteReason === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setDeleteReason(r.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "12px 14px", borderRadius: "12px", textAlign: "left",
                      background: selected ? "var(--app-blue-bg)" : "var(--app-surface)",
                      border: `1px solid ${selected ? "var(--app-blue-border)" : "var(--app-border)"}`,
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <span style={{
                      width: "18px", height: "18px", borderRadius: "50%",
                      border: `2px solid ${selected ? "var(--app-blue)" : "var(--app-border-input)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {selected && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--app-blue)" }} />}
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--app-text-primary)", fontWeight: selected ? 600 : 400 }}>
                      {r.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setStage("idle")}
                style={{ flex: 1, padding: "12px 16px", borderRadius: "999px", background: "transparent", color: "var(--app-text-primary)", border: "1px solid var(--app-border)", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
              >
                Keep it
              </button>
              <button
                disabled={!deleteReason}
                onClick={() => setStage("deleted")}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: "999px",
                  background: deleteReason ? "var(--app-red)" : "var(--app-surface)",
                  color: deleteReason ? "#fff" : "var(--app-text-muted)",
                  border: "none", cursor: deleteReason ? "pointer" : "default",
                  fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success overlay — deleted */}
      {stage === "deleted" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 40px", background: "var(--app-frame-bg)", fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--app-surface)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <CheckCircle size={36} color="var(--app-text-primary)" strokeWidth={2} />
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "8px", textAlign: "center" }}>
            {sub.name} deleted
          </h3>
          <p style={{ fontSize: "14px", color: "var(--app-text-secondary)", lineHeight: 1.5, textAlign: "center" }}>
            Removed from your app. Thanks — we'll use this to improve detection.
          </p>
        </div>
      )}

      {/* Edit overlay (shared component) */}
      {stage === "editing" && (
        <SubscriptionEditForm
          title={`Edit ${sub.name}`}
          initialValues={editForm}
          categories={EDIT_CATEGORIES}
          cycles={EDIT_CYCLES}
          showAccountField
          primaryLabel="Save changes"
          onPrimary={(values) => { setEditForm(values as typeof editForm); setStage("idle"); }}
          secondaryLabel="Cancel"
          onSecondary={() => setStage("idle")}
          onClose={() => setStage("idle")}
        />
      )}
    </div>
  );
}
