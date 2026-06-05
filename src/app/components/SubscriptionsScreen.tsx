import { useEffect, useState, useMemo } from "react";
import { Search, Grid, List, Filter, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { SUBSCRIPTIONS, LINKED_ACCOUNTS, Subscription } from "./data";
import { SubscriptionCard } from "./SubscriptionCard";

const SOURCES = ["All", "Auto-detected", "Manual"] as const;
type SourceKey = (typeof SOURCES)[number];

const USAGE_LEVELS = ["All", "Heavy use", "Moderate use", "Rarely used"] as const;
type UsageKey = (typeof USAGE_LEVELS)[number];

interface SubscriptionsScreenProps {
  onSelect: (id: string) => void;
  onAdd: () => void;
  onFilterOpenChange?: (open: boolean) => void;
  initialUsageFilter?: string;
}

const CATEGORIES = ["Entertainment", "Music", "Productivity", "AI Tools", "Design", "Storage", "Developer Tools", "Security", "Education"];

function subMatchesLinkedAccount(subAccount: string, linkedAccountName: string): boolean {
  if (linkedAccountName.includes("@")) return subAccount === linkedAccountName;
  const suffix = linkedAccountName.match(/••\d+/)?.[0];
  if (suffix) return subAccount.includes(suffix);
  return subAccount === linkedAccountName;
}
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function CalendarView({ subs, onSelect }: { subs: Subscription[]; onSelect: (id: string) => void }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  // shift so week starts Monday
  const leadingBlanks = (firstDay + 6) % 7;

  const renewalsByDay = useMemo(() => {
    const map: Record<number, Subscription[]> = {};
    subs.forEach((sub) => {
      const d = new Date(sub.nextRenewal);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(sub);
      }
    });
    return map;
  }, [subs, year, month]);

  const prevMonth = () => { setSelectedDay(null); if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { setSelectedDay(null); if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const cells: (number | null)[] = [...Array(leadingBlanks).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

  // List to show below: either selected day's renewals, or this week's
  const listSubs: { sub: Subscription; day: number }[] = useMemo(() => {
    if (selectedDay !== null) {
      return (renewalsByDay[selectedDay] || []).map(sub => ({ sub, day: selectedDay }));
    }
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    if (!isCurrentMonth) {
      return Object.entries(renewalsByDay)
        .sort(([a], [b]) => Number(a) - Number(b))
        .flatMap(([day, ss]) => ss.map(sub => ({ sub, day: Number(day) })));
    }
    const todayDate = today.getDate();
    const endOfWeek = todayDate + (7 - ((today.getDay() + 6) % 7) - 1);
    return Object.entries(renewalsByDay)
      .filter(([d]) => Number(d) >= todayDate && Number(d) <= endOfWeek)
      .sort(([a], [b]) => Number(a) - Number(b))
      .flatMap(([day, ss]) => ss.map(sub => ({ sub, day: Number(day) })));
  }, [selectedDay, renewalsByDay, year, month]);

  const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmtDate = (day: number) => `${MONTHS_SHORT[month]} ${day}`;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", marginBottom: "16px" }}>
        <button onClick={prevMonth} style={{ padding: "8px", borderRadius: "10px", background: "var(--app-surface)", border: "none", cursor: "pointer", display: "flex" }}>
          <ChevronLeft size={16} color="var(--app-text-secondary)" />
        </button>
        <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--app-text-primary)" }}>
          {MONTHS[month]} {year}
        </span>
        <button onClick={nextMonth} style={{ padding: "8px", borderRadius: "10px", background: "var(--app-surface)", border: "none", cursor: "pointer", display: "flex" }}>
          <ChevronRight size={16} color="var(--app-text-secondary)" />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0 16px", marginBottom: "8px" }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{ textAlign: "left", paddingLeft: "4px", fontSize: "12px", color: "var(--app-text-muted)", fontWeight: 500 }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0 16px", gap: "6px" }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const renewals = renewalsByDay[day] || [];
          const hasRenewals = renewals.length > 0;
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isSelected = selectedDay === day;
          return (
            <button
              key={i}
              onClick={() => hasRenewals && setSelectedDay(isSelected ? null : day)}
              disabled={!hasRenewals}
              style={{
                aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                borderRadius: "12px", padding: 0, position: "relative",
                background: isSelected ? "var(--app-blue-bg)" : "var(--app-card)",
                border: `${isToday || isSelected ? 2 : 1}px solid ${
                  isSelected ? "var(--app-blue)" : isToday ? "var(--app-text-primary)" : "var(--app-border)"
                }`,
                cursor: hasRenewals ? "pointer" : "default",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{
                fontSize: "14px",
                color: isSelected ? "var(--app-blue)" : "var(--app-text-primary)",
                fontWeight: isToday || isSelected ? 600 : 400,
                lineHeight: 1,
              }}>
                {day}
              </span>
              {hasRenewals && (
                <span style={{
                  position: "absolute", bottom: "6px",
                  width: "4px", height: "4px", borderRadius: "50%",
                  background: isSelected ? "var(--app-blue)" : "var(--app-text-primary)",
                }} />
              )}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "24px 20px 0" }}>
        <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "12px" }}>
          {selectedDay !== null
            ? `${MONTHS_SHORT[month]} ${selectedDay}`
            : (today.getFullYear() === year && today.getMonth() === month ? "This week" : "This month")}
        </p>
        {listSubs.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--app-text-muted)" }}>No renewals.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {listSubs.map(({ sub, day }, idx) => (
              <button
                key={`${sub.id}-${idx}`}
                onClick={() => onSelect(sub.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 0", width: "100%", textAlign: "left",
                  background: "transparent",
                  borderTop: idx === 0 ? "none" : "1px dashed var(--app-border)",
                  borderLeft: "none", borderRight: "none", borderBottom: "none",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: sub.color + "22", flexShrink: 0,
                  fontSize: "16px", fontWeight: 700, color: "var(--app-text-primary)",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {sub.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--app-text-primary)", lineHeight: 1.2 }}>{sub.name}</p>
                  <p style={{ fontSize: "12px", color: "var(--app-text-muted)", marginTop: "2px", fontFamily: "'DM Mono', monospace" }}>
                    {fmtDate(day)} · ${sub.amount}
                  </p>
                </div>
                <ChevronRight size={16} color="var(--app-text-muted)" />
              </button>
            ))}
            <div style={{ borderTop: "1px dashed var(--app-border)" }} />
          </div>
        )}
      </div>
    </div>
  );
}

export function SubscriptionsScreen({ onSelect, onAdd, onFilterOpenChange, initialUsageFilter }: SubscriptionsScreenProps) {
  const variantB = new URLSearchParams(window.location.search).get("v") === "b";
  const [view, setView] = useState<"list" | "calendar">("list");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [source, setSource] = useState<SourceKey>("All");
  const [accounts, setAccounts] = useState<Set<string>>(new Set());
  const [usage, setUsage] = useState<UsageKey>((initialUsageFilter as UsageKey) ?? "All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { onFilterOpenChange?.(filterOpen); }, [filterOpen, onFilterOpenChange]);

  const activeFilterCount = (categories.size > 0 ? 1 : 0) + (source !== "All" ? 1 : 0) + (usage !== "All" ? 1 : 0);

  const history = useMemo(() => SUBSCRIPTIONS.filter(s => s.status === "cancelled"), []);

  const filtered = useMemo(() => SUBSCRIPTIONS.filter(s => s.status !== "cancelled").filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categories.size === 0 || categories.has(s.category);
    let matchSrc = true;
    if (source === "Manual") {
      matchSrc = s.source === "manual";
    } else if (source === "Auto-detected") {
      if (s.source === "manual") matchSrc = false;
      else if (accounts.size > 0) matchSrc = Array.from(accounts).some(acc => subMatchesLinkedAccount(s.account, acc));
    }
    let matchUsage = true;
    if (usage === "Heavy use") matchUsage = s.usageScore >= 75;
    else if (usage === "Moderate use") matchUsage = s.usageScore >= 40 && s.usageScore < 75;
    else if (usage === "Rarely used") matchUsage = s.usageScore < 40;
    return matchSearch && matchCat && matchSrc && matchUsage;
  }), [search, categories, source, accounts, usage]);

  const grouped = useMemo(() => {
    const map: Record<string, Subscription[]> = {};
    filtered.forEach(s => {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    });
    return map;
  }, [filtered]);

  return (
    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", scrollbarWidth: "none" }}>
      <div style={{ padding: "24px 20px 12px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--app-text-primary)" }}>Subscriptions</h2>
          {!variantB && (
            <button
              onClick={onAdd}
              style={{
                display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", borderRadius: "999px",
                background: "var(--app-blue)", color: "#fff", border: "none", cursor: "pointer",
                fontSize: "12px", fontWeight: 600, boxShadow: "0 4px 12px var(--app-blue-glow)",
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Add
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "14px", marginBottom: "12px", background: "var(--app-surface)" }}>
          <Search size={15} color="var(--app-text-muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subscriptions…"
            style={{ flex: 1, background: "transparent", outline: "none", border: "none", fontSize: "14px", color: "var(--app-text-primary)", fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", borderRadius: "14px", overflow: "hidden", background: "var(--app-surface)", padding: "3px" }}>
            {(["list", "calendar"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "11px",
                  background: view === v ? "var(--app-blue)" : "transparent",
                  fontSize: "12px", color: view === v ? "#fff" : "var(--app-text-muted)",
                  fontWeight: view === v ? 600 : 400, border: "none", cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {v === "list" ? <List size={13} /> : <Grid size={13} />}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            style={{
              position: "relative", marginLeft: "auto", padding: "8px", borderRadius: "12px",
              background: activeFilterCount > 0 ? "var(--app-blue-bg)" : "var(--app-surface)",
              border: "none", cursor: "pointer", display: "flex",
            }}
          >
            <Filter size={15} color={activeFilterCount > 0 ? "var(--app-blue-label)" : "var(--app-text-muted)"} />
            {activeFilterCount > 0 && (
              <span style={{
                position: "absolute", top: "-4px", right: "-4px",
                minWidth: "16px", height: "16px", padding: "0 4px",
                borderRadius: "999px", background: "var(--app-blue)", color: "#fff",
                fontSize: "10px", fontWeight: 700, fontFamily: "'DM Mono', monospace",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {view === "list" && activeFilterCount > 0 && (
        <div style={{ display: "flex", gap: "6px", padding: "0 20px 12px", flexShrink: 0, alignItems: "center", flexWrap: "wrap" }}>
          {categories.size > 0 && (
            <ActivePill
              label={categories.size === 1 ? Array.from(categories)[0] : `${categories.size} categories`}
              onRemove={() => setCategories(new Set())}
            />
          )}
          {source !== "All" && (
            <ActivePill
              label={source === "Auto-detected" && accounts.size > 0
                ? `Auto · ${accounts.size === 1 ? Array.from(accounts)[0] : `${accounts.size} accounts`}`
                : `Source: ${source}`}
              onRemove={() => { setSource("All"); setAccounts(new Set()); }}
            />
          )}
          {usage !== "All" && (
            <ActivePill label={usage} onRemove={() => setUsage("All")} />
          )}
          <button
            onClick={() => { setCategories(new Set()); setSource("All"); setAccounts(new Set()); setUsage("All"); }}
            style={{
              padding: "4px 8px", background: "transparent", border: "none", cursor: "pointer",
              fontSize: "11px", color: "var(--app-text-muted)", fontWeight: 500,
              textDecoration: "underline",
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {filterOpen && (
        <FilterSheet
          categories={categories} setCategories={setCategories}
          source={source} setSource={setSource}
          accounts={accounts} setAccounts={setAccounts}
          usage={usage} setUsage={setUsage}
          onClose={() => setFilterOpen(false)}
        />
      )}

      <div style={{ flex: 1, paddingBottom: "16px" }}>
        {view === "list" ? (
          <div style={{ padding: "0 20px" }}>
            {Object.entries(grouped).map(([cat, subs]) => (
              <div key={cat} style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "11px", color: "var(--app-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                  {cat}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {subs.map(sub => (
                    <SubscriptionCard key={sub.id} sub={sub} onClick={() => onSelect(sub.id)} />
                  ))}
                </div>
              </div>
            ))}

            {/* History */}
            {history.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                <button
                  onClick={() => setShowHistory(v => !v)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    width: "100%", padding: "12px 0", marginBottom: "8px",
                    background: "transparent", border: "none", borderTop: "1px solid var(--app-border)",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "var(--app-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    History · {history.length}
                  </span>
                  <ChevronRight
                    size={16}
                    color="var(--app-text-muted)"
                    style={{ transform: showHistory ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}
                  />
                </button>
                {showHistory && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                    {history.map(sub => (
                      <SubscriptionCard key={sub.id} sub={sub} onClick={() => onSelect(sub.id)} variant="history" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <CalendarView subs={SUBSCRIPTIONS.filter(s => s.status !== "cancelled")} onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}

function ActivePill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "4px 4px 4px 10px", borderRadius: "999px",
      background: "var(--app-blue-bg)", color: "var(--app-blue-label)",
      fontSize: "11px", fontWeight: 600,
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{
          width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--app-blue)", border: "none", borderRadius: "50%", cursor: "pointer",
        }}
      >
        <X size={9} color="#fff" strokeWidth={3} />
      </button>
    </span>
  );
}

function FilterSheet({
  categories, setCategories, source, setSource, accounts, setAccounts, usage, setUsage, onClose,
}: {
  categories: Set<string>;
  setCategories: (c: Set<string>) => void;
  source: SourceKey;
  setSource: (s: SourceKey) => void;
  accounts: Set<string>;
  setAccounts: (a: Set<string>) => void;
  usage: UsageKey;
  setUsage: (u: UsageKey) => void;
  onClose: () => void;
}) {
  const toggleCategory = (cat: string) => {
    const next = new Set(categories);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    setCategories(next);
  };
  const toggleAccount = (acc: string) => {
    const next = new Set(accounts);
    if (next.has(acc)) next.delete(acc); else next.add(acc);
    setAccounts(next);
  };
  const handleSourceChange = (s: SourceKey) => {
    setSource(s);
    if (s !== "Auto-detected") setAccounts(new Set());
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute", inset: 0, zIndex: 60,
        display: "flex", alignItems: "flex-end",
        background: "rgba(0,0,0,0.32)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", padding: "20px 20px 24px",
          background: "var(--app-card)",
          borderTopLeftRadius: "20px", borderTopRightRadius: "20px",
          boxShadow: "0 -10px 30px rgba(0,0,0,0.16)",
          maxHeight: "80%", overflowY: "auto", scrollbarWidth: "none",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--app-text-primary)" }}>
            Filters
          </h3>
          <button
            onClick={onClose}
            style={{
              width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "50%", background: "var(--app-surface)", border: "none", cursor: "pointer",
            }}
          >
            <X size={14} color="var(--app-text-secondary)" />
          </button>
        </div>

        <FilterSection title="Category" hint="Pick one or more">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <ChipButton
              label="All"
              active={categories.size === 0}
              onClick={() => setCategories(new Set())}
            />
            {CATEGORIES.map(cat => (
              <ChipButton
                key={cat}
                label={cat}
                active={categories.has(cat)}
                onClick={() => toggleCategory(cat)}
              />
            ))}
          </div>
        </FilterSection>

        <div style={{ height: "20px" }} />

        <FilterSection title="Source" hint="Where this subscription was added from">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {(SOURCES as unknown as string[]).map(opt => (
              <ChipButton
                key={opt}
                label={opt}
                active={source === opt}
                onClick={() => handleSourceChange(opt as SourceKey)}
              />
            ))}
          </div>
        </FilterSection>

        {source === "Auto-detected" && (
          <>
            <div style={{ height: "16px" }} />
            <FilterSection title="Accounts" hint="Filter by connected account">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <ChipButton
                  label="All accounts"
                  active={accounts.size === 0}
                  onClick={() => setAccounts(new Set())}
                />
                {LINKED_ACCOUNTS.map(acc => (
                  <ChipButton
                    key={acc.id}
                    label={acc.name}
                    icon={acc.icon}
                    active={accounts.has(acc.name)}
                    onClick={() => toggleAccount(acc.name)}
                  />
                ))}
              </div>
            </FilterSection>
          </>
        )}

        <div style={{ height: "20px" }} />

        <FilterSection title="Usage" hint="Filter by how often a subscription is used">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {USAGE_LEVELS.map(level => (
              <ChipButton
                key={level}
                label={level}
                active={usage === level}
                onClick={() => setUsage(level)}
              />
            ))}
          </div>
        </FilterSection>

        <div style={{ display: "flex", gap: "8px", marginTop: "24px" }}>
          <button
            onClick={() => { setCategories(new Set()); setSource("All"); setAccounts(new Set()); setUsage("All"); }}
            style={{
              flex: 1, padding: "12px", borderRadius: "999px",
              background: "transparent", color: "var(--app-text-primary)",
              border: "1px solid var(--app-border)", cursor: "pointer",
              fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Reset
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 2, padding: "12px", borderRadius: "999px",
              background: "var(--app-blue)", color: "#fff",
              border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 4px 12px var(--app-blue-glow)",
            }}
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {title}
        </p>
        {hint && (
          <p style={{ fontSize: "11px", color: "var(--app-text-muted)", marginTop: "2px" }}>{hint}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function ChipButton({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "6px 12px", borderRadius: "999px", cursor: "pointer",
        background: active ? "var(--app-blue)" : "var(--app-surface)",
        color: active ? "#fff" : "var(--app-text-secondary)",
        border: "1px solid",
        borderColor: active ? "var(--app-blue)" : "var(--app-border)",
        fontSize: "12px", fontWeight: active ? 600 : 500,
        transition: "all 0.15s ease",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {icon && <span style={{ fontSize: "13px", lineHeight: 1 }}>{icon}</span>}
      {label}
    </button>
  );
}
